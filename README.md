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
