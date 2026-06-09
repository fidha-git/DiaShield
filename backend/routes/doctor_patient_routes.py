from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database.db import get_db
from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role
from models.user_model import User
from models.patient_model import Patient
from models.health_record_model import HealthRecord
from models.prediction_history_model import PredictionHistory
from models.medical_history_model import MedicalHistory
from models.doctor_note_model import DoctorNote
from models.prescription_model import Prescription
from models.appointment_model import Appointment
from models.doctor_model import Doctor

router = APIRouter(prefix="/doctor/patient", tags=["Doctor Patient Access"])


def get_doctor_or_admin(current_user=Depends(get_current_user)):
    require_role(["doctor", "admin"])(current_user)
    return current_user


def verify_doctor_access(patient_user_id: int, current_user, db: Session):
    if current_user.role == "admin":
        return
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=403, detail="Doctor profile not found")
    has_appointment = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.user_id == patient_user_id
    ).first()
    if not has_appointment:
        raise HTTPException(status_code=403, detail="You are not authorized to view this patient's data")


def get_patient_by_user_id(db: Session, user_id: int):
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}")
def get_patient_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_doctor_or_admin)
):
    verify_doctor_access(user_id, current_user, db)
    patient = get_patient_by_user_id(db, user_id)
    user = get_user_by_id(db, user_id)

    return {
        "user_id": user.id,
        "patient_id": patient.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "profile_image": user.profile_image,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "address": patient.address,
        "height": patient.height,
        "weight": patient.weight,
        "blood_group": patient.blood_group,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "emergency_contact_relationship": patient.emergency_contact_relationship,
        "insurance_provider": patient.insurance_provider,
        "policy_number": patient.policy_number,
        "primary_clinic": patient.primary_clinic,
    }


@router.get("/{user_id}/health-records")
def get_patient_health_records(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_doctor_or_admin)
):
    verify_doctor_access(user_id, current_user, db)
    patient = get_patient_by_user_id(db, user_id)
    records = db.query(HealthRecord).filter(
        HealthRecord.patient_id == patient.id
    ).order_by(desc(HealthRecord.recorded_at)).all()

    return [
        {
            "id": r.id,
            "blood_sugar": r.blood_sugar,
            "glucose_period": r.glucose_period,
            "blood_pressure": r.blood_pressure,
            "heart_rate": r.heart_rate,
            "bmi": r.bmi,
            "weight": r.weight,
            "notes": r.notes,
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]


@router.get("/{user_id}/predictions")
def get_patient_predictions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_doctor_or_admin)
):
    verify_doctor_access(user_id, current_user, db)
    patient = get_patient_by_user_id(db, user_id)
    predictions = db.query(PredictionHistory).filter(
        PredictionHistory.patient_id == patient.id
    ).order_by(desc(PredictionHistory.created_at)).all()

    return [
        {
            "id": p.id,
            "prediction_result": p.prediction_result,
            "risk_level": p.risk_level,
            "probability": p.probability,
            "glucose": p.glucose,
            "bmi": p.bmi,
            "blood_pressure": p.blood_pressure,
            "age": p.age,
            "pregnancies": p.pregnancies,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in predictions
    ]


@router.get("/{user_id}/medical-history")
def get_patient_medical_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_doctor_or_admin)
):
    verify_doctor_access(user_id, current_user, db)
    patient = get_patient_by_user_id(db, user_id)
    histories = db.query(MedicalHistory).filter(
        MedicalHistory.patient_id == patient.id
    ).order_by(desc(MedicalHistory.created_at)).all()

    return [
        {
            "id": h.id,
            "past_illnesses": h.past_illnesses,
            "surgeries": h.surgeries,
            "family_history": h.family_history,
            "chronic_diseases": h.chronic_diseases,
            "smoking_status": h.smoking_status,
            "alcohol_status": h.alcohol_status,
            "notes": h.notes,
            "created_at": h.created_at.isoformat() if h.created_at else None,
        }
        for h in histories
    ]


@router.get("/{user_id}/clinical-notes")
def get_patient_clinical_notes(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_doctor_or_admin)
):
    verify_doctor_access(user_id, current_user, db)
    notes = db.query(DoctorNote).join(
        Appointment, DoctorNote.appointment_id == Appointment.id
    ).filter(
        Appointment.user_id == user_id
    ).order_by(desc(DoctorNote.created_at)).all()

    return [
        {
            "id": n.id,
            "appointment_id": n.appointment_id,
            "doctor_id": n.doctor_id,
            "diagnosis": n.diagnosis,
            "notes": n.notes,
            "medicines": n.medicines,
            "advice": n.advice,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notes
    ]


@router.get("/{user_id}/prescriptions")
def get_patient_prescriptions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_doctor_or_admin)
):
    verify_doctor_access(user_id, current_user, db)
    prescriptions = db.query(Prescription).join(
        Appointment, Prescription.appointment_id == Appointment.id
    ).filter(
        Appointment.user_id == user_id
    ).order_by(desc(Prescription.created_at)).all()

    return [
        {
            "id": p.id,
            "appointment_id": p.appointment_id,
            "doctor_id": p.doctor_id,
            "medicines": p.medicines,
            "dosage": p.dosage,
            "frequency": p.frequency,
            "duration": p.duration,
            "instructions": p.instructions,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in prescriptions
    ]
