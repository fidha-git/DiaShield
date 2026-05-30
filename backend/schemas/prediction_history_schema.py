from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class PredictionHistoryCreate(BaseModel):
    prediction_result: str
    risk_level: str
    probability: float

    model_config = ConfigDict(from_attributes=True)

class PredictionHistoryResponse(BaseModel):
    id: int
    patient_id: int
    prediction_result: str
    risk_level: str
    probability: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
