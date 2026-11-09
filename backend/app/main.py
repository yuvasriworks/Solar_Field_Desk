import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_initial_data
from app.routers import auth, customer, worker, admin, upload

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="A Role-Based Solar Service Management and Field Workforce Coordination System",
)

# Enable CORS for React frontend (Vite default is 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded site photos, completion proofs, etc.
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(customer.router, prefix="/api")
app.include_router(worker.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(upload.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "company_upi": settings.COMPANY_UPI_ID,
    }
