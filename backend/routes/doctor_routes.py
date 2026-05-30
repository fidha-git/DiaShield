"""
Doctor profile management API routes
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from schemas.doctor_schema import (
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse
)

from services.doctor_service import (
    create_doctor,
    get_doctor,
    update_doctor,
    delete_doctor,
    get_all_doctors
)

from database.db import get_db
from utils.auth_middleware import (
    get_current_user,
    require_role
)


# Create router BEFORE decorators
router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.get(
    "/all",
    response_model=list[DoctorResponse],
    status_code=status.HTTP_200_OK
)
def get_all_doctors_route(
    db: Session = Depends(get_db)
):
    """
    Get all doctors (public, no authentication required)
    """
    return get_all_doctors(db)


@router.post(
    "/create",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_doctor_profile(
    doctor_data: DoctorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Create doctor profile
    """

    require_role(["doctor"])(current_user)

    return create_doctor(
        db=db,
        user_id=current_user.id,
        doctor_data=doctor_data
    )


@router.get(
    "/{doctor_id}",
    response_model=DoctorResponse
)
def get_doctor_profile(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    """
    Get doctor profile
    """

    return get_doctor(
        db=db,
        doctor_id=doctor_id
    )


@router.put(
    "/update/{doctor_id}",
    response_model=DoctorResponse
)
def update_doctor_profile(
    doctor_id: int,
    doctor_data: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Update doctor profile
    """

    require_role(["doctor"])(current_user)

    return update_doctor(
        db=db,
        doctor_id=doctor_id,
        user_id=current_user.id,
        doctor_data=doctor_data
    )


@router.delete(
    "/delete/{doctor_id}"
)
def delete_doctor_profile(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Delete doctor profile
    """

    require_role(["doctor"])(current_user)

    return delete_doctor(
        db=db,
        doctor_id=doctor_id,
        user_id=current_user.id
    )


@router.get(
    "/all",
    response_model=list[DoctorResponse],
    status_code=status.HTTP_200_OK
)
def get_all_doctors_route(
    db: Session = Depends(get_db)
):
    """
    Get all doctors (public, no authentication required)
    """
    return get_all_doctors(db)