from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PaymentSubmitRequest(BaseModel):
    request_id: int
    quotation_id: int
    payment_method: str  # 'upi_qr' or 'cash'
    amount: float
    transaction_ref: Optional[str] = None
    payment_proof: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    request_id: int
    quotation_id: int
    customer_id: int
    payment_method: str
    amount: float
    transaction_ref: Optional[str] = None
    payment_proof: Optional[str] = None
    status: str
    created_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CashDepositRequest(BaseModel):
    amount: float
    reference_note: Optional[str] = "Collected cash handover"

class FeedbackCreateRequest(BaseModel):
    request_id: int
    rating: int
    comments: Optional[str] = None

