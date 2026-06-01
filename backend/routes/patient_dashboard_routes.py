"""
Routes for Patient Dashboard
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.patient_dashboard_schema import PatientDashboardResponse, HealthRecordSummary
from services.patient_dashboard_service import get_patient_dashboard_data
from utils.auth_middleware import get_current_user
from utils.role_checker import require_role
from database.db import get_db
from typing import List


router = APIRouter()

# Allow only patient users (reuse pattern from patient_routes.py)
def patient_only(
    current_user=Depends(get_current_user)
):
    require_role(["patient"])(current_user)
    return current_user


@router.get("/dashboard", response_model=PatientDashboardResponse, tags=["Patient Dashboard"])
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    """
    Get dashboard data for the current patient.
    """
    data = get_patient_dashboard_data(db, current_user.id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    # Convert recent_health_records to HealthRecordSummary with all required fields
    recent_health_records = [
        HealthRecordSummary(
            id=hr.id,
            blood_sugar=hr.blood_sugar,
            blood_pressure=hr.blood_pressure,
            heart_rate=hr.heart_rate,
            bmi=hr.bmi,
            weight=hr.weight,
            notes=hr.notes if hasattr(hr, "notes") else None,
            recorded_at=hr.recorded_at,
            created_at=hr.created_at
        ) for hr in data["recent_health_records"]
    ]

    return PatientDashboardResponse(
        patient_name=data["patient_name"],
        upcoming_appointments_count=data["upcoming_appointments_count"],
        medical_history_count=data["medical_history_count"],
        health_records_count=data["health_records_count"],
        prescription_count=data["prescription_count"],
        recent_health_records=recent_health_records,
        latest_prediction=data["latest_prediction"]
    )
