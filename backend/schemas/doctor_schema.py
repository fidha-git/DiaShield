"""
Pydantic schemas for Doctor profile management
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# Schema for creating doctor profile
class DoctorCreate(BaseModel):

    name: str = Field(
        ...,
        example="Dr John Doe"
    )

    specialization: str = Field(
        ...,
        example="Endocrinologist"
    )

    experience: int = Field(
        ...,
        example=10
    )

    qualification: str = Field(
        ...,
        example="MD, PhD"
    )

    hospital: str = Field(
        ...,
        example="City Hospital"
    )

    phone: str = Field(
        ...,
        example="+1234567890"
    )

    consultation_fee: float = Field(
        ...,
        example=100.0
    )

    bio: Optional[str] = Field(
        None,
        example="Experienced diabetes specialist"
    )

    model_config = {
        "from_attributes": True
    }


# Schema for updating doctor profile
class DoctorUpdate(BaseModel):

    name: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    qualification: Optional[str] = None
    hospital: Optional[str] = None
    phone: Optional[str] = None
    consultation_fee: Optional[float] = None
    bio: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


# Schema for response
class DoctorResponse(BaseModel):

    id: int
    user_id: int
    name: str
    specialization: str
    experience: int
    qualification: str
    hospital: str
    phone: str
    consultation_fee: float
    bio: Optional[str] = None

    # FIXED
    created_at: datetime

    model_config = {
        "from_attributes": True
    }