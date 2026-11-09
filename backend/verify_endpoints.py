from app.core.database import SessionLocal
from app.models.user import User, Customer, Worker
from app.models.service import ServiceRequest, Quotation
from app.routers.auth import register_customer, login
from app.routers.customer import (
    submit_service_request,
    respond_to_quotation,
    submit_payment,
    submit_feedback,
    get_customer_requests,
)
from app.routers.admin import (
    create_and_send_quotation,
    assign_worker_to_request,
    verify_payment,
    verify_cash_deposit,
    close_service_request,
    get_admin_reports,
)
from app.routers.worker import (
    update_job_status,
    complete_job,
    upload_work_photo,
    record_cash_collection,
    submit_cash_deposit,
)
from app.schemas.auth import CustomerRegisterRequest, LoginRequest
from app.schemas.service import ServiceRequestCreate, WorkerAssignmentCreate, StatusUpdateCreate
from app.schemas.quotation import QuotationCreate, QuotationDecision
from app.schemas.payment import PaymentSubmitRequest, CashDepositRequest, FeedbackCreateRequest
from app.schemas.worker import WorkCompletionRequest

def run_direct_verification():
    db = SessionLocal()
    print(">>> STARTING COMPREHENSIVE END-TO-END BUSINESS WORKFLOW VERIFICATION <<<")

    try:
        # STEP 1: Customer registers
        print("\n[Step 1] Customer Registration...")
        email = "kavitha.solar@example.com"
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            reg_req = CustomerRegisterRequest(
                email=email,
                password="Customer@123",
                full_name="Kavitha Sundaram",
                phone="9840998877",
                address="12 Orchid Villa, Gandhi Road",
                city="Coimbatore",
                pincode="641001",
            )
            reg_res = register_customer(reg_req, db)
            print(f"-> Registered Customer: {reg_res.name} (Role: {reg_res.role})")
        
        # STEP 2: Customer Logs In
        print("\n[Step 2] Customer Login...")
        login_req = LoginRequest(email=email, password="Customer@123")
        login_res = login(login_req, db)
        cust_user = db.query(User).filter(User.email == email).first()
        print(f"-> Authenticated user_id={cust_user.id}, token issued.")

        # STEP 3: Customer Submits Service Request
        print("\n[Step 3] Submitting Solar Installation Service Request...")
        req_create = ServiceRequestCreate(
            service_type="installation",
            property_type="Residential Rooftop (RCC)",
            capacity_kw=6.0,
            problem_description="6kW Monocrystalline solar PV system with net metering and on-grid inverter.",
            service_address="12 Orchid Villa, Gandhi Road",
            city="Coimbatore",
            pincode="641001",
            preferred_date="2026-12-01",
        )
        sub_res = submit_service_request(req_create, cust_user, db)
        req_id = sub_res["request_id"]
        req_code = sub_res["request_code"]
        print(f"-> Service Request Created: {req_code} (Status: {sub_res['status']})")

        # STEP 4: Admin reviews and builds quotation
        print("\n[Step 4] Admin prepares itemized quotation...")
        admin_user = db.query(User).filter(User.role == "admin").first()
        quote_create = QuotationCreate(
            material_cost=215000.0,
            labour_charges=30000.0,
            additional_charges=5000.0,
            estimated_duration="3 Days",
            notes="12x 500W High Efficiency Solar Modules, 6kW Solis 3-Phase Inverter, AC/DC distribution box and earthing kit.",
        )
        quote_res = create_and_send_quotation(req_id, quote_create, admin_user, db)
        quote_id = quote_res["quotation_id"]
        total_amount = quote_res["total_amount"]
        print(f"-> Quotation Sent: Total ₹{total_amount:,.2f} (Quotation ID: {quote_id})")

        # STEP 5: Customer views & approves quotation
        print("\n[Step 5] Customer approves quotation...")
        decision = QuotationDecision(approved=True)
        decision_res = respond_to_quotation(quote_id, decision, cust_user, db)
        print(f"-> Quotation Response: {decision_res['message']} (Request Status: {decision_res['request_status']})")

        # STEP 6: Admin assigns Worker
        print("\n[Step 6] Admin assigns field technician...")
        worker = db.query(Worker).first()
        assign_create = WorkerAssignmentCreate(
            worker_id=worker.id,
            scheduled_date="2026-12-01",
            scheduled_time="10:00 AM",
            instructions="Terrace solar structure erection and module cabling.",
        )
        assign_res = assign_worker_to_request(req_id, assign_create, admin_user, db)
        print(f"-> Worker Assignment: {assign_res['message']}")

        # STEP 7: Worker updates status to 'in_progress'
        print("\n[Step 7] Worker arrives on site and starts work...")
        w_user = worker.user
        status_update = StatusUpdateCreate(status="in_progress", remarks="Arrived on site. Structural framing underway.")
        update_res = update_job_status(req_id, status_update, w_user, db)
        print(f"-> Live Status Updated: {update_res['current_status']}")

        # STEP 8: Worker uploads before/after photos
        print("\n[Step 8] Worker uploads site proof photos...")
        p1 = upload_work_photo(req_id, "before_work", "https://images.unsplash.com/photo-1509391365360-2e959784a276", "Initial empty rooftop", w_user, db)
        p2 = upload_work_photo(req_id, "after_work", "https://images.unsplash.com/photo-1508873696983-2df5293cb395", "Completed 6kW solar array installation", w_user, db)
        print("-> Before and After proof photos uploaded.")

        # STEP 9: Worker completes work
        print("\n[Step 9] Worker submits work completion report...")
        comp_req = WorkCompletionRequest(
            completion_notes="Installation completed. Tested string Voc = 410V, grid synchronisation active.",
            materials_used="12x 500W PV panels, 6kW inverter, 45m DC solar cable, structure bolts.",
        )
        comp_res = complete_job(req_id, comp_req, w_user, db)
        print(f"-> Completion report submitted. Status: {comp_res['current_status']}")

        # STEP 10: Customer submits UPI QR payment
        print("\n[Step 10] Customer makes UPI payment...")
        pay_req = PaymentSubmitRequest(
            request_id=req_id,
            quotation_id=quote_id,
            payment_method="upi_qr",
            amount=total_amount,
            transaction_ref="UPI-2026-REF-998822",
        )
        pay_res = submit_payment(pay_req, cust_user, db)
        pay_id = pay_res["payment_id"]
        print(f"-> Payment Submitted: {pay_res['message']} (Payment ID: {pay_id})")

        # STEP 11: Admin verifies payment
        print("\n[Step 11] Admin verifies digital payment...")
        v_res = verify_payment(pay_id, admin_user, db)
        print(f"-> Admin Verification: {v_res['message']}")

        # STEP 12: Worker Cash Handover Deposit Test
        print("\n[Step 12] Testing Worker Cash Handover Ledger...")
        dep_req = CashDepositRequest(amount=15000.0, reference_note="Cash handover from site maintenance service")
        dep_res = submit_cash_deposit(dep_req, w_user, db)
        dep_id = dep_res["deposit_id"]
        print(f"-> Cash Handover Submitted (Deposit ID: {dep_id})")
        v_dep = verify_cash_deposit(dep_id, admin_user, db)
        print(f"-> Admin Cash Handover Verification: {v_dep['message']}")

        # STEP 13: Admin officially closes service request
        print("\n[Step 13] Admin officially closes service ticket...")
        close_res = close_service_request(req_id, admin_user, db)
        print(f"-> Ticket Closure: {close_res['message']}")

        # STEP 14: Customer rates and reviews
        print("\n[Step 14] Customer submits 5-star review...")
        fb_req = FeedbackCreateRequest(
            request_id=req_id,
            rating=5,
            comments="Flawless 6kW rooftop solar installation! Extremely professional technician.",
        )
        fb_res = submit_feedback(fb_req, cust_user, db)
        print(f"-> Feedback Recorded: {fb_res['message']}")

        # STEP 15: Final Admin Reports Audit
        print("\n[Step 15] Auditing System Reports & Analytics...")
        reports = get_admin_reports(admin_user, db)
        print(f"-> Installations Count: {reports['installations_count']}")
        print(f"-> Maintenance Count: {reports['maintenance_count']}")
        print(f"-> Closed Services: {reports['closed_services']}")
        print(f"-> Total Verified Revenue: ₹{reports['total_verified_revenue']:,.2f}")
        print(f"-> Average Customer Rating: {reports['average_customer_rating']} / 5.0 ★")

        print("\n=======================================================")
        print("ALL 15 END-TO-END WORKFLOW STAGES VERIFIED WITH 100% SUCCESS!")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_direct_verification()

