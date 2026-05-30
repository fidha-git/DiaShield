from services.activity_log_service import log_activity
"""
Service layer for Doctor Notes in DiaShield.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.doctor_note_model import DoctorNote
from models.appointment_model import Appointment
from models.doctor_model import Doctor
from schemas.doctor_note_schema import DoctorNoteCreate, DoctorNoteUpdate


def create_doctor_note(
    db: Session,
    appointment_id: int,
    user_id: int,
    note_data: DoctorNoteCreate
):
    # Verify appointment exists
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found."
        )

    # Verify appointment completed
    if appointment.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor note can only be added to completed appointments."
        )

    # Convert user_id -> doctor_id
    doctor = db.query(Doctor).filter(
        Doctor.user_id == user_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found."
        )

    # Prevent duplicate notes
    existing_note = db.query(DoctorNote).filter(
        DoctorNote.appointment_id == appointment_id
    ).first()

    if existing_note:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor note already exists for this appointment."
        )

    # Create note
    note = DoctorNote(
        appointment_id=appointment_id,
        doctor_id=doctor.id,  # FIXED
        diagnosis=note_data.diagnosis,
        notes=note_data.notes,
        medicines=note_data.medicines,
        advice=note_data.advice
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    # Log activity
    log_activity(db, user_id, "Doctor note created")
    return note


def get_doctor_note(db: Session, appointment_id: int):
    note = db.query(DoctorNote).filter(
        DoctorNote.appointment_id == appointment_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor note not found."
        )

    return note


def update_doctor_note(
    db: Session,
    appointment_id: int,
    user_id: int,
    note_data: DoctorNoteUpdate
):
    note = db.query(DoctorNote).filter(
        DoctorNote.appointment_id == appointment_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor note not found."
        )

    # Convert user_id -> doctor_id
    doctor = db.query(Doctor).filter(
        Doctor.user_id == user_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found."
        )

    if note.doctor_id != doctor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only same doctor can update this note."
        )

    for field, value in note_data.model_dump(
        exclude_unset=True
    ).items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    return note


def delete_doctor_note(
    db: Session,
    appointment_id: int,
    user_id: int
):
    note = db.query(DoctorNote).filter(
        DoctorNote.appointment_id == appointment_id
    ).first()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor note not found."
        )

    # Convert user_id -> doctor_id
    doctor = db.query(Doctor).filter(
        Doctor.user_id == user_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found."
        )

    if note.doctor_id != doctor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only same doctor can delete this note."
        )

    db.delete(note)
    db.commit()

    return {
        "message": "Doctor note deleted successfully"
    }