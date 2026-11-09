from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class ServiceRequestCreate(BaseModel):
    service_type: str  # 'installation' or 'maintenance'
    property_type: Optional[str] = "Residential Rooftop"
    capacity_kw: Optional[float] = None
    problem_category: Optional[str] = None
    problem_description: str
    service_address: str
    city: str
    pincode: str
    preferred_date: Optional[str] = None
    site_photos: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    id: int
    request_code: str
    customer_id: int
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    service_type: str
    property_type: Optional[str] = None
    capacity_kw: Optional[float] = None
    problem_category: Optional[str] = None
    problem_description: str
    service_address: str
    city: str
    pincode: str
    preferred_date: Optional[str] = None
    site_photos: Optional[str] = None
    status: str
    admin_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkerAssignmentCreate(BaseModel):
    worker_id: int
    scheduled_date: str
    scheduled_time: Optional[str] = "09:00 AM"
    instructions: Optional[str] = None

class StatusUpdateCreate(BaseModel):
    status: str
    remarks: Optional[str] = None

