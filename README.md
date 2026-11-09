<<<<<<< HEAD
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

=======
# ☀️ Solar Field Desk – Solar Panel Installation and Maintenance Management System

## 📌 Project Description

Solar Field Desk is a web-based application developed to manage solar panel installation and maintenance services efficiently. It provides a centralized platform connecting customers, administrators, and workers.

Customers can register, log in, request new solar panel installations, and report maintenance issues with existing solar panels. Administrators can review service requests, approve or reject applications, generate quotations and invoices, verify payments, and assign workers. Workers can view assigned jobs, visit customer locations, and update service completion details.

The main objective of this project is to simplify solar service management, improve communication, and provide transparent tracking throughout the installation and maintenance process.

## ✨ Key Features

### 👤 Customer Module
- Customer registration and login.
- Request new solar panel installation.
- Submit maintenance requests for existing solar panels.
- Maintain solar site details, including capacity and inverter information.
- Upload images of solar panel issues.
- Track service request status.
- View service history and warranty information.

### 🛠️ Admin Module
- Admin authentication and dashboard.
- View and analyze customer service requests.
- Approve or reject service applications.
- Generate quotations and invoices.
- Verify customer payments.
- Assign workers to approved service requests.
- Monitor pending and completed services.
- View service reports and history.

### 👷 Worker Module
- Worker login and dashboard.
- View assigned service requests.
- Access customer and service details.
- Update job progress.
- Submit service completion reports.

## 🔄 Project Workflow

1. Customer registers or logs in.
2. Customer selects Installation or Maintenance.
3. Customer submits a service request.
4. Admin reviews the application.
5. Admin approves or rejects the request.
6. Admin generates a quotation.
7. Customer approves the quotation.
8. Invoice is generated.
9. Customer completes payment.
10. Admin verifies the payment.
11. Admin assigns a worker.
12. Worker completes the service and updates the status.

## 💻 Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Backend | Python |
| Backend Framework | FastAPI |
| Database | SQL Database |
| API Testing | Swagger UI |
| Version Control | Git & GitHub |

## 📂 Project Structure

```text
Solar_Field_Desk/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── index.html
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

*Note: This is a logical overview. Adjust folder names to match your actual project.*

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/solar-field-desk.git
```

```bash
cd solar-field-desk
```

### 2. Frontend Setup

Open a terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install the required packages:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the frontend in your browser:

```text
http://localhost:5173
```

### 3. Backend Setup

Open another terminal and navigate to the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

**Command Prompt:**
```bash
venv\Scripts\activate
```

**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 4. API Documentation

FastAPI provides interactive API documentation through Swagger UI.

Open:

```text
http://127.0.0.1:8000/docs
```

You can test the API endpoints directly using Swagger UI.

## 🔐 Environment Configuration

Create a `.env` file inside the backend folder and configure the required environment variables.

Example:

```env
DATABASE_URL=your_database_connection_url
SECRET_KEY=your_secret_key
```

Use the variable names and configuration required by your backend settings. Do not upload real passwords, API keys, database credentials, or secret keys to GitHub.

## 🎯 Project Objective

The objective of Solar Field Desk is to digitize and streamline solar panel installation and maintenance operations. It reduces manual work, organizes service requests, improves coordination between customers, administrators, and workers, and enables efficient service tracking.

## 🚀 Future Enhancements

- Online payment gateway integration.
- Real-time service status notifications.
- Solar energy generation monitoring.
- Advanced maintenance analytics.
- Customer feedback and rating system.

## 👩‍💻 Developed By

**Solar Field Desk – Solar Panel Installation and Maintenance Management System**

Developed as an academic project.
>>>>>>> 7f5437bece04e3c7fe4596f67162665473a2061e
