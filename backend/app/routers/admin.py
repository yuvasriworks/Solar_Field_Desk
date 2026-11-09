from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_password_hash
from app.core.deps import require_role
from app.models.user import User, Customer, Worker
from app.models.service import ServiceRequest, Quotation, WorkerAssignment
from app.models.work import WorkUpdate, WorkPhoto
from app.models.payment import Payment, CashDeposit, Feedback, Notification
from app.schemas.worker import WorkerCreateRequest
from app.schemas.quotation import QuotationCreate
from app.schemas.service import WorkerAssignmentCreate

router = APIRouter(prefix="/admin", tags=["Admin Management Desk"])

@router.get("/dashboard-stats")
def get_admin_dashboard_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    total_customers = db.query(Customer).count()
    total_workers = db.query(Worker).count()
    total_requests = db.query(ServiceRequest).count()
    
    pending_requests = db.query(ServiceRequest).filter(ServiceRequest.status == "request_submitted").count()
    pending_quotations = db.query(ServiceRequest).filter(ServiceRequest.status.in_(["under_review", "quotation_sent"])).count()
    confirmed_services = db.query(ServiceRequest).filter(ServiceRequest.status == "quotation_approved").count()
    active_jobs = db.query(ServiceRequest).filter(ServiceRequest.status.in_(["worker_assigned", "in_progress"])).count()
    completed_jobs = db.query(ServiceRequest).filter(ServiceRequest.status.in_(["work_completed", "payment_verified", "closed"])).count()
    pending_payments = db.query(Payment).filter(Payment.status == "pending").count()
    
    verified_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "verified").scalar() or 0.0

    return {
        "total_customers": total_customers,
        "total_workers": total_workers,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "pending_quotations": pending_quotations,
        "confirmed_services": confirmed_services,
        "active_jobs": active_jobs,
        "completed_jobs": completed_jobs,
        "pending_payments": pending_payments,
        "total_revenue": verified_revenue,
    }

# ==================== CUSTOMER MANAGEMENT ====================
@router.get("/customers")
def get_all_customers(
    search: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(Customer)
    if search:
        query = query.filter(
            (Customer.full_name.ilike(f"%{search}%")) |
            (Customer.city.ilike(f"%{search}%")) |
            (Customer.phone.ilike(f"%{search}%"))
        )
    customers = query.order_by(Customer.created_at.desc()).all()
    
    res = []
    for c in customers:
        req_count = db.query(ServiceRequest).filter(ServiceRequest.customer_id == c.id).count()
        res.append({
            "id": c.id,
            "user_id": c.user_id,
            "full_name": c.full_name,
            "email": c.user.email if c.user else "N/A",
            "phone": c.phone,
            "address": c.address,
            "city": c.city,
            "pincode": c.pincode,
            "total_requests": req_count,
            "is_active": c.user.is_active if c.user else True,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return res

# ==================== WORKER MANAGEMENT ====================
@router.get("/workers")
def get_all_workers(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    workers = db.query(Worker).order_by(Worker.created_at.desc()).all()
    res = []
    for w in workers:
        active_assignments = db.query(WorkerAssignment).join(ServiceRequest).filter(
            WorkerAssignment.worker_id == w.id,
            ServiceRequest.status.in_(["worker_assigned", "in_progress"]),
        ).count()
        completed_assignments = db.query(WorkerAssignment).join(ServiceRequest).filter(
            WorkerAssignment.worker_id == w.id,
            ServiceRequest.status.in_(["work_completed", "payment_verified", "closed"]),
        ).count()

        avg_rating = db.query(func.avg(Feedback.rating)).filter(Feedback.worker_id == w.id).scalar()

        res.append({
            "id": w.id,
            "user_id": w.user_id,
            "worker_code": w.worker_code,
            "full_name": w.full_name,
            "email": w.user.email if w.user else "N/A",
            "phone": w.phone,
            "skills": w.skills,
            "experience_years": w.experience_years,
            "profile_photo": w.profile_photo,
            "is_available": w.is_available,
            "is_active": w.user.is_active if w.user else True,
            "active_jobs_count": active_assignments,
            "completed_jobs_count": completed_assignments,
            "average_rating": round(float(avg_rating), 1) if avg_rating else 5.0,
            "created_at": w.created_at.isoformat() if w.created_at else None,
        })
    return res

@router.post("/workers")
def create_worker(
    payload: WorkerCreateRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    new_user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        role="worker",
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Generate unique worker code WRK-101, etc.
    count = db.query(Worker).count() + 101
    code = f"WRK-{count:03d}"

    worker_profile = Worker(
        user_id=new_user.id,
        worker_code=code,
        full_name=payload.full_name,
        phone=payload.phone,
        skills=payload.skills,
        experience_years=payload.experience_years,
        is_available=True,
    )
    db.add(worker_profile)
    db.commit()

    return {"message": "Worker account created successfully!", "worker_code": code}

@router.put("/workers/{worker_id}/toggle-status")
def toggle_worker_status(
    worker_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    worker.is_available = not worker.is_available
    db.commit()
    return {"message": f"Worker availability set to {worker.is_available}", "is_available": worker.is_available}

# ==================== SERVICE REQUESTS ====================
@router.get("/requests")
def get_all_service_requests(
    service_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(ServiceRequest)
    if service_type:
        query = query.filter(ServiceRequest.service_type == service_type)
    if status_filter:
        query = query.filter(ServiceRequest.status == status_filter)
    if search:
        query = query.filter(
            (ServiceRequest.request_code.ilike(f"%{search}%")) |
            (ServiceRequest.city.ilike(f"%{search}%")) |
            (ServiceRequest.service_address.ilike(f"%{search}%"))
        )

    requests = query.order_by(ServiceRequest.created_at.desc()).all()
    res = []
    for r in requests:
        cust = r.customer
        latest_quote = db.query(Quotation).filter(Quotation.request_id == r.id).order_by(Quotation.created_at.desc()).first()
        latest_assignment = db.query(WorkerAssignment).filter(WorkerAssignment.request_id == r.id).order_by(WorkerAssignment.created_at.desc()).first()
        payment = db.query(Payment).filter(Payment.request_id == r.id).order_by(Payment.created_at.desc()).first()

        res.append({
            "id": r.id,
            "request_code": r.request_code,
            "service_type": r.service_type,
            "property_type": r.property_type,
            "capacity_kw": r.capacity_kw,
            "problem_category": r.problem_category,
            "problem_description": r.problem_description,
            "service_address": r.service_address,
            "city": r.city,
            "pincode": r.pincode,
            "preferred_date": r.preferred_date,
            "site_photos": r.site_photos,
            "status": r.status,
            "admin_remarks": r.admin_remarks,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "customer": {
                "id": cust.id if cust else None,
                "name": cust.full_name if cust else "Unknown",
                "phone": cust.phone if cust else "N/A",
                "email": cust.user.email if cust and cust.user else "N/A",
            },
            "quotation": {
                "id": latest_quote.id,
                "total_amount": latest_quote.total_amount,
                "status": latest_quote.status,
            } if latest_quote else None,
            "assigned_worker": {
                "id": latest_assignment.worker.id,
                "name": latest_assignment.worker.full_name,
                "phone": latest_assignment.worker.phone,
                "date": latest_assignment.scheduled_date,
            } if latest_assignment and latest_assignment.worker else None,
            "payment": {
                "id": payment.id,
                "amount": payment.amount,
                "method": payment.payment_method,
                "status": payment.status,
            } if payment else None,
        })
    return res

# ==================== QUOTATION MANAGEMENT ====================
@router.post("/requests/{request_id}/quotation")
def create_and_send_quotation(
    request_id: int,
    payload: QuotationCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")

    total = payload.material_cost + payload.labour_charges + (payload.additional_charges or 0.0)
    
    # Check revision number
    existing_count = db.query(Quotation).filter(Quotation.request_id == req.id).count()

    quotation = Quotation(
        request_id=req.id,
        revision_number=existing_count + 1,
        material_cost=payload.material_cost,
        labour_charges=payload.labour_charges,
        additional_charges=payload.additional_charges or 0.0,
        total_amount=total,
        estimated_duration=payload.estimated_duration or "1-2 Days",
        notes=payload.notes,
        status="sent",
    )
    db.add(quotation)

    req.status = "quotation_sent"

    # Notify customer
    if req.customer and req.customer.user:
        db.add(Notification(
            user_id=req.customer.user.id,
            title="Quotation Received!",
            message=f"Admin sent quotation of ₹{total:,.2f} for {req.request_code}. Please review and approve.",
            link=f"/customer/requests/{req.id}",
        ))

    db.commit()
    return {"message": "Quotation prepared and sent to customer!", "quotation_id": quotation.id, "total_amount": total}

# ==================== WORKER ASSIGNMENT ====================
@router.post("/requests/{request_id}/assign-worker")
def assign_worker_to_request(
    request_id: int,
    payload: WorkerAssignmentCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")

    worker = db.query(Worker).filter(Worker.id == payload.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")

    assignment = WorkerAssignment(
        request_id=req.id,
        worker_id=worker.id,
        scheduled_date=payload.scheduled_date,
        scheduled_time=payload.scheduled_time or "09:00 AM",
        instructions=payload.instructions or f"Perform {req.service_type} at customer site.",
        status="assigned",
    )
    db.add(assignment)

    req.status = "worker_assigned"

    # Log initial work update
    db.add(WorkUpdate(
        request_id=req.id,
        worker_id=worker.id,
        status_update="assigned",
        remarks=f"Assigned to {worker.full_name} for {payload.scheduled_date}",
    ))

    # Notify Worker
    if worker.user:
        db.add(Notification(
            user_id=worker.user.id,
            title="New Job Assigned!",
            message=f"You have been assigned to {req.request_code} in {req.city} on {payload.scheduled_date}.",
            link=f"/worker/jobs",
        ))

    # Notify Customer
    if req.customer and req.customer.user:
        db.add(Notification(
            user_id=req.customer.user.id,
            title="Technician Assigned!",
            message=f"Technician {worker.full_name} (ID: {worker.worker_code}) has been assigned to your service scheduled on {payload.scheduled_date}.",
            link=f"/customer/requests/{req.id}",
        ))

    db.commit()
    return {"message": f"Worker {worker.full_name} assigned successfully!", "assignment_id": assignment.id}

# ==================== WORK MONITORING ====================
@router.get("/monitoring")
def get_work_monitoring(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    assignments = db.query(WorkerAssignment).order_by(WorkerAssignment.created_at.desc()).all()
    res = []
    for a in assignments:
        req = a.service_request
        if not req:
            continue
        worker = a.worker
        photos = db.query(WorkPhoto).filter(WorkPhoto.request_id == req.id).all()
        updates = db.query(WorkUpdate).filter(WorkUpdate.request_id == req.id).order_by(WorkUpdate.created_at.desc()).all()

        res.append({
            "request_id": req.id,
            "request_code": req.request_code,
            "service_type": req.service_type,
            "customer_name": req.customer.full_name if req.customer else "N/A",
            "worker_name": worker.full_name if worker else "N/A",
            "worker_phone": worker.phone if worker else "N/A",
            "scheduled_date": a.scheduled_date,
            "status": req.status,
            "latest_update": updates[0].remarks if updates else "Assigned",
            "photos_count": len(photos),
            "photos": [{"type": p.photo_type, "url": p.file_url} for p in photos],
        })
    return res

# ==================== PAYMENT & CASH VERIFICATION ====================
@router.get("/payments")
def get_all_payments(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    deposits = db.query(CashDeposit).order_by(CashDeposit.created_at.desc()).all()

    payment_list = []
    for p in payments:
        req = p.service_request
        cust = p.customer
        worker = db.query(Worker).filter(Worker.id == p.collected_by_worker_id).first() if p.collected_by_worker_id else None

        payment_list.append({
            "id": p.id,
            "request_id": p.request_id,
            "request_code": req.request_code if req else "N/A",
            "customer_name": cust.full_name if cust else "N/A",
            "customer_phone": cust.phone if cust else "N/A",
            "amount": p.amount,
            "payment_method": p.payment_method,
            "transaction_ref": p.transaction_ref,
            "payment_proof": p.payment_proof,
            "collected_by_worker": worker.full_name if worker else None,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "verified_at": p.verified_at.isoformat() if p.verified_at else None,
        })

    deposit_list = []
    for d in deposits:
        worker = d.worker
        deposit_list.append({
            "id": d.id,
            "worker_id": d.worker_id,
            "worker_name": worker.full_name if worker else "N/A",
            "worker_code": worker.worker_code if worker else "N/A",
            "amount": d.amount,
            "reference_note": d.reference_note,
            "deposit_status": d.deposit_status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "verified_at": d.verified_at.isoformat() if d.verified_at else None,
        })

    return {"payments": payment_list, "cash_deposits": deposit_list}

@router.post("/payments/{payment_id}/verify")
def verify_payment(
    payment_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    payment.status = "verified"
    payment.verified_by_admin_id = current_user.id
    payment.verified_at = datetime.now(timezone.utc)

    # Check if request can be moved to payment_verified
    req = payment.service_request
    if req:
        req.status = "payment_verified"
        if req.customer and req.customer.user:
            db.add(Notification(
                user_id=req.customer.user.id,
                title="Payment Verified & Receipt Ready!",
                message=f"Your payment of ₹{payment.amount:,.2f} for {req.request_code} has been verified by Admin.",
                link=f"/customer/requests/{req.id}",
            ))

    db.commit()
    return {"message": "Payment verified successfully!", "payment_id": payment.id}

@router.post("/cash-deposits/{deposit_id}/verify")
def verify_cash_deposit(
    deposit_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    deposit = db.query(CashDeposit).filter(CashDeposit.id == deposit_id).first()
    if not deposit:
        raise HTTPException(status_code=404, detail="Cash deposit not found.")

    deposit.deposit_status = "verified"
    deposit.verified_by_admin_id = current_user.id
    deposit.verified_at = datetime.now(timezone.utc)

    # Notify Worker
    if deposit.worker and deposit.worker.user:
        db.add(Notification(
            user_id=deposit.worker.user.id,
            title="Cash Deposit Verified",
            message=f"Admin verified your cash handover of ₹{deposit.amount:,.2f}. Receipt registered.",
            link=f"/worker/payments",
        ))

    db.commit()
    return {"message": "Cash deposit verified successfully!", "deposit_id": deposit.id}

# ==================== SERVICE CLOSURE ====================
@router.post("/requests/{request_id}/close")
def close_service_request(
    request_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    req = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")

    req.status = "closed"

    if req.customer and req.customer.user:
        db.add(Notification(
            user_id=req.customer.user.id,
            title="Service Officially Completed & Closed!",
            message=f"Your service {req.request_code} is officially closed. Please rate our technician and provide feedback.",
            link=f"/customer/requests/{req.id}",
        ))

    db.commit()
    return {"message": f"Service request {req.request_code} closed successfully!", "status": req.status}

# ==================== REPORTS & ANALYTICS ====================
@router.get("/reports")
def get_admin_reports(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    installations_count = db.query(ServiceRequest).filter(ServiceRequest.service_type == "installation").count()
    maintenance_count = db.query(ServiceRequest).filter(ServiceRequest.service_type == "maintenance").count()
    
    closed_services = db.query(ServiceRequest).filter(ServiceRequest.status == "closed").count()
    active_services = db.query(ServiceRequest).filter(ServiceRequest.status.in_(["worker_assigned", "in_progress"])).count()
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "verified").scalar() or 0.0
    pending_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "pending").scalar() or 0.0
    
    avg_system_rating = db.query(func.avg(Feedback.rating)).scalar() or 5.0

    return {
        "installations_count": installations_count,
        "maintenance_count": maintenance_count,
        "closed_services": closed_services,
        "active_services": active_services,
        "total_verified_revenue": total_revenue,
        "pending_revenue": pending_revenue,
        "average_customer_rating": round(float(avg_system_rating), 1),
    }
