"""
Service layer for Prescriptions in DiaShield.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.prescription_model import Prescription
from models.appointment_model import Appointment
from models.doctor_model import Doctor
from schemas.prescription_schema import PrescriptionCreate, PrescriptionUpdate

def create_prescription(db: Session, appointment_id: int, user_id: int, data: PrescriptionCreate):
    # Convert user_id to doctor_id
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found.")
    # Check appointment exists
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    # Check appointment is completed
    if getattr(appointment, "status", None) != "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prescription can only be added to completed appointments.")
    # Prevent duplicate prescription
    if db.query(Prescription).filter(Prescription.appointment_id == appointment_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Prescription already exists for this appointment.")
    prescription = Prescription(
        appointment_id=appointment_id,
        doctor_id=doctor.id,
        medicines=data.medicines,
        dosage=data.dosage,
        duration=data.duration,
        instructions=data.instructions
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription

def get_prescription(db: Session, appointment_id: int):
    prescription = db.query(Prescription).filter(Prescription.appointment_id == appointment_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")
    return prescription

def update_prescription(db: Session, appointment_id: int, user_id: int, data: PrescriptionUpdate):
    prescription = db.query(Prescription).filter(Prescription.appointment_id == appointment_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    if not doctor or prescription.doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the same doctor can update this prescription.")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(prescription, field, value)
    db.commit()
    db.refresh(prescription)
    return prescription

def delete_prescription(db: Session, appointment_id: int, user_id: int):
    prescription = db.query(Prescription).filter(Prescription.appointment_id == appointment_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found.")
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    if not doctor or prescription.doctor_id != doctor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the same doctor can delete this prescription.")
    db.delete(prescription)
    db.commit()
    return {"detail": "Prescription deleted successfully."}
