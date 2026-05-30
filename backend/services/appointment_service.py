from services.activity_log_service import log_activity
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from models.appointment_model import Appointment
from models.doctor_availability_model import DoctorAvailability
from schemas.appointment_schema import AppointmentCreate


# -------------------------
# Book appointment
# -------------------------

def book_appointment(
    db: Session,
    user_id: int,
    appointment_data: AppointmentCreate
):
    """
    Book an appointment with slot conflict and time validation.
    """

    slot = (
        db.query(DoctorAvailability)
        .filter(
            DoctorAvailability.id == appointment_data.slot_id
        )
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )

    if slot.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot already booked"
        )

    current_date = datetime.now().date()

    if hasattr(slot, "date") and slot.date < current_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book past slots"
        )

    conflict = (
        db.query(Appointment)
        .join(
            DoctorAvailability,
            Appointment.slot_id == DoctorAvailability.id
        )
        .filter(
            Appointment.user_id == user_id,
            Appointment.status == "booked",
            DoctorAvailability.date == slot.date
        )
        .first()
    )

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment time conflict"
        )

    slot.is_booked = True

    appointment = Appointment(
        user_id=user_id,
        doctor_id=appointment_data.doctor_id,
        slot_id=appointment_data.slot_id,
        status="booked"
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Create reminder
    try:
        from services.reminder_service import create_reminder

        if (
            hasattr(slot, "date")
            and hasattr(slot, "start_time")
        ):
            slot_start = datetime.combine(
                slot.date,
                slot.start_time
            )

            reminder_time = (
                slot_start - timedelta(minutes=30)
            )

            reminder_data = type(
                "ReminderCreate",
                (),
                {
                    "message": "Your appointment starts in 30 minutes",
                    "reminder_time": reminder_time
                }
            )()

            create_reminder(
                db,
                appointment.id,
                user_id,
                reminder_data
            )

    except Exception as e:
        print(f"[REMINDER ERROR] {e}")

    log_activity(
        db,
        user_id,
        "Appointment booked"
    )

    return appointment
# -------------------------
# Get user appointments
# -------------------------

def get_user_appointments(
    db: Session,
    user_id: int,
    page: int = 1,
    limit: int = 10,
    status: str = None
):
    offset = (page - 1) * limit

    # Join appointments, doctors, doctor_availability
    from models.doctor_model import Doctor
    from models.doctor_availability_model import DoctorAvailability

    base_query = db.query(
        Appointment.id,
        Appointment.doctor_id,
        Doctor.name.label("doctor_name"),
        Appointment.slot_id,
        DoctorAvailability.date,
        DoctorAvailability.start_time,
        DoctorAvailability.end_time,
        Appointment.status,
        Appointment.created_at
    ).join(Doctor, Appointment.doctor_id == Doctor.id)
    base_query = base_query.join(DoctorAvailability, Appointment.slot_id == DoctorAvailability.id)
    base_query = base_query.filter(Appointment.user_id == user_id)
    if status:
        base_query = base_query.filter(Appointment.status == status)

    total = base_query.count()
    appointments = base_query.offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if limit else 1

    # Convert to dicts for API response
    enriched_appointments = [
        {
            "id": a.id,
            "doctor_id": a.doctor_id,
            "doctor_name": a.doctor_name,
            "slot_id": a.slot_id,
            "date": a.date,
            "start_time": a.start_time,
            "end_time": a.end_time,
            "status": a.status,
            "created_at": a.created_at
        }
        for a in appointments
    ]

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "appointments": enriched_appointments
    }


# -------------------------
# Cancel appointment
# -------------------------

def cancel_appointment(
    db: Session,
    appointment_id: int,
    user_id: int
):
    appointment = db.query(
        Appointment
    ).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    if appointment.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    if appointment.status != "booked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment already cancelled"
        )

    appointment.status = "cancelled"

    slot = db.query(
        DoctorAvailability
    ).filter(
        DoctorAvailability.id == appointment.slot_id
    ).first()

    if slot:
        slot.is_booked = False

    db.commit()
    db.refresh(appointment)

    # Log activity
    log_activity(db, user_id, "Appointment cancelled")
    return appointment


# -------------------------
# Get doctor appointments
# -------------------------

def get_doctor_appointments(
    db: Session,
    doctor_id: int,
    page: int = 1,
    limit: int = 10,
    status: str = None
):
    offset = (page - 1) * limit

    query = db.query(
        Appointment
    ).filter(
        Appointment.doctor_id == doctor_id
    )

    if status:
        query = query.filter(
            Appointment.status == status
        )

    total = query.count()

    appointments = query.offset(
        offset
    ).limit(
        limit
    ).all()

    total_pages = (total + limit - 1) // limit if limit else 1

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "appointments": appointments
    }


# -------------------------
# Complete appointment
# -------------------------

def complete_appointment(
    db: Session,
    appointment_id: int
):
    appointment = db.query(
        Appointment
    ).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    if appointment.status != "booked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only booked appointments can be completed"
        )

    appointment.status = "completed"

    db.commit()
    db.refresh(appointment)

    return appointment


# -------------------------
# Reschedule appointment
# -------------------------

def reschedule_appointment(
    db: Session,
    appointment_id: int,
    new_slot_id: int,
    user_id: int
):
    appointment = db.query(
        Appointment
    ).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    if appointment.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    new_slot = db.query(
        DoctorAvailability
    ).filter(
        DoctorAvailability.id == new_slot_id
    ).first()

    if not new_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="New slot not found"
        )

    if new_slot.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New slot already booked"
        )

    # Prevent rescheduling past dates
    current_date = datetime.now().date()

    if hasattr(new_slot, "date") and new_slot.date < current_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book past slots"
        )

    conflict = db.query(
        Appointment
    ).join(
        DoctorAvailability,
        Appointment.slot_id == DoctorAvailability.id
    ).filter(
        Appointment.user_id == user_id,
        Appointment.status == "booked",
        DoctorAvailability.date == new_slot.date,
        Appointment.id != appointment_id
    ).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment time conflict"
        )

    old_slot = db.query(
        DoctorAvailability
    ).filter(
        DoctorAvailability.id == appointment.slot_id
    ).first()

    if old_slot:
        old_slot.is_booked = False

    new_slot.is_booked = True
    appointment.slot_id = new_slot_id

    db.commit()
    db.refresh(appointment)

    return appointment


# -------------------------
# Doctor dashboard
# -------------------------

def get_doctor_dashboard(
    db: Session,
    doctor_id: int
):
    appointments = db.query(
        Appointment
    ).filter(
        Appointment.doctor_id == doctor_id
    ).all()

    total = len(appointments)

    booked = sum(
        1 for a in appointments if a.status == "booked"
    )

    completed = sum(
        1 for a in appointments if a.status == "completed"
    )

    cancelled = sum(
        1 for a in appointments if a.status == "cancelled"
    )

    return {
        "doctor_id": doctor_id,
        "total_appointments": total,
        "booked_appointments": booked,
        "completed_appointments": completed,
        "cancelled_appointments": cancelled,
        "appointments": appointments
    }