"""
Service layer for Patient Dashboard
Handles business logic for /patient/dashboard endpoint
"""

from sqlalchemy.orm import Session
from models.patient_model import Patient
from models.appointment_model import Appointment
from models.medical_history_model import MedicalHistory
from models.health_record_model import HealthRecord
from models.prescription_model import Prescription
from models.prediction_history_model import PredictionHistory
from models.doctor_note_model import DoctorNote
from models.health_model import HealthLog
from services.prediction_history_service import get_latest_prediction
from models.user_model import User
from datetime import datetime


def get_patient_dashboard_data(db: Session, user_id: int):
    """
    Fetch dashboard data for the patient with the given user_id.
    """
    from fastapi import HTTPException

    # Get patient profile using user_id
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Set patient_name using full_name if exists, else name
    patient_name = getattr(patient, "full_name", None) or getattr(patient, "name", "")

    # Count upcoming appointments (linked by user_id)
    appointments_count = db.query(Appointment).filter(Appointment.user_id == user_id).count() or 0

    # Count medical history records (linked by patient_id)
    medical_history_count = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient.id).count() or 0

    # Count health records (linked by patient_id)
    health_records_count = db.query(HealthRecord).filter(HealthRecord.patient_id == patient.id).count() or 0

    # Count doctor notes (clinical notes from completed appointments)
    doctor_notes_count = db.query(DoctorNote).join(Appointment, DoctorNote.appointment_id == Appointment.id).filter(Appointment.user_id == user_id).count() or 0

    total_health_records_count = health_records_count + doctor_notes_count

    # Count prescriptions (linked by appointment_id to Appointment, which is linked to user_id)
    prescription_count = db.query(Prescription).join(Appointment, Prescription.appointment_id == Appointment.id).filter(Appointment.user_id == user_id).count() or 0

    # Fetch latest prediction history
    latest_prediction = db.query(PredictionHistory).filter(PredictionHistory.patient_id == patient.id).order_by(PredictionHistory.created_at.desc()).first()
    prediction_data = None
    if latest_prediction:
        prediction_data = {
            "prediction_result": latest_prediction.prediction_result,
            "risk_level": latest_prediction.risk_level,
            "probability": latest_prediction.probability
        }

    # Fetch latest health records (linked by patient_id, ordered by recorded_at)
    recent_health_records = db.query(HealthRecord).filter(HealthRecord.patient_id == patient.id).order_by(HealthRecord.recorded_at.desc()).limit(30).all() or []

    from types import SimpleNamespace

    # Also fetch health_logs to supplement trend data (linked by user_id)
    recent_logs = db.query(HealthLog).filter(HealthLog.user_id == user_id).order_by(HealthLog.created_at.desc()).limit(30).all() or []
    log_entries = []
    for log in recent_logs:
        entry = SimpleNamespace()
        entry.id = -log.id
        entry.blood_sugar = str(log.blood_sugar)
        entry.blood_pressure = None
        entry.heart_rate = None
        entry.bmi = None
        entry.weight = str(log.weight)
        entry.notes = None
        entry.recorded_at = log.created_at
        entry.created_at = log.created_at
        log_entries.append(entry)

    # Also fetch prediction_histories to supplement trend data (glucose values from risk assessments)
    recent_predictions = db.query(PredictionHistory).filter(PredictionHistory.patient_id == patient.id).order_by(PredictionHistory.created_at.desc()).limit(30).all() or []
    pred_entries = []
    for pred in recent_predictions:
        if pred.glucose is None:
            continue
        entry = SimpleNamespace()
        entry.id = -pred.id - 10000
        entry.blood_sugar = str(pred.glucose)
        entry.blood_pressure = str(pred.blood_pressure) if pred.blood_pressure else None
        entry.heart_rate = None
        entry.bmi = str(pred.bmi) if pred.bmi else None
        entry.weight = None
        entry.notes = None
        entry.recorded_at = pred.created_at
        entry.created_at = pred.created_at
        pred_entries.append(entry)

    # Merge, deduplicate by date, sort desc, limit 30
    seen_dates = {hr.recorded_at.date() if hr.recorded_at else None for hr in recent_health_records}
    for entry in log_entries + pred_entries:
        if entry.recorded_at and entry.recorded_at.date() not in seen_dates:
            recent_health_records.append(entry)
            seen_dates.add(entry.recorded_at.date())

    recent_health_records.sort(key=lambda r: r.recorded_at or r.created_at or datetime.min, reverse=True)
    recent_health_records = recent_health_records[:30]

    print("Recent Health Records from DB:", [
        {
            "id": getattr(hr, 'id', None),
            "blood_sugar": getattr(hr, 'blood_sugar', None),
            "blood_pressure": getattr(hr, 'blood_pressure', None),
            "heart_rate": getattr(hr, 'heart_rate', None),
            "bmi": getattr(hr, 'bmi', None),
            "weight": getattr(hr, 'weight', None),
            "recorded_at": str(hr.recorded_at) if hr.recorded_at else None,
            "created_at": str(hr.created_at) if hr.created_at else None,
        }
        for hr in recent_health_records
    ])

    return {
        "patient_name": patient_name,
        "upcoming_appointments_count": appointments_count,
        "medical_history_count": medical_history_count,
        "health_records_count": total_health_records_count,
        "prescription_count": prescription_count,
        "recent_health_records": recent_health_records,
        "latest_prediction": prediction_data
    }
