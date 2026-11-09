from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # 'admin', 'customer', 'worker'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    # 1-to-1 relationships
    customer_profile = relationship("Customer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    worker_profile = relationship("Worker", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(80), nullable=False)
    pincode = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="customer_profile")
    service_requests = relationship("ServiceRequest", back_populates="customer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="customer")
    feedbacks = relationship("Feedback", back_populates="customer")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    worker_code = Column(String(30), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    skills = Column(String(255), default="Solar Panel Mounting, Electrical Wiring")
    experience_years = Column(Float, default=2.0)
    profile_photo = Column(String(255), nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="worker_profile")
    assignments = relationship("WorkerAssignment", back_populates="worker")
    work_updates = relationship("WorkUpdate", back_populates="worker")
    work_photos = relationship("WorkPhoto", back_populates="worker")
    cash_deposits = relationship("CashDeposit", back_populates="worker")
    feedbacks = relationship("Feedback", back_populates="worker")

