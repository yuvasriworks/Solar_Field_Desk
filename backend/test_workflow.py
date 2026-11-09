import sys
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_workflow():
    print("=== STARTING FULL END-TO-END WORKFLOW TEST ===")

    # 1. Register a new customer
    print("\n1. Testing Customer Registration...")
    reg_payload = {
        "email": "priya.test@example.com",
        "password": "Customer@123",
        "full_name": "Priya Sundaram",
        "phone": "9840556677",
        "address": "45 Green Meadows, Thiruvanmiyur",
        "city": "Chennai",
        "pincode": "600041"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    if res.status_code == 400: # user exists from previous run, login instead
        res = client.post("/api/auth/login", json={"email": "priya.test@example.com", "password": "Customer@123"})
    assert res.status_code == 200, f"Registration/Login failed: {res.text}"
    cust_token = res.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}
    print("-> Customer Authenticated successfully.")

    # 2. Customer submits a new Installation request
    print("\n2. Customer submits Solar Installation Request...")
    req_payload = {
        "service_type": "installation",
        "property_type": "Residential Rooftop (RCC)",
        "capacity_kw": 5.0,
        "problem_description": "Rooftop 5kW solar installation with mono-PERC panels.",
        "service_address": "45 Green Meadows, Thiruvanmiyur",
        "city": "Chennai",
        "pincode": "600041",
        "preferred_date": "2026-11-25"
    }
    res = client.post("/api/customer/requests", json=req_payload, headers=cust_headers)
    assert res.status_code == 200, f"Submit request failed: {res.text}"
    req_data = res.json()
    req_id = req_data["request_id"]
    req_code = req_data["request_code"]
    print(f"-> Service Request Created: {req_code} (ID: {req_id})")

    # 3. Admin Logs In
    print("\n3. Admin logs in...")
    admin_login = client.post("/api/auth/login", json={"email": "admin@solar.com", "password": "Admin@123"})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("-> Admin Authenticated.")

    # 4. Admin Prepares & Sends Quotation
    print("\n4. Admin Prepares & Sends Quotation...")
    quote_payload = {
        "material_cost": 180000.0,
        "labour_charges": 20000.0,
        "additional_charges": 5000.0,
        "estimated_duration": "2 Days",
        "notes": "10x High efficiency panels, 5kW On-grid inverter, mounting structure and earthing."
    }
    res = client.post(f"/api/admin/requests/{req_id}/quotation", json=quote_payload, headers=admin_headers)
    assert res.status_code == 200, f"Create quotation failed: {res.text}"
    quote_data = res.json()
    quote_id = quote_data["quotation_id"]
    total_amount = quote_data["total_amount"]
    print(f"-> Quotation Sent: Total ₹{total_amount:,.2f} (Quotation ID: {quote_id})")

    # 5. Customer Approves Quotation
    print("\n5. Customer Approves Quotation...")
    res = client.post(f"/api/customer/quotations/{quote_id}/respond", json={"approved": True}, headers=cust_headers)
    assert res.status_code == 200, f"Quotation approval failed: {res.text}"
    print("-> Customer Approved Quotation. Status updated to confirmed.")

    # 6. Admin Assigns Worker
    print("\n6. Admin Assigns Worker (Ravi Kumar - ID 1)...")
    assign_payload = {
        "worker_id": 1,
        "scheduled_date": "2026-11-25",
        "scheduled_time": "10:00 AM",
        "instructions": "Bring mounting structure and solar modules to customer site."
    }
    res = client.post(f"/api/admin/requests/{req_id}/assign-worker", json=assign_payload, headers=admin_headers)
    assert res.status_code == 200, f"Assign worker failed: {res.text}"
    print("-> Worker Ravi Kumar Assigned successfully.")

    # 7. Worker Logs In
    print("\n7. Worker Ravi Kumar logs in...")
    w_login = client.post("/api/auth/login", json={"email": "ravi@solar.com", "password": "Worker@123"})
    assert w_login.status_code == 200, f"Worker login failed: {w_login.text}"
    worker_token = w_login.json()["access_token"]
    worker_headers = {"Authorization": f"Bearer {worker_token}"}
    print("-> Worker Authenticated.")

    # 8. Worker updates status to in_progress
    print("\n8. Worker starts work (In Progress)...")
    res = client.post(f"/api/worker/jobs/{req_id}/status", json={"status": "in_progress", "remarks": "Arrived at customer terrace. Mounting frames."}, headers=worker_headers)
    assert res.status_code == 200, f"Update status failed: {res.text}"
    print("-> Live Work Status updated to 'in_progress'.")

    # 9. Worker submits completion report
    print("\n9. Worker submits completion report...")
    comp_payload = {
        "completion_notes": "Completed full rooftop mounting, DC wiring, inverter connection, and generation test.",
        "materials_used": "10x 540W Mono-PERC modules, 5kW On-grid inverter, 40m DC cable."
    }
    res = client.post(f"/api/worker/jobs/{req_id}/complete", json=comp_payload, headers=worker_headers)
    assert res.status_code == 200, f"Completion report failed: {res.text}"
    print("-> Work Completed report submitted.")

    # 10. Customer Submits UPI Payment
    print("\n10. Customer Submits UPI Payment...")
    pay_payload = {
        "request_id": req_id,
        "quotation_id": quote_id,
        "payment_method": "upi_qr",
        "amount": total_amount,
        "transaction_ref": "UPI-IND-2026-998811"
    }
    res = client.post("/api/customer/payments", json=pay_payload, headers=cust_headers)
    assert res.status_code == 200, f"Submit payment failed: {res.text}"
    pay_id = res.json()["payment_id"]
    print(f"-> Payment recorded (ID: {pay_id}) pending admin verification.")

    # 11. Admin Verifies Payment
    print("\n11. Admin Verifies Payment...")
    res = client.post(f"/api/admin/payments/{pay_id}/verify", headers=admin_headers)
    assert res.status_code == 200, f"Verify payment failed: {res.text}"
    print("-> Payment verified successfully!")

    # 12. Admin Closes Service Request
    print("\n12. Admin Officially Closes Service Ticket...")
    res = client.post(f"/api/admin/requests/{req_id}/close", headers=admin_headers)
    assert res.status_code == 200, f"Close request failed: {res.text}"
    print("-> Service Ticket officially closed!")

    # 13. Customer Submits Rating & Feedback
    print("\n13. Customer Submits Rating & Feedback...")
    fb_payload = {
        "request_id": req_id,
        "rating": 5,
        "comments": "Outstanding work! Fast installation and very polite technician."
    }
    res = client.post("/api/customer/feedback", json=fb_payload, headers=cust_headers)
    assert res.status_code == 200, f"Submit feedback failed: {res.text}"
    print("-> 5-Star Feedback recorded.")

    print("\n=== ALL 13 STEPS COMPLETED WITH 100% SUCCESS ===")

if __name__ == "__main__":
    test_full_workflow()
