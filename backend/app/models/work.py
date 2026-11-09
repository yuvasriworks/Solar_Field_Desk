from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class WorkUpdate(Base):
    __tablename__ = "work_updates"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    
    # 'assigned', 'on_the_way', 'in_progress', 'work_completed'
    status_update = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="work_updates")
    worker = relationship("Worker", back_populates="work_updates")

class WorkPhoto(Base):
    __tablename__ = "work_photos"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_requests.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id", ondelete="CASCADE"), nullable=False)
    
    # 'before_work', 'after_work', 'site_inspection'
    photo_type = Column(String(50), nullable=False)
    file_url = Column(String(255), nullable=False)
    caption = Column(String(200), nullable=True)
    uploaded_at = Column(DateTime, default=utcnow)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="work_photos")
    worker = relationship("Worker", back_populates="work_photos")
