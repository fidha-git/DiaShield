"""
Pydantic schemas for user profile endpoints in DiaShield healthcare backend.
- Uses Pydantic v2 syntax
- Enables ORM support
"""
from pydantic import BaseModel
from typing import Optional

# Response schema for returning user profile data
class UserProfileResponse(BaseModel):
    username: str  # Unique username
    email: str     # User's email address
    age: Optional[int] = None  # User's age (optional)
    phone: Optional[str] = None  # User's phone number (optional)
    gender: Optional[str] = None  # User's gender (optional)
    height: Optional[float] = None  # User's height in cm (optional)
    weight: Optional[float] = None  # User's weight in kg (optional)
    profile_image: Optional[str] = None  # URL or path to profile image (optional)

    class Config:
        from_attributes = True

# Schema for updating user profile fields (all optional)
class UserProfileUpdate(BaseModel):
    age: Optional[int] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    profile_image: Optional[str] = None
