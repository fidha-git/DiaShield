"""
Pydantic schemas for Prescriptions in DiaShield.
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class PrescriptionCreate(BaseModel):
    medicines: str
    dosage: str
    duration: str
    instructions: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class PrescriptionUpdate(BaseModel):
    medicines: Optional[str] = None
    dosage: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class PrescriptionResponse(BaseModel):
    id: int
    appointment_id: int
    doctor_id: int
    medicines: str
    dosage: str
    duration: str
    instructions: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
