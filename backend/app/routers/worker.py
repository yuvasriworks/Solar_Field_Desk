from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, Worker
from app.models.service import ServiceRequest, Quotation, WorkerAssignment
from app.models.work import WorkUpdate, WorkPhoto
from app.models.payment import Payment, CashDeposit, Notification
from app.schemas.service import StatusUpdateCreate
from app.schemas.worker import WorkCompletionRequest
from app.schemas.payment import CashDepositRequest

router = APIRouter(prefix="/worker", tags=["Worker Field Operations"])

def get_worker_profile(user: User, db: Session) -> Worker:
    worker = db.query(Worker).filter(Worker.user_id == user.id).first()
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found for current user.",
        )
    return worker

@router.get("/dashboard-stats")
def get_worker_stats(
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    assignments = db.query(WorkerAssignment).filter(WorkerAssignment.worker_id == worker.id).all()
    
    total_assigned = len(assignments)
    ongoing_jobs = 0
    completed_jobs = 0
    pending_jobs = 0

    for a in assignments:
        req = a.service_request
        if not req:
            continue
        if req.status in ["worker_assigned"]:
            pending_jobs += 1
        elif req.status in ["in_progress"]:
            ongoing_jobs += 1
        elif req.status in ["work_completed", "payment_verified", "closed"]:
            completed_jobs += 1

    # Calculate cash collected pending handover to admin
    cash_payments = db.query(Payment).filter(
        Payment.collected_by_worker_id == worker.id,
        Payment.payment_method == "cash",
    ).all()
    total_cash_collected = sum(p.amount for p in cash_payments)

    deposits = db.query(CashDeposit).filter(
        CashDeposit.worker_id == worker.id,
        CashDeposit.deposit_status == "verified",
    ).all()
    total_cash_deposited = sum(d.amount for d in deposits)
    cash_in_hand = max(0.0, total_cash_collected - total_cash_deposited)

    return {
        "worker_name": worker.full_name,
        "worker_code": worker.worker_code,
        "total_assigned": total_assigned,
        "pending_jobs": pending_jobs,
        "ongoing_jobs": ongoing_jobs,
        "completed_jobs": completed_jobs,
        "cash_in_hand": cash_in_hand,
        "is_available": worker.is_available,
    }

@router.get("/jobs")
def get_worker_jobs(
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    assignments = db.query(WorkerAssignment).filter(
        WorkerAssignment.worker_id == worker.id
    ).order_by(WorkerAssignment.created_at.desc()).all()

    result = []
    for a in assignments:
        r = a.service_request
        if not r:
            continue
        cust = r.customer
        latest_quote = db.query(Quotation).filter(Quotation.request_id == r.id).order_by(Quotation.created_at.desc()).first()
        payment = db.query(Payment).filter(Payment.request_id == r.id).order_by(Payment.created_at.desc()).first()

        result.append({
            "assignment_id": a.id,
            "request_id": r.id,
            "request_code": r.request_code,
            "service_type": r.service_type,
            "property_type": r.property_type,
            "capacity_kw": r.capacity_kw,
            "problem_category": r.problem_category,
            "problem_description": r.problem_description,
            "scheduled_date": a.scheduled_date,
            "scheduled_time": a.scheduled_time,
            "admin_instructions": a.instructions,
            "customer": {
                "name": cust.full_name if cust else "Customer",
                "phone": cust.phone if cust else "N/A",
                "address": r.service_address,
                "city": r.city,
                "pincode": r.pincode,
            },
            "status": r.status,
            "quotation_amount": latest_quote.total_amount if latest_quote else 0.0,
            "payment_status": payment.status if payment else "unpaid",
        })

    return result

@router.post("/jobs/{request_id}/status")
def update_job_status(
    request_id: int,
    payload: StatusUpdateCreate,
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    assignment = db.query(WorkerAssignment).filter(
        WorkerAssignment.request_id == request_id,
        WorkerAssignment.worker_id == worker.id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="You are not assigned to this job.")

    req = assignment.service_request
    
    # Valid worker progressive statuses: 'on_the_way', 'in_progress'
    valid_statuses = ["on_the_way", "in_progress"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    req.status = payload.status
    update = WorkUpdate(
        request_id=req.id,
        worker_id=worker.id,
        status_update=payload.status,
        remarks=payload.remarks or f"Technician updated status to {payload.status.replace('_', ' ').title()}",
    )
    db.add(update)

    # Notify customer
    db.add(Notification(
        user_id=req.customer.user_id,
        title=f"Worker Status: {payload.status.replace('_', ' ').title()}",
        message=f"Technician {worker.full_name} is now '{payload.status.replace('_', ' ')}' for your service {req.request_code}.",
        link=f"/customer/requests/{req.id}",
    ))

    db.commit()
    return {"message": "Status updated successfully", "current_status": req.status}

@router.post("/jobs/{request_id}/complete")
def complete_job(
    request_id: int,
    payload: WorkCompletionRequest,
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    assignment = db.query(WorkerAssignment).filter(
        WorkerAssignment.request_id == request_id,
        WorkerAssignment.worker_id == worker.id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="You are not assigned to this job.")

    req = assignment.service_request
    req.status = "work_completed"
    assignment.status = "completed"

    remarks = f"COMPLETED: {payload.completion_notes}"
    if payload.materials_used:
        remarks += f" | Materials used: {payload.materials_used}"

    update = WorkUpdate(
        request_id=req.id,
        worker_id=worker.id,
        status_update="work_completed",
        remarks=remarks,
    )
    db.add(update)

    # Notify Admin and Customer
    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        db.add(Notification(
            user_id=adm.id,
            title="Service Work Completed",
            message=f"Technician {worker.full_name} completed work for {req.request_code}. Verification & payment collection required.",
            link=f"/admin/monitoring?request_id={req.id}",
        ))
    db.add(Notification(
        user_id=req.customer.user_id,
        title="Solar Work Completed!",
        message=f"Your service {req.request_code} has been completed by {worker.full_name}. Please proceed with payment.",
        link=f"/customer/requests/{req.id}",
    ))

    db.commit()
    return {"message": "Work completion report submitted successfully!", "current_status": req.status}

@router.post("/jobs/{request_id}/photos")
def upload_work_photo(
    request_id: int,
    photo_type: str,  # 'before_work', 'after_work', 'site_inspection'
    file_url: str,
    caption: Optional[str] = None,
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    photo = WorkPhoto(
        request_id=request_id,
        worker_id=worker.id,
        photo_type=photo_type,
        file_url=file_url,
        caption=caption,
    )
    db.add(photo)
    db.commit()
    return {"message": "Photo uploaded successfully", "photo_id": photo.id}

@router.post("/jobs/{request_id}/cash-collection")
def record_cash_collection(
    request_id: int,
    amount: float,
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")

    quote = db.query(Quotation).filter(Quotation.request_id == req.id).order_by(Quotation.created_at.desc()).first()
    if not quote:
        raise HTTPException(status_code=400, detail="No active quotation found.")

    payment = Payment(
        request_id=req.id,
        quotation_id=quote.id,
        customer_id=req.customer_id,
        payment_method="cash",
        amount=amount,
        collected_by_worker_id=worker.id,
        transaction_ref=f"CASH-{req.request_code}",
        status="pending",
    )
    db.add(payment)

    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        db.add(Notification(
            user_id=adm.id,
            title="Cash Payment Collected on Site",
            message=f"Technician {worker.full_name} recorded cash payment of ₹{amount:,.2f} for {req.request_code}. Handover to Admin required.",
            link=f"/admin/payments",
        ))

    db.commit()
    return {"message": "Cash collection recorded. Please deposit cash with Admin for verification.", "payment_id": payment.id}

@router.post("/cash-deposit")
def submit_cash_deposit(
    payload: CashDepositRequest,
    current_user: User = Depends(require_role(["worker"])),
    db: Session = Depends(get_db),
):
    worker = get_worker_profile(current_user, db)
    deposit = CashDeposit(
        worker_id=worker.id,
        amount=payload.amount,
        reference_note=payload.reference_note,
        deposit_status="pending_handover",
    )
    db.add(deposit)

    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        db.add(Notification(
            user_id=adm.id,
            title="Worker Cash Handover Submitted",
            message=f"Technician {worker.full_name} submitted cash handover deposit of ₹{payload.amount:,.2f}. Admin confirmation required.",
            link=f"/admin/payments",
        ))

    db.commit()
    return {"message": "Cash handover deposit submitted to Admin for verification.", "deposit_id": deposit.id}
