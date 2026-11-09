from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User, Customer, Worker
from app.models.service import ServiceRequest, Quotation, WorkerAssignment
from app.models.work import WorkUpdate
from app.models.payment import Notification

def seed_initial_data(db: Session):
    # Check if admin exists
    admin_user = db.query(User).filter(User.email == "admin@solar.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@solar.com",
            hashed_password=get_password_hash("Admin@123"),
            role="admin",
            is_active=True,
        )
        db.add(admin_user)
        db.flush()
        print(">> Created default admin: admin@solar.com / Admin@123")

    # Sample Workers
    worker_specs = [
        {
            "email": "ravi@solar.com",
            "password": "Worker@123",
            "name": "Ravi Kumar",
            "code": "WRK-101",
            "phone": "9840112233",
            "skills": "Rooftop PV Mounting, High-Voltage Inverters, Structural Framing",
            "exp": 4.5,
        },
        {
            "email": "suresh@solar.com",
            "password": "Worker@123",
            "name": "Suresh Selvan",
            "code": "WRK-102",
            "phone": "9840223344",
            "skills": "Solar Panel Maintenance, Thermal Inspection, Micro-inverters",
            "exp": 3.0,
        },
        {
            "email": "karthik@solar.com",
            "password": "Worker@123",
            "name": "Karthik Raj",
            "code": "WRK-103",
            "phone": "9840334455",
            "skills": "Hybrid Solar Systems, Battery Backup (BESS), Earthing & Lightning",
            "exp": 5.0,
        },
    ]

    workers = []
    for spec in worker_specs:
        w_user = db.query(User).filter(User.email == spec["email"]).first()
        if not w_user:
            w_user = User(
                email=spec["email"],
                hashed_password=get_password_hash(spec["password"]),
                role="worker",
                is_active=True,
            )
            db.add(w_user)
            db.flush()

            w_prof = Worker(
                user_id=w_user.id,
                worker_code=spec["code"],
                full_name=spec["name"],
                phone=spec["phone"],
                skills=spec["skills"],
                experience_years=spec["exp"],
                is_available=True,
            )
            db.add(w_prof)
            db.flush()
            workers.append(w_prof)
            print(f">> Created worker: {spec['email']} / {spec['password']}")
        else:
            w_prof = db.query(Worker).filter(Worker.user_id == w_user.id).first()
            workers.append(w_prof)

    # Sample Customer
    cust_user = db.query(User).filter(User.email == "anand@example.com").first()
    if not cust_user:
        cust_user = User(
            email="anand@example.com",
            hashed_password=get_password_hash("Customer@123"),
            role="customer",
            is_active=True,
        )
        db.add(cust_user)
        db.flush()

        cust_prof = Customer(
            user_id=cust_user.id,
            full_name="Anand Sharma",
            phone="9876543210",
            address="Plot No. 42, Sunrise Avenue, Velachery",
            city="Chennai",
            pincode="600042",
        )
        db.add(cust_prof)
        db.flush()
        print(">> Created sample customer: anand@example.com / Customer@123")

        # Create Demo Installation Request
        req1 = ServiceRequest(
            request_code="SOLAR-2026-1001",
            customer_id=cust_prof.id,
            service_type="installation",
            property_type="Residential Rooftop",
            capacity_kw=5.0,
            problem_description="Require complete rooftop solar installation with mono-PERC half-cut panels and 5kW on-grid inverter.",
            service_address="Plot No. 42, Sunrise Avenue, Velachery",
            city="Chennai",
            pincode="600042",
            preferred_date="2026-11-20",
            status="worker_assigned",
        )
        db.add(req1)
        db.flush()

        # Quotation for Request 1
        q1 = Quotation(
            request_id=req1.id,
            revision_number=1,
            material_cost=195000.0,
            labour_charges=25000.0,
            additional_charges=5000.0,
            total_amount=225000.0,
            estimated_duration="3 Days",
            notes="Includes 10 x 540W Mono-PERC modules, 5kW Solis inverter, aluminum mounting structure, AC/DC DB boxes, and earthing kit.",
            status="approved",
        )
        db.add(q1)
        db.flush()

        # Worker Assignment for Request 1
        if workers:
            assign1 = WorkerAssignment(
                request_id=req1.id,
                worker_id=workers[0].id,
                scheduled_date="2026-11-20",
                scheduled_time="09:30 AM",
                instructions="Site inspection and mounting structure installation on terrace.",
                status="assigned",
            )
            db.add(assign1)

            db.add(WorkUpdate(
                request_id=req1.id,
                worker_id=workers[0].id,
                status_update="assigned",
                remarks="Assigned to Ravi Kumar for execution.",
            ))

        # Demo Maintenance Request
        req2 = ServiceRequest(
            request_code="SOLAR-2026-1002",
            customer_id=cust_prof.id,
            service_type="maintenance",
            property_type="Residential Rooftop",
            capacity_kw=3.0,
            problem_category="Low Power Output & Dust Accumulation",
            problem_description="Daily generation dropped from 14 units to 8 units. Suspected loose DC string connector or heavy panel soiling.",
            service_address="Plot No. 42, Sunrise Avenue, Velachery",
            city="Chennai",
            pincode="600042",
            preferred_date="2026-11-15",
            status="request_submitted",
        )
        db.add(req2)

    db.commit()
    print(">> Database tables initialized & seed data verified.")
