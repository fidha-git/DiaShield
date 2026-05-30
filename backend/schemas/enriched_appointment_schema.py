from pydantic import BaseModel
from datetime import datetime, date, time

class EnrichedAppointmentResponse(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    slot_id: int
    date: date
    start_time: time
    end_time: time
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
