"""
Routes for Prediction History
"""
import joblib
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.prediction_history_schema import (
    PredictionHistoryCreate,
    PredictionHistoryResponse
)
from services.prediction_history_service import (
    create_prediction_history,
    get_prediction_history,
    get_latest_prediction,
    delete_prediction_history
)
from database.db import get_db
from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role
from utils.explainability import compute_top_factors
from models.patient_model import Patient
from typing import List

# Load model for explainability
MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "model.pkl"
try:
    _explain_model = joblib.load(MODEL_PATH)
except Exception:
    _explain_model = None

router = APIRouter(prefix="/prediction-history", tags=["Prediction History"])

# Role protection

def patient_only(current_user=Depends(get_current_user)):
    require_role(["patient"])(current_user)
    return current_user

# Helper to get patient_id from user

def get_patient_id(db: Session, user_id: int):
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return patient.id

@router.post("/create", response_model=PredictionHistoryResponse, status_code=status.HTTP_201_CREATED)
def create_history(
    data: PredictionHistoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    patient_id = get_patient_id(db, current_user.id)
    prediction = create_prediction_history(db, patient_id, data)
    return prediction

@router.get("/", response_model=List[PredictionHistoryResponse])
def list_history(
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    patient_id = get_patient_id(db, current_user.id)
    records = get_prediction_history(db, patient_id)
    result = []
    for rec in records:
        item = {
            "id": rec.id,
            "patient_id": rec.patient_id,
            "prediction_result": rec.prediction_result,
            "risk_level": rec.risk_level,
            "probability": rec.probability,
            "glucose": rec.glucose,
            "bmi": rec.bmi,
            "blood_pressure": rec.blood_pressure,
            "age": rec.age,
            "pregnancies": rec.pregnancies,
            "skin_thickness": rec.skin_thickness,
            "insulin": rec.insulin,
            "diabetes_pedigree": rec.diabetes_pedigree,
            "created_at": rec.created_at,
        }
        if _explain_model is not None and hasattr(_explain_model, "named_steps"):
            raw = [
                float(rec.pregnancies or 0),
                float(rec.glucose or 0),
                float(rec.blood_pressure or 0),
                float(rec.skin_thickness or 0),
                float(rec.insulin or 0),
                float(rec.bmi or 0),
                float(rec.diabetes_pedigree or 0),
                float(rec.age or 0),
            ]
            item["top_factors"] = compute_top_factors(raw, _explain_model)
        else:
            item["top_factors"] = None
        result.append(item)
    return result

@router.get("/latest", response_model=PredictionHistoryResponse)
def latest_history(
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    patient_id = get_patient_id(db, current_user.id)
    rec = get_latest_prediction(db, patient_id)
    if not rec:
        raise HTTPException(status_code=404, detail="No prediction history found")
    item = {
        "id": rec.id,
        "patient_id": rec.patient_id,
        "prediction_result": rec.prediction_result,
        "risk_level": rec.risk_level,
        "probability": rec.probability,
        "glucose": rec.glucose,
        "bmi": rec.bmi,
        "blood_pressure": rec.blood_pressure,
        "age": rec.age,
        "pregnancies": rec.pregnancies,
        "skin_thickness": rec.skin_thickness,
        "insulin": rec.insulin,
        "diabetes_pedigree": rec.diabetes_pedigree,
        "created_at": rec.created_at,
    }
    if _explain_model is not None and hasattr(_explain_model, "named_steps"):
        raw = [
            float(rec.pregnancies or 0),
            float(rec.glucose or 0),
            float(rec.blood_pressure or 0),
            float(rec.skin_thickness or 0),
            float(rec.insulin or 0),
            float(rec.bmi or 0),
            float(rec.diabetes_pedigree or 0),
            float(rec.age or 0),
        ]
        item["top_factors"] = compute_top_factors(raw, _explain_model)
    else:
        item["top_factors"] = None
    return item

@router.delete("/delete/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    patient_id = get_patient_id(db, current_user.id)
    deleted = delete_prediction_history(db, patient_id, prediction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediction history not found")
    return None
