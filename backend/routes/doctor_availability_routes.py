from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from schemas.doctor_availability_schema import (
    DoctorAvailabilityCreate,
    DoctorAvailabilityResponse
)

from services.doctor_availability_service import (
    add_slot,
    get_slots
)

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor Availability"]
)

@router.post(
    "/add-slot/{doctor_id}",
    response_model=DoctorAvailabilityResponse
)
def create_slot(
    doctor_id: int,
    data: DoctorAvailabilityCreate,
    db: Session = Depends(get_db)
):
    return add_slot(
        doctor_id,
        data,
        db
    )


@router.get(
    "/slots/{doctor_id}",
    response_model=List[DoctorAvailabilityResponse]
)
def get_doctor_slots(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    return get_slots(
        doctor_id,
        db
    )