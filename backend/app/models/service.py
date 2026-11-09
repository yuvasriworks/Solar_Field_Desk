from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String(30), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    
    # 'installation' or 'maintenance'
    service_type = Column(String(30), nullable=False)
    
    property_type = Column(String(50), nullable=True)  # e.g., 'Residential Rooftop', 'Commercial'
    capacity_kw = Column(Float, nullable=True)         # Solar capacity in kW
    problem_category = Column(String(100), nullable=True) # For maintenance: 'Inverter Issue', 'Low Output', etc.
    problem_description = Column(Text, nullable=False)
    
    service_address = Column(Text, nullable=False)
    city = Column(String(80), nullable=False)
    pincode = Column(String(10), nullable=False)
    preferred_date = Column(String(30), nullable=True)
    site_photos = Column(Text, nullable=True)  # JSON-encoded array of URLs or comma-separated
    
    # Workflow Status
    # request_submitted -> under_review -> quotation_sent -> quotation_approved / quotation_rejected 
    # -> worker_assigned -> in_progress -> work_completed -> payment_verified -> closed
    status = Column(String(50), default="request_submitted", index=True)
    admin_remarks = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="service_requests")
    quotations = relationship("Quotation", back_populates="service_request", cascade="all, delete-orphan")
    assignments = relationship("WorkerAssignment", back_populates="service_request", cascade="all, delete-orphan")
    work_updates = relationship("WorkUpdate", back_populates="service_request", cascade="all, delete-orphan")
    work_photos = relationship("WorkPhoto", back_populates="service_request", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="service_request", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="service_request", uselist=False, cascade="all, delete-orphan")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False)
    revision_number = Column(Integer, default=1)
    
    material_cost = Column(Float, default=0.0)
    labour_charges = Column(Float, default=0.0)
    additional_charges = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    estimated_duration = Column(String(50), default="1-2 Days")
    notes = Column(Text, nullable=True)
    
    # 'sent', 'approved', 'rejected', 'revised'
    status = Column(String(30), default="sent")
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utcnow)
    responded_at = Column(DateTime, nullable=True)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="quotations")
    payments = relationship("Payment", back_populates="quotation")

class WorkerAssignment(Base):
    __tablename__ = "worker_assignments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    
    scheduled_date = Column(String(30), nullable=False)
    scheduled_time = Column(String(30), default="09:00 AM")
    instructions = Column(Text, nullable=True)
    
    # 'assigned', 'accepted', 'reassigned', 'completed'
    status = Column(String(30), default="assigned")
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="assignments")
    worker = relationship("Worker", back_populates="assignments")
