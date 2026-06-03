"""
API routes for Prescriptions in DiaShield.
"""

import traceback
from fastapi import APIRouter, Depends, HTTPException, status
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
    delete_prescription,
    get_doctor_prescriptions,
    get_patient_prescriptions
)

from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role
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
    "/doctor/all",
    response_model=list[PrescriptionResponse]
)
async def read_doctor_prescriptions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["doctor"]))
):
    """Get all prescriptions for the logged-in doctor"""
    try:
        print("[PRESCRIPTIONS] GET /doctor/all — starting")
        print(f"[PRESCRIPTIONS] current_user.id={current_user.id}, role={current_user.role}")

        user_id = current_user.id

        result = get_doctor_prescriptions(
            db,
            user_id
        )

        print(f"[PRESCRIPTIONS] get_doctor_prescriptions returned {len(result) if result else 0} items")
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[PRESCRIPTIONS] UNHANDLED ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get(
    "/patient/all",
    response_model=list[PrescriptionResponse]
)
async def read_patient_prescriptions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """Get all prescriptions for the logged-in patient"""
    try:
        print("[PRESCRIPTIONS] GET /patient/all — starting")
        print(f"[PRESCRIPTIONS] current_user.id={current_user.id}, role={current_user.role}")

        user_id = current_user.id

        result = get_patient_prescriptions(
            db,
            user_id
        )

        print(f"[PRESCRIPTIONS] get_patient_prescriptions returned {len(result) if result else 0} items")
        if result:
            print(f"[PRESCRIPTIONS] Sample prescription: {result[0]}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[PRESCRIPTIONS] UNHANDLED ERROR in /patient/all: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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