"""
Pydantic schemas for Doctor Notes in DiaShield.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class DoctorNoteCreate(BaseModel):
    diagnosis: str
    notes: Optional[str] = None
    medicines: Optional[str] = None
    advice: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class DoctorNoteUpdate(BaseModel):
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    medicines: Optional[str] = None
    advice: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class DoctorNoteResponse(BaseModel):
    id: int
    appointment_id: int
    doctor_id: int
    diagnosis: str
    notes: Optional[str] = None
    medicines: Optional[str] = None
    advice: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
