"""
API routes for Doctor Notes in DiaShield.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.db import get_db

from schemas.doctor_note_schema import (
    DoctorNoteCreate,
    DoctorNoteUpdate,
    DoctorNoteResponse
)

from services.doctor_note_service import (
    create_doctor_note,
    get_doctor_note,
    update_doctor_note,
    delete_doctor_note
)

# Correct imports
from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role


router = APIRouter(
    prefix="/doctor-notes",
    tags=["Doctor Notes"]
)


@router.post(
    "/add/{appointment_id}",
    response_model=DoctorNoteResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_doctor_note(
    appointment_id: int,
    note_data: DoctorNoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Add doctor note for completed appointment"""

    doctor_id = current_user.id

    return create_doctor_note(
        db,
        appointment_id,
        doctor_id,
        note_data
    )


@router.get(
    "/{appointment_id}",
    response_model=DoctorNoteResponse
)
async def read_doctor_note(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Get doctor note"""

    return get_doctor_note(
        db,
        appointment_id
    )


@router.put(
    "/update/{appointment_id}",
    response_model=DoctorNoteResponse
)
async def update_doctor_note_route(
    appointment_id: int,
    note_data: DoctorNoteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Update doctor note"""

    doctor_id = current_user.id

    return update_doctor_note(
        db,
        appointment_id,
        doctor_id,
        note_data
    )


@router.delete(
    "/delete/{appointment_id}"
)
async def delete_doctor_note_route(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Delete doctor note"""

    doctor_id = current_user.id

    return delete_doctor_note(
        db,
        appointment_id,
        doctor_id
    )