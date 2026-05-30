
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from utils.auth_middleware import get_current_user
from models.user_model import User

from schemas.user_profile_schema import (
    UserProfileResponse,
    UserProfileUpdate
)

from services.user_profile_service import (
    get_user_profile,
    update_user_profile
)

router = APIRouter(
    prefix="/user",
    tags=["User"]
)


@router.get(
    "/profile",
    response_model=UserProfileResponse
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user


@router.put(
    "/profile",
    response_model=UserProfileResponse
)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_user_profile(
        current_user.email,
        data,
        db
    )