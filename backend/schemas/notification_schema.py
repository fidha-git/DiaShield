from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Pydantic schema for creating a notification
class NotificationCreate(BaseModel):
    title: str
    message: str
    reminder_time: datetime

# Pydantic schema for updating a notification
class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    reminder_time: Optional[datetime] = None
    is_sent: Optional[bool] = None

# Pydantic schema for returning a notification
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    reminder_time: datetime
    is_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
