from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class QuotationCreate(BaseModel):
    material_cost: float
    labour_charges: float
    additional_charges: Optional[float] = 0.0
    estimated_duration: Optional[str] = "1-2 Days"
    notes: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    request_id: int
    revision_number: int
    material_cost: float
    labour_charges: float
    additional_charges: float
    total_amount: float
    estimated_duration: str
    notes: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuotationDecision(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None
