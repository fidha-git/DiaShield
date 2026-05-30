"""
Pydantic schemas for Patient Dashboard
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# Nested schema for prediction response
class PredictionResponse(BaseModel):
    prediction_result: str
    risk_level: str
    probability: float

    model_config = ConfigDict(from_attributes=True)
from datetime import datetime



class HealthRecordSummary(BaseModel):
    id: int
    created_at: datetime
    summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PatientDashboardResponse(BaseModel):
    patient_name: str
    upcoming_appointments_count: int
    medical_history_count: int
    health_records_count: int
    prescription_count: int
    recent_health_records: List[HealthRecordSummary] = []
    latest_prediction: Optional[PredictionResponse] = None

    model_config = ConfigDict(from_attributes=True)
