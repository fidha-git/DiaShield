from pydantic import BaseModel
from datetime import datetime

# Schema for creating an appointment (input)
class AppointmentCreate(BaseModel):
    doctor_id: int
    slot_id: int

# Schema for returning appointment info (output)
class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    doctor_id: int
    slot_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
