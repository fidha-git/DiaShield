from pydantic import BaseModel
from datetime import datetime

# Pydantic schema for creating an admin
class AdminCreate(BaseModel):
    name: str
    email: str


# Pydantic schema for returning an admin
class AdminResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Pydantic schema for returning a user (matches User model)
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool | None = None
    created_at: datetime
    profile_image: str | None = None

    class Config:
        from_attributes = True
