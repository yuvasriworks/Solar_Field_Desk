import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, Customer, Worker
from app.models.service import ServiceRequest, Quotation, WorkerAssignment
from app.models.work import WorkUpdate, WorkPhoto
from app.models.payment import Payment, Feedback, Notification
from app.schemas.service import ServiceRequestCreate, ServiceRequestResponse
from app.schemas.quotation import QuotationDecision
from app.schemas.payment import PaymentSubmitRequest, FeedbackCreateRequest

router = APIRouter(prefix="/customer", tags=["Customer Operations"])

def get_customer_profile(user: User, db: Session) -> Customer:
    customer = db.query(Customer).filter(Customer.user_id == user.id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found for current user.",
        )
    return customer

@router.get("/dashboard-stats")
def get_customer_stats(
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    requests = db.query(ServiceRequest).filter(ServiceRequest.customer_id == customer.id).all()
    
    total_requests = len(requests)
    pending_quotes = 0
    active_services = 0
    completed_services = 0

    for r in requests:
        if r.status in ["request_submitted", "under_review", "quotation_sent"]:
            pending_quotes += 1
        elif r.status in ["quotation_approved", "worker_assigned", "in_progress"]:
            active_services += 1
        elif r.status in ["work_completed", "payment_verified", "closed"]:
            completed_services += 1

    return {
        "customer_name": customer.full_name,
        "total_requests": total_requests,
        "pending_quotations": pending_quotes,
        "active_services": active_services,
        "completed_services": completed_services,
    }

@router.post("/requests")
def submit_service_request(
    payload: ServiceRequestCreate,
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    
    # Generate unique readable request code: REQ-YYYY-RANDOM
    now = datetime.now(timezone.utc)
    code = f"SOLAR-{now.year}-{random.randint(1000, 9999)}"
    while db.query(ServiceRequest).filter(ServiceRequest.request_code == code).first():
        code = f"SOLAR-{now.year}-{random.randint(1000, 9999)}"

    new_request = ServiceRequest(
        request_code=code,
        customer_id=customer.id,
        service_type=payload.service_type,
        property_type=payload.property_type,
        capacity_kw=payload.capacity_kw,
        problem_category=payload.problem_category,
        problem_description=payload.problem_description,
        service_address=payload.service_address or customer.address,
        city=payload.city or customer.city,
        pincode=payload.pincode or customer.pincode,
        preferred_date=payload.preferred_date,
        site_photos=payload.site_photos,
        status="request_submitted",
    )
    db.add(new_request)
    db.flush()

    # Notify all admins of the new incoming request
    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        notif = Notification(
            user_id=adm.id,
            title=f"New {payload.service_type.capitalize()} Request",
            message=f"{customer.full_name} submitted request {code} in {new_request.city}.",
            link=f"/admin/requests/{new_request.id}",
        )
        db.add(notif)
    
    db.commit()
    db.refresh(new_request)

    return {
        "message": "Service request submitted successfully!",
        "request_id": new_request.id,
        "request_code": new_request.request_code,
        "status": new_request.status,
    }

@router.get("/requests")
def get_customer_requests(
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    requests = db.query(ServiceRequest).filter(
        ServiceRequest.customer_id == customer.id
    ).order_by(ServiceRequest.created_at.desc()).all()

    result = []
    for r in requests:
        # Get latest active quotation
        latest_quote = db.query(Quotation).filter(
            Quotation.request_id == r.id
        ).order_by(Quotation.created_at.desc()).first()

        # Get latest assignment
        latest_assignment = db.query(WorkerAssignment).filter(
            WorkerAssignment.request_id == r.id
        ).order_by(WorkerAssignment.created_at.desc()).first()

        assigned_worker = None
        if latest_assignment and latest_assignment.worker:
            w = latest_assignment.worker
            assigned_worker = {
                "worker_id": w.id,
                "worker_code": w.worker_code,
                "full_name": w.full_name,
                "phone": w.phone,
                "skills": w.skills,
                "profile_photo": w.profile_photo,
                "scheduled_date": latest_assignment.scheduled_date,
                "scheduled_time": latest_assignment.scheduled_time,
            }

        # Check payment record
        payment = db.query(Payment).filter(Payment.request_id == r.id).order_by(Payment.created_at.desc()).first()

        result.append({
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
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "quotation": {
                "id": latest_quote.id,
                "material_cost": latest_quote.material_cost,
                "labour_charges": latest_quote.labour_charges,
                "additional_charges": latest_quote.additional_charges,
                "total_amount": latest_quote.total_amount,
                "estimated_duration": latest_quote.estimated_duration,
                "notes": latest_quote.notes,
                "status": latest_quote.status,
                "rejection_reason": latest_quote.rejection_reason,
            } if latest_quote else None,
            "assigned_worker": assigned_worker,
            "payment": {
                "id": payment.id,
                "amount": payment.amount,
                "method": payment.payment_method,
                "status": payment.status,
                "transaction_ref": payment.transaction_ref,
            } if payment else None,
            "has_feedback": db.query(Feedback).filter(Feedback.request_id == r.id).count() > 0,
        })

    return result

@router.get("/requests/{request_id}")
def get_customer_request_details(
    request_id: int,
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    req = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id,
        ServiceRequest.customer_id == customer.id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")

    quotes = db.query(Quotation).filter(Quotation.request_id == req.id).order_by(Quotation.created_at.desc()).all()
    assignments = db.query(WorkerAssignment).filter(WorkerAssignment.request_id == req.id).all()
    updates = db.query(WorkUpdate).filter(WorkUpdate.request_id == req.id).order_by(WorkUpdate.created_at.asc()).all()
    photos = db.query(WorkPhoto).filter(WorkPhoto.request_id == req.id).all()
    payments = db.query(Payment).filter(Payment.request_id == req.id).all()
    fb = db.query(Feedback).filter(Feedback.request_id == req.id).first()

    return {
        "request": {
            "id": req.id,
            "request_code": req.request_code,
            "service_type": req.service_type,
            "property_type": req.property_type,
            "capacity_kw": req.capacity_kw,
            "problem_category": req.problem_category,
            "problem_description": req.problem_description,
            "service_address": req.service_address,
            "city": req.city,
            "pincode": req.pincode,
            "preferred_date": req.preferred_date,
            "site_photos": req.site_photos,
            "status": req.status,
            "admin_remarks": req.admin_remarks,
            "created_at": req.created_at.isoformat() if req.created_at else None,
        },
        "quotations": [
            {
                "id": q.id,
                "revision_number": q.revision_number,
                "material_cost": q.material_cost,
                "labour_charges": q.labour_charges,
                "additional_charges": q.additional_charges,
                "total_amount": q.total_amount,
                "estimated_duration": q.estimated_duration,
                "notes": q.notes,
                "status": q.status,
                "rejection_reason": q.rejection_reason,
                "created_at": q.created_at.isoformat() if q.created_at else None,
            }
            for q in quotes
        ],
        "assigned_worker": {
            "full_name": assignments[-1].worker.full_name,
            "worker_code": assignments[-1].worker.worker_code,
            "phone": assignments[-1].worker.phone,
            "skills": assignments[-1].worker.skills,
            "profile_photo": assignments[-1].worker.profile_photo,
            "scheduled_date": assignments[-1].scheduled_date,
            "scheduled_time": assignments[-1].scheduled_time,
        } if assignments and assignments[-1].worker else None,
        "progress_history": [
            {
                "status": u.status_update,
                "remarks": u.remarks,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in updates
        ],
        "work_photos": [
            {
                "id": p.id,
                "type": p.photo_type,
                "file_url": p.file_url,
                "caption": p.caption,
            }
            for p in photos
        ],
        "payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "method": p.payment_method,
                "transaction_ref": p.transaction_ref,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
        "feedback": {
            "rating": fb.rating,
            "comments": fb.comments,
            "created_at": fb.created_at.isoformat() if fb.created_at else None,
        } if fb else None,
    }

@router.post("/quotations/{quotation_id}/respond")
def respond_to_quotation(
    quotation_id: int,
    payload: QuotationDecision,
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    quote = db.query(Quotation).join(ServiceRequest).filter(
        Quotation.id == quotation_id,
        ServiceRequest.customer_id == customer.id,
    ).first()

    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found.")
    
    req = quote.service_request
    now = datetime.now(timezone.utc)
    quote.responded_at = now

    if payload.approved:
        quote.status = "approved"
        req.status = "quotation_approved"
        # Notify admins
        admins = db.query(User).filter(User.role == "admin").all()
        for adm in admins:
            db.add(Notification(
                user_id=adm.id,
                title="Quotation Approved!",
                message=f"Customer {customer.full_name} approved quotation of ₹{quote.total_amount:,.2f} for {req.request_code}. Ready for worker assignment.",
                link=f"/admin/assignments?request_id={req.id}",
            ))
        msg = "Quotation approved! Admin will now assign a technician to your service."
    else:
        quote.status = "rejected"
        quote.rejection_reason = payload.rejection_reason or "Customer requested revision or rejected quote."
        req.status = "quotation_rejected"
        admins = db.query(User).filter(User.role == "admin").all()
        for adm in admins:
            db.add(Notification(
                user_id=adm.id,
                title="Quotation Rejected / Revision Requested",
                message=f"Customer rejected quote for {req.request_code}: {quote.rejection_reason}",
                link=f"/admin/quotations?request_id={req.id}",
            ))
        msg = "Quotation response recorded. Admin will review your feedback."

    db.commit()
    return {"message": msg, "quote_status": quote.status, "request_status": req.status}

@router.post("/payments")
def submit_payment(
    payload: PaymentSubmitRequest,
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    req = db.query(ServiceRequest).filter(
        ServiceRequest.id == payload.request_id,
        ServiceRequest.customer_id == customer.id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")

    payment = Payment(
        request_id=req.id,
        quotation_id=payload.quotation_id,
        customer_id=customer.id,
        payment_method=payload.payment_method,
        amount=payload.amount,
        transaction_ref=payload.transaction_ref,
        payment_proof=payload.payment_proof,
        status="pending",
    )
    db.add(payment)
    
    # Notify admin for verification
    admins = db.query(User).filter(User.role == "admin").all()
    for adm in admins:
        db.add(Notification(
            user_id=adm.id,
            title="New Payment Submitted",
            message=f"₹{payload.amount:,.2f} submitted via {payload.payment_method.upper()} for {req.request_code}. Verification required.",
            link=f"/admin/payments",
        ))

    db.commit()
    return {
        "message": "Payment recorded successfully and submitted for Admin verification.",
        "payment_id": payment.id,
        "status": payment.status,
    }

@router.post("/feedback")
def submit_feedback(
    payload: FeedbackCreateRequest,
    current_user: User = Depends(require_role(["customer"])),
    db: Session = Depends(get_db),
):
    customer = get_customer_profile(current_user, db)
    req = db.query(ServiceRequest).filter(
        ServiceRequest.id == payload.request_id,
        ServiceRequest.customer_id == customer.id,
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Service request not found.")
    
    existing = db.query(Feedback).filter(Feedback.request_id == req.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this service.")

    # Find assigned worker if any
    assignment = db.query(WorkerAssignment).filter(WorkerAssignment.request_id == req.id).first()
    worker_id = assignment.worker_id if assignment else None

    fb = Feedback(
        request_id=req.id,
        customer_id=customer.id,
        worker_id=worker_id,
        rating=payload.rating,
        comments=payload.comments,
    )
    db.add(fb)
    db.commit()
    return {"message": "Thank you! Your feedback has been recorded."}

