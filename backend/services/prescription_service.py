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
        frequency=data.frequency,
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

def get_doctor_prescriptions(db: Session, user_id: int):
    print(f"[PRESCRIPTION_SERVICE] get_doctor_prescriptions called with user_id={user_id}")
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    print(f"[PRESCRIPTION_SERVICE] doctor lookup result: {doctor}")
    if not doctor:
        print(f"[PRESCRIPTION_SERVICE] No doctor found for user_id={user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found.")
    print(f"[PRESCRIPTION_SERVICE] doctor.id={doctor.id}")
    prescriptions = db.query(Prescription).filter(Prescription.doctor_id == doctor.id).all()
    print(f"[PRESCRIPTION_SERVICE] Found {len(prescriptions)} prescriptions")
    return prescriptions

def get_patient_prescriptions(db: Session, user_id: int):
    """
    Get all prescriptions for a patient by querying appointments.
    Returns only prescriptions for completed appointments.
    """
    try:
        print(f"[PRESCRIPTION_SERVICE] get_patient_prescriptions called with user_id={user_id}")
        
        # Get appointments for this user (user_id directly, not patient_id)
        appointments = db.query(Appointment).filter(
            Appointment.user_id == user_id
        ).all()
        
        print(f"[PRESCRIPTION_SERVICE] Found {len(appointments)} appointments for user_id={user_id}")
        
        # Get prescriptions for these appointments
        prescriptions = []
        for appointment in appointments:
            print(f"[PRESCRIPTION_SERVICE] Checking appointment {appointment.id} for prescription")
            prescription = db.query(Prescription).filter(
                Prescription.appointment_id == appointment.id
            ).first()
            if prescription:
                print(f"[PRESCRIPTION_SERVICE] Found prescription {prescription.id} for appointment {appointment.id}")
                prescriptions.append(prescription)
        
        print(f"[PRESCRIPTION_SERVICE] Total prescriptions found: {len(prescriptions)}")
        
        # Sort by created_at (newest first)
        prescriptions.sort(key=lambda p: p.created_at, reverse=True)
        return prescriptions
    except Exception as e:
        print(f"[PRESCRIPTION_SERVICE] Error in get_patient_prescriptions: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

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
