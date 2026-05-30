from services.activity_log_service import log_activity
"""
Service functions for user profile management
DiaShield Healthcare Backend
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.user_model import User


def get_user_profile(
    email: str,
    db: Session
):
    """
    Retrieve user profile by email
    """

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def update_user_profile(
    email: str,
    data,
    db: Session
):
    """
    Update user profile fields
    """

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Fields allowed to update
    fields = [
        "age",
        "phone",
        "gender",
        "height",
        "weight",
        "profile_image"
    ]

    for field in fields:

        value = getattr(
            data,
            field,
            None
        )

        if value is not None:
            setattr(
                user,
                field,
                value
            )

    db.commit()
    db.refresh(user)

    # Log activity
    log_activity(db, user.id, "Profile updated")
    return user