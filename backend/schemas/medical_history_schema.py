# schemas/medical_history_schema.py
# Pydantic V2 schemas for Medical History

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class MedicalHistoryBase(BaseModel):
    past_illnesses: Optional[str] = None
    surgeries: Optional[str] = None
    family_history: Optional[str] = None
    chronic_diseases: Optional[str] = None
    smoking_status: Optional[str] = None
    alcohol_status: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MedicalHistoryCreate(MedicalHistoryBase):
    pass

class MedicalHistoryUpdate(BaseModel):
    past_illnesses: Optional[str] = None
    surgeries: Optional[str] = None
    family_history: Optional[str] = None
    chronic_diseases: Optional[str] = None
    smoking_status: Optional[str] = None
    alcohol_status: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MedicalHistoryResponse(MedicalHistoryBase):
    id: int
    patient_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
