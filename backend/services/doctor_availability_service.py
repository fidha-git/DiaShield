from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.doctor_model import Doctor
from models.doctor_availability_model import DoctorAvailability
from schemas.doctor_availability_schema import DoctorAvailabilityCreate


def add_slot(
    doctor_id: int,
    data: DoctorAvailabilityCreate,
    db: Session
):
    """
    Create doctor availability slot
    """

    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    slot = DoctorAvailability(
        doctor_id=doctor_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)

    return slot


def get_slots(
    doctor_id: int,
    db: Session
):
    return db.query(
        DoctorAvailability
    ).filter(
        DoctorAvailability.doctor_id == doctor_id
    ).all()