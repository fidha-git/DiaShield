"""
Service layer for Prediction History
"""
from sqlalchemy.orm import Session
from models.prediction_history_model import PredictionHistory
from models.patient_model import Patient
from schemas.prediction_history_schema import PredictionHistoryCreate
from typing import List, Optional


def create_prediction_history(db: Session, patient_id: int, data: PredictionHistoryCreate) -> PredictionHistory:
    """
    Create a new prediction history record for a patient.
    """
    prediction = PredictionHistory(
        patient_id=patient_id,
        prediction_result=data.prediction_result,
        risk_level=data.risk_level,
        probability=data.probability
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


def get_prediction_history(db: Session, patient_id: int) -> List[PredictionHistory]:
    """
    Get all prediction history records for a patient.
    """
    return db.query(PredictionHistory).filter(PredictionHistory.patient_id == patient_id).order_by(PredictionHistory.created_at.desc()).all()


def get_latest_prediction(db: Session, patient_id: int) -> Optional[PredictionHistory]:
    """
    Get the latest prediction history record for a patient.
    """
    return db.query(PredictionHistory).filter(PredictionHistory.patient_id == patient_id).order_by(PredictionHistory.created_at.desc()).first()


def delete_prediction_history(db: Session, patient_id: int, prediction_id: int) -> bool:
    """
    Delete a prediction history record by id for a patient.
    """
    prediction = db.query(PredictionHistory).filter(
        PredictionHistory.id == prediction_id,
        PredictionHistory.patient_id == patient_id
    ).first()
    if prediction:
        db.delete(prediction)
        db.commit()
        return True
    return False
