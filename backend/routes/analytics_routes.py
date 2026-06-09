from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from utils.auth_middleware import get_current_user
from models.health_record_model import HealthRecord
from models.health_model import HealthLog
from models.prediction_history_model import PredictionHistory
from models.patient_model import Patient
from datetime import datetime
import logging
import re

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

def _parse_numeric(val) -> float | None:
    """Extract first numeric value from a string like '120', '120.5', '120 mg/dL'."""
    if val is None:
        return None
    match = re.search(r"[\d.]+", str(val))
    return float(match.group()) if match else None


def _ingest_into_buckets(buckets: dict, dt: datetime, value: float, label: str):
    """Helper: add a single (date, numeric) reading into month buckets."""
    if dt is None or value is None:
        return
    key = (dt.year, dt.month)
    if key not in buckets:
        buckets[key] = {"month_label": dt.strftime("%b"), "total_bs": 0.0, "count": 0}
    buckets[key]["total_bs"] += value
    buckets[key]["count"] += 1


@router.get("/monthly")
def get_monthly_analytics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Returns monthly analytics for the current patient:
    {
      "monthly_analytics": [
        { "month": "Jan", "avg_blood_sugar": 118.5, "record_count": 5 }
      ]
    }
    """
    # Only allow patients
    if getattr(current_user, "role", None) != "patient":
        logging.warning(
            f"User {getattr(current_user, 'id', None)} attempted analytics access "
            f"with role {getattr(current_user, 'role', None)}"
        )
        raise HTTPException(status_code=403, detail="Only patients can access analytics.")

    # Find the patient profile for the current user
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        logging.error(f"No patient profile found for user_id={current_user.id}")
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    month_buckets: dict[tuple, dict] = {}

    # 1. HealthRecord.blood_sugar (manually entered by patient)
    hr_records = db.query(HealthRecord).filter(HealthRecord.patient_id == patient.id).all()
    for record in hr_records:
        dt = getattr(record, "created_at", None) or getattr(record, "recorded_at", None)
        bs = _parse_numeric(getattr(record, "blood_sugar", None))
        _ingest_into_buckets(month_buckets, dt, bs, "HealthRecord")

    # 2. HealthLog.blood_sugar (daily tracking, linked to user_id)
    logs = db.query(HealthLog).filter(HealthLog.user_id == current_user.id).all()
    for log in logs:
        _ingest_into_buckets(month_buckets, log.created_at, log.blood_sugar, "HealthLog")

    # 3. PredictionHistory.glucose (values entered during risk assessment)
    predictions = db.query(PredictionHistory).filter(PredictionHistory.patient_id == patient.id).all()
    for pred in predictions:
        _ingest_into_buckets(month_buckets, pred.created_at, pred.glucose, "Prediction")

    if not month_buckets:
        logging.info(f"No glucose data found for patient_id={patient.id} in any source")
        return {"monthly_analytics": []}

    # Sort chronologically and build response
    monthly_analytics = [
        {
            "month": v["month_label"],
            "avg_blood_sugar": round(v["total_bs"] / v["count"], 1) if v["count"] > 0 else 0,
            "record_count": v["count"],
        }
        for k, v in sorted(month_buckets.items())
        if v["count"] > 0
    ]

    logging.info(f"[Analytics] patient_id={patient.id} monthly_analytics={monthly_analytics}")
    print(f"[Analytics] patient_id={patient.id} monthly_analytics={monthly_analytics}")
    return {"monthly_analytics": monthly_analytics}
