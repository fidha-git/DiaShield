# schemas/patient_schema.py

# Pydantic V2 schema for Patient profile
# Uses from_attributes=True as per project rules

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime




class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    address: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    blood_group: Optional[str] = None
    profile_image: Optional[str] = None
    # New fields
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    insurance_provider: Optional[str] = None
    policy_number: Optional[str] = None
    group_code: Optional[str] = None
    primary_clinic: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Create schema
class PatientCreate(PatientBase):
    pass


# Update schema
class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    blood_group: Optional[str] = None
    profile_image: Optional[str] = None
    # New fields
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    insurance_provider: Optional[str] = None
    policy_number: Optional[str] = None
    group_code: Optional[str] = None
    primary_clinic: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Response schema


class PatientResponse(PatientBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)