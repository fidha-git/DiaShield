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
from services.prediction_history_service import get_latest_prediction
from models.user_model import User


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

    # Fetch latest 5 health records (linked by patient_id, ordered by recorded_at)
    recent_health_records = db.query(HealthRecord).filter(HealthRecord.patient_id == patient.id).order_by(HealthRecord.recorded_at.desc()).limit(5).all() or []

    print("Recent Health Records from DB:", [
        {
            "id": hr.id,
            "blood_sugar": hr.blood_sugar,
            "blood_pressure": hr.blood_pressure,
            "heart_rate": hr.heart_rate,
            "bmi": hr.bmi,
            "weight": hr.weight,
            "recorded_at": str(hr.recorded_at),
            "created_at": str(hr.created_at),
        }
        for hr in recent_health_records
    ])

    return {
        "patient_name": patient_name,
        "upcoming_appointments_count": appointments_count,
        "medical_history_count": medical_history_count,
        "health_records_count": health_records_count,
        "prescription_count": prescription_count,
        "recent_health_records": recent_health_records,
        "latest_prediction": prediction_data
    }
