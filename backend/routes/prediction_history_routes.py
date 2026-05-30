"""
Routes for Prediction History
"""
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
from utils.role_checker import require_role
from models.patient_model import Patient
from typing import List

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
    return get_prediction_history(db, patient_id)

@router.get("/latest", response_model=PredictionHistoryResponse)
def latest_history(
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    patient_id = get_patient_id(db, current_user.id)
    prediction = get_latest_prediction(db, patient_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="No prediction history found")
    return prediction

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
