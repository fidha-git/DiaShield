from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from utils.auth_middleware import get_current_user
from models.health_record_model import HealthRecord
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

    # Query all health records for this patient
    records = db.query(HealthRecord).filter(HealthRecord.patient_id == patient.id).all()
    if not records:
        logging.info(f"No health records found for patient_id={patient.id}")
        return {"monthly_analytics": []}

    # Bucket records by (year, month) so multiple years stay distinct
    month_buckets: dict[tuple, dict] = {}
    for record in records:
        dt = getattr(record, "created_at", None) or getattr(record, "recorded_at", None)
        if not dt:
            continue
        key = (dt.year, dt.month)
        if key not in month_buckets:
            month_buckets[key] = {"month_label": dt.strftime("%b"), "total_bs": 0.0, "count": 0}
        bs = _parse_numeric(getattr(record, "blood_sugar", None))
        if bs is not None:
            month_buckets[key]["total_bs"] += bs
            month_buckets[key]["count"] += 1

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

    logging.info(f"Monthly analytics for patient_id={patient.id}: {monthly_analytics}")
    print(f"[Analytics] patient_id={patient.id} monthly_analytics={monthly_analytics}")
    return {"monthly_analytics": monthly_analytics}
