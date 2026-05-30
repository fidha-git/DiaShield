"""
Pydantic schemas for Doctor Availability in DiaShield
- Uses Pydantic v2 syntax and BaseModel
- Clean separation of request and response schemas for API clarity
"""
from pydantic import BaseModel
from datetime import date, time

# Request schema for creating a new doctor availability slot
# Separating request and response schemas allows validation of only the fields needed from the client
class DoctorAvailabilityCreate(BaseModel):
    date: date  # The date for the availability slot
    start_time: time  # Start time for the slot
    end_time: time    # End time for the slot

# Response schema for returning doctor availability data to the client
# This includes all fields, including those managed by the database
class DoctorAvailabilityResponse(BaseModel):
    id: int  # Unique identifier for the slot
    doctor_id: int  # The doctor this slot belongs to
    date: date
    start_time: time
    end_time: time
    is_booked: bool  # Indicates if the slot is already booked

    class Config:
        from_attributes = True

# Why BaseModel?
# - BaseModel provides data validation, parsing, and serialization for API requests and responses
# - Ensures only valid data is accepted and returned
#
# Why from_attributes=True?
# - Allows Pydantic to read data directly from SQLAlchemy ORM objects (not just dicts)
# - Essential for seamless integration between FastAPI, Pydantic, and SQLAlchemy
