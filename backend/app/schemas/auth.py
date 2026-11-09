from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    email: str

class CustomerRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    address: str
    city: str
    pincode: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str
    email: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    role: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    worker_code: Optional[str] = None
    skills: Optional[str] = None
    is_available: Optional[bool] = None

    class Config:
        from_attributes = True
