# schemas/health_record_schema.py
# Pydantic schemas for HealthRecord

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class HealthRecordBase(BaseModel):
    blood_sugar: str
    glucose_period: Optional[str] = None
    blood_pressure: str
    heart_rate: str
    bmi: str
    weight: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class HealthRecordCreate(HealthRecordBase):
    pass

class HealthRecordUpdate(BaseModel):
    blood_sugar: Optional[str] = None
    glucose_period: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[str] = None
    bmi: Optional[str] = None
    weight: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class HealthRecordResponse(HealthRecordBase):
    id: int
    patient_id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)
