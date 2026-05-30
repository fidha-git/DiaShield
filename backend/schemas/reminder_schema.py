from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    message: str
    reminder_time: datetime


class ReminderUpdate(BaseModel):
    message: Optional[str] = None
    reminder_time: Optional[datetime] = None
    is_sent: Optional[bool] = None


class ReminderResponse(BaseModel):
    id: int
    appointment_id: int
    user_id: int
    message: str
    reminder_time: datetime
    is_sent: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }