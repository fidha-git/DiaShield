"""
API routes for Prescriptions in DiaShield.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from schemas.prescription_schema import (
    PrescriptionCreate,
    PrescriptionUpdate,
    PrescriptionResponse
)

from services.prescription_service import (
    create_prescription,
    get_prescription,
    update_prescription,
    delete_prescription
)

from utils.auth_middleware import get_current_user
from utils.role_checker import require_role
from database.db import get_db


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


@router.post(
    "/add/{appointment_id}",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_prescription(
    appointment_id: int,
    data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Create prescription for completed appointment"""

    user_id = current_user.id

    return create_prescription(
        db,
        appointment_id,
        user_id,
        data
    )


@router.get(
    "/{appointment_id}",
    response_model=PrescriptionResponse
)
async def read_prescription(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Get prescription"""

    return get_prescription(
        db,
        appointment_id
    )


@router.put(
    "/update/{appointment_id}",
    response_model=PrescriptionResponse
)
async def update_prescription_route(
    appointment_id: int,
    data: PrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Update prescription"""

    user_id = current_user.id

    return update_prescription(
        db,
        appointment_id,
        user_id,
        data
    )


@router.delete(
    "/delete/{appointment_id}"
)
async def delete_prescription_route(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Delete prescription"""

    user_id = current_user.id

    return delete_prescription(
        db,
        appointment_id,
        user_id
    )