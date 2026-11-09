from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class WorkerCreateRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    skills: str
    experience_years: float = 2.0

class WorkerResponse(BaseModel):
    id: int
    user_id: int
    worker_code: str
    full_name: str
    email: Optional[str] = None
    phone: str
    skills: str
    experience_years: float
    profile_photo: Optional[str] = None
    is_available: bool
    active_jobs_count: Optional[int] = 0
    completed_jobs_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class WorkCompletionRequest(BaseModel):
    completion_notes: str
    materials_used: Optional[str] = None
