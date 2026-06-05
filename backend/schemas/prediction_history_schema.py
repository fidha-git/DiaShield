from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime

class PredictionHistoryCreate(BaseModel):
    prediction_result: str
    risk_level: str
    probability: float
    glucose: Optional[float] = None
    bmi: Optional[float] = None
    blood_pressure: Optional[float] = None
    age: Optional[int] = None
    pregnancies: Optional[int] = None
    skin_thickness: Optional[float] = None
    insulin: Optional[float] = None
    diabetes_pedigree: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class PredictionHistoryResponse(BaseModel):
    id: int
    patient_id: int
    prediction_result: str
    risk_level: str
    probability: float
    glucose: Optional[float] = None
    bmi: Optional[float] = None
    blood_pressure: Optional[float] = None
    age: Optional[int] = None
    pregnancies: Optional[int] = None
    skin_thickness: Optional[float] = None
    insulin: Optional[float] = None
    diabetes_pedigree: Optional[float] = None
    created_at: datetime
    top_factors: Optional[List[Dict[str, str]]] = None

    model_config = ConfigDict(from_attributes=True)
