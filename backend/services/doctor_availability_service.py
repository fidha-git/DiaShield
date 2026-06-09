from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.doctor_model import Doctor
from models.doctor_availability_model import DoctorAvailability
from models.user_model import User
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


def update_slot(
    slot_id: int,
    data: DoctorAvailabilityCreate,
    db: Session
):
    slot = db.query(DoctorAvailability).filter(DoctorAvailability.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.is_booked:
        raise HTTPException(status_code=400, detail="Cannot edit a booked slot")

    slot.date = data.date
    slot.start_time = data.start_time
    slot.end_time = data.end_time
    db.commit()
    db.refresh(slot)
    return slot


def delete_slot(
    slot_id: int,
    current_user: User,
    db: Session
):
    print(f"[delete_slot] called with slot_id={slot_id}, user_id={current_user.id}, role={current_user.role}")

    slot = db.query(DoctorAvailability).filter(DoctorAvailability.id == slot_id).first()
    if not slot:
        print(f"[delete_slot] Slot {slot_id} not found")
        raise HTTPException(status_code=404, detail="Slot not found")

    print(f"[delete_slot] Found slot: doctor_id={slot.doctor_id}, is_booked={slot.is_booked}")

    if current_user.role != "admin":
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        print(f"[delete_slot] Doctor lookup: user_id={current_user.id} => doctor={doctor.id if doctor else None}")
        if not doctor:
            print(f"[delete_slot] No doctor profile found for user_id={current_user.id}")
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own slots"
            )
        if slot.doctor_id != doctor.id:
            print(f"[delete_slot] Ownership mismatch: slot.doctor_id={slot.doctor_id} != doctor.id={doctor.id}")
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own slots"
            )

    if slot.is_booked:
        print(f"[delete_slot] Slot {slot_id} is booked, rejecting deletion")
        raise HTTPException(status_code=400, detail="Cannot delete a booked slot")

    print(f"[delete_slot] Deleting slot {slot_id}")
    db.delete(slot)
    db.commit()
    print(f"[delete_slot] Slot {slot_id} deleted successfully")
    return {"message": "Slot deleted successfully"}