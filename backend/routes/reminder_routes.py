from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from schemas.reminder_schema import (
    ReminderCreate,
    ReminderResponse
)

from services.reminder_service import (
    create_reminder,
    get_my_reminders
)

from utils.auth_middleware import get_current_user
from utils.role_checker import require_role
from database.db import get_db


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)


# -----------------------------
# CREATE REMINDER
# -----------------------------
@router.post(
    "/create/{appointment_id}",
    response_model=ReminderResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_reminder_route(
    appointment_id: int,
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """Create appointment reminder"""

    return create_reminder(
        db,
        appointment_id,
        current_user.id,
        reminder_data
    )


# -----------------------------
# GET MY REMINDERS
# -----------------------------
@router.get(
    "/my-reminders",
    response_model=list[ReminderResponse]
)
async def get_my_reminders_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """Get all reminders of logged-in patient"""

    return get_my_reminders(
        db,
        current_user.id
    )