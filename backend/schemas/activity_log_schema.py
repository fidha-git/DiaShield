from pydantic import BaseModel
from datetime import datetime

class ActivityLogResponse(BaseModel):
    user_id: int
    username: str
    action: str
    created_at: datetime

    class Config:
        orm_mode = True
