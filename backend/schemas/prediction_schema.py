from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


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

    @field_validator("age")
    @classmethod
    def validate_age(cls, v):
        if v < 1 or v > 120:
            raise ValueError("Age must be between 1 and 120")
        return v

    @field_validator("glucose")
    @classmethod
    def validate_glucose(cls, v):
        if v < 0 or v > 600:
            raise ValueError("Glucose must be between 0 and 600 mg/dL")
        return v

    @field_validator("blood_pressure")
    @classmethod
    def validate_blood_pressure(cls, v):
        if v < 20 or v > 300:
            raise ValueError("Blood pressure must be between 20 and 300 mm Hg")
        return v

    @field_validator("bmi")
    @classmethod
    def validate_bmi(cls, v):
        if v < 10 or v > 100:
            raise ValueError("BMI must be between 10 and 100 kg/m\u00b2")
        return v

    @field_validator("skin_thickness")
    @classmethod
    def validate_skin_thickness(cls, v):
        if v < 0 or v > 100:
            raise ValueError("Skin thickness must be between 0 and 100 mm")
        return v

    @field_validator("insulin")
    @classmethod
    def validate_insulin(cls, v):
        if v < 0 or v > 1000:
            raise ValueError("Insulin must be between 0 and 1000 IU/mL")
        return v

    @field_validator("diabetes_pedigree")
    @classmethod
    def validate_diabetes_pedigree(cls, v):
        if v < 0 or v > 5:
            raise ValueError("Diabetes pedigree function must be between 0 and 5")
        return v

    @field_validator("pregnancies")
    @classmethod
    def validate_pregnancies(cls, v):
        if v < 0 or v > 20:
            raise ValueError("Number of pregnancies must be between 0 and 20")
        return v


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
