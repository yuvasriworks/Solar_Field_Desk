# Solar Panel Installation and Maintenance Field Desk
**Recommended Project Title:** *A Role-Based Solar Service Management and Field Workforce Coordination System*

---

## ☀️ Project Overview

A complete full-stack solar service management desk and field workforce coordination platform connecting three roles:
1. **Admin Desk:** Complete operational control over customers, certified technicians, service request review, itemized quotations builder, technician scheduling, work quality monitoring (before/after photos), double-entry payment verification, and revenue analytics.
2. **Customer Portal:** Submit solar installation (1kW - 50kW+) or maintenance requests, review and approve/reject itemized quotations, view assigned technician identity and schedule, make verified payments via company UPI QR code or cash, and rate completed work.
3. **Worker Field Desk:** Field technician dashboard displaying scheduled jobs, site address, customer contact, live status progression (`On The Way` → `In Progress`), before/after photo evidence upload, completion reports, on-site cash collection, and cash handover deposit with Admin.

---

## 🎨 Frontend Design Theme

- **Sky Blue Color Theme:** `#38BDF8` (Sky Blue), `#E0F2FE` (Light Sky Blue), `#0284C7` (Deep Blue), `#0F2A43` (Solar Navy), `#FACC15` (Solar Yellow), `#22C55E` (Fresh Green).
- **Floating 3D-Style Solar Graphics:**
  - `FloatingSolarPanel`: 3D isometric photovoltaic panel with crystalline cell grid, metallic frame, and gentle floating loop.
  - `FloatingCloud`: Multi-layered background ambient clouds drifting across the sky.
  - `SunGlow`: Pulsing solar aura simulating bright sunlight.
  - `EnergyParticle`: Upward floating golden sparks.
  - Translucent glassmorphism cards with cyan highlights (`backdrop-filter: blur(12px)`).

---

## 🏗️ Technical Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, JWT Authentication (`python-jose`), `bcrypt` password hashing.
- **Database:** MySQL 8.0 Relational Database (with seamless local SQLite database fallback for instant zero-config startup).
- **Static Media:** Local `/uploads` directory serving site survey and technician proof photos.

---

## 📋 12 Relational Database Tables

1. `users`: Authentication credentials, roles (`admin`, `customer`, `worker`), and status.
2. `customers`: Customer profile details, phone, service address, city, and pincode.
3. `workers`: Field engineer code, skill specializations, experience years, and availability.
4. `service_requests`: Installation & maintenance tickets, kW capacity, problem description, lifecycle status.
5. `quotations`: Material cost, labour charges, additional charges, total amount, notes, revision history.
6. `worker_assignments`: Dispatched technician mapping, scheduled date, time slot, and instructions.
7. `work_updates`: Timestamped lifecycle log (`assigned`, `on_the_way`, `in_progress`, `work_completed`).
8. `work_photos`: Before/after service evidence photos uploaded from technician mobile devices.
9. `payments`: UPI QR transactions, cash records, UTR references, and Admin verification status.
10. `cash_deposits`: Double-entry ledger tracking worker cash collection handed over to Admin.
11. `feedback`: 1 to 5-star customer ratings and reviews.
12. `notifications`: Real-time in-app alerts across all three roles.

---

## 🔑 Pre-Seeded Demo Credentials

The database comes pre-seeded with real database records for immediate evaluation:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@solar.com` | `Admin@123` | Full administrative control desk |
| **Worker (Tech 1)** | `ravi@solar.com` | `Worker@123` | Ravi Kumar (WRK-101) - Rooftop PV Mounting |
| **Worker (Tech 2)** | `suresh@solar.com` | `Worker@123` | Suresh Selvan (WRK-102) - Maintenance & Cleaning |
| **Worker (Tech 3)** | `karthik@solar.com` | `Worker@123` | Karthik Raj (WRK-103) - Hybrid & Battery BESS |
| **Customer** | `anand@example.com` | `Customer@123` | Anand Sharma - 5kW Rooftop System |

---

## 🚀 Running the Project

### 1. Start the Backend (FastAPI)
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Start the Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
- Open browser at: `http://localhost:5173`

### 3. Run End-to-End Workflow Verification Script
```powershell
cd backend
python verify_endpoints.py
```
Verifies all 15 steps of the complete service lifecycle directly against database tables.

---

## 🔄 End-to-End Service Lifecycle

```
Customer Submits Request
        │
        ▼
Admin Reviews & Sends Itemized Quotation
        │
        ▼
Customer Approves Quotation
        │
        ▼
Admin Assigns Field Technician
        │
        ▼
Technician Updates Status: "On The Way" -> "In Progress"
        │
        ▼
Technician Uploads Before/After Photos & Completion Report
        │
        ▼
Customer Makes Payment (Company UPI QR or On-Site Cash)
        │
        ▼
Admin Verifies Payment / Cash Handover Deposit
        │
        ▼
Admin Closes Ticket & Customer Rates Service (1-5★)
```
