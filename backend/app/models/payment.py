from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False)
    quotation_id = Column(Integer, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    
    # 'upi_qr' or 'cash'
    payment_method = Column(String(30), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_ref = Column(String(100), nullable=True)
    payment_proof = Column(String(255), nullable=True)
    
    collected_by_worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    
    # 'pending', 'verified', 'rejected'
    status = Column(String(30), default="pending", index=True)
    verified_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="payments")
    quotation = relationship("Quotation", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")

class CashDeposit(Base):
    __tablename__ = "cash_deposits"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    reference_note = Column(String(150), nullable=True)
    
    # 'pending_handover', 'verified', 'discrepancy'
    deposit_status = Column(String(30), default="pending_handover")
    verified_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    worker = relationship("Worker", back_populates="cash_deposits")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id", ondelete="CASCADE"), nullable=True)
    
    rating = Column(Integer, nullable=False)  # 1 to 5
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="feedback")
    customer = relationship("Customer", back_populates="feedbacks")
    worker = relationship("Worker", back_populates="feedbacks")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(200), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
