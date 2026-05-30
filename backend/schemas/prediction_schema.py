from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# Request schema for diabetes prediction inputs
# Fields match the features used by the prediction model
class PredictionRequest(BaseModel):
    pregnancies: int = Field(..., description="Number of pregnancies")
    glucose: int = Field(..., description="Plasma glucose concentration")
    blood_pressure: int = Field(..., description="Diastolic blood pressure")
    skin_thickness: int = Field(..., description="Triceps skin fold thickness")
    insulin: int = Field(..., description="2-Hour serum insulin")
    bmi: float = Field(..., description="Body mass index")
    diabetes_pedigree: float = Field(..., description="Diabetes pedigree function")
    age: int = Field(..., description="Age in years")


# Response schema for prediction results
class PredictionResponse(BaseModel):
    success: bool = Field(..., description="Whether the prediction succeeded")
    result: str = Field(..., description="Prediction result (e.g., 'high', 'low')")



# Response schema that mirrors the database Prediction record.
# This is returned after a prediction is saved to PostgreSQL.
class PredictionDBResponse(BaseModel):
    id: int = Field(..., description="Database id of the saved prediction")
    user_id: int = Field(..., description="User id who created the prediction")
    pregnancies: Optional[int] = Field(None)
    glucose: Optional[float] = Field(None)
    blood_pressure: Optional[float] = Field(None)
    skin_thickness: Optional[float] = Field(None)
    insulin: Optional[float] = Field(None)
    bmi: Optional[float] = Field(None)
    diabetes_pedigree: Optional[float] = Field(None)
    age: Optional[int] = Field(None)
    result: str = Field(..., description="Stored prediction result string")
    created_at: datetime = Field(..., description="Timestamp when the record was created")
    success: bool = Field(..., description="Whether the prediction succeeded")

    model_config = {"from_attributes": True}
