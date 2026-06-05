from services.activity_log_service import log_activity
from pathlib import Path

import joblib
import logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from models.prediction_model import Prediction as PredictionModel
from models.prediction_history_model import PredictionHistory
from models.patient_model import Patient
from models.user_model import User
from schemas.prediction_schema import (
    PredictionRequest,
    PredictionResponse,
    PredictionDBResponse,
)
from utils.auth_middleware import get_current_user
from utils.explainability import compute_top_factors

router = APIRouter()
logger = logging.getLogger(__name__)

# Decision threshold for diabetes prediction
# Chosen via threshold optimization on Calibrated LogisticRegression
DIABETES_THRESHOLD = 0.35

# Load the trained model (loaded once when module is imported)
MODEL_PATH = Path(__file__).resolve().parent.parent / "ml" / "model.pkl"
try:
    model = joblib.load(MODEL_PATH)
except Exception:
    model = None


@router.post("/predict")
async def predict(
    data: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run the trained model on provided features and return the result and confidence."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")

    input_data = [[
        float(data.pregnancies),
        float(data.glucose),
        float(data.blood_pressure),
        float(data.skin_thickness),
        float(data.insulin),
        float(data.bmi),
        float(data.diabetes_pedigree),
        float(data.age),
    ]]

    if len(input_data[0]) != model.n_features_in_:
        logger.error(
            "Feature mismatch: expected %s features but received %s",
            model.n_features_in_,
            len(input_data[0]),
        )
        raise HTTPException(
            status_code=422,
            detail=f"Expected {model.n_features_in_} features but received {len(input_data[0])}"
        )

    logger.debug("Prediction request received for user_id=%s input=%s", current_user.id, input_data[0])

    risk_probability = 0.0
    model_confidence = 0.0
    result = "Negative"
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(input_data)[0]
        logger.debug("Raw predict_proba output for user_id=%s: %s", current_user.id, probabilities)

        if len(probabilities) >= 2:
            risk_probability = float(probabilities[1])
            result = "Positive" if risk_probability >= DIABETES_THRESHOLD else "Negative"
            model_confidence = risk_probability if result == "Positive" else (1.0 - risk_probability)
        else:
            risk_probability = float(probabilities[0])
            result = "Positive" if risk_probability >= DIABETES_THRESHOLD else "Negative"
            model_confidence = risk_probability
    else:
        risk_probability = 1.0
        result = "Positive"
        model_confidence = 1.0

    risk_percentage = round(risk_probability * 100, 2)

    # Compute feature contributions for explainability
    if hasattr(model, "named_steps"):
        top_factors = compute_top_factors(input_data[0], model)
    else:
        top_factors = []

    logger.info(
        "Prediction completed user_id=%s result=%s risk_probability=%.4f risk_percentage=%.2f model_confidence=%.4f",
        current_user.id,
        result,
        risk_probability,
        risk_percentage,
        model_confidence,
    )

    # Derive risk_level from prediction_result for consistency
    risk_level = "High Risk" if result == "Positive" else "Low Risk"

    # Look up patient_id for prediction history
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    saved_prediction = PredictionModel(
        user_id=current_user.id,
        pregnancies=int(data.pregnancies),
        glucose=float(data.glucose),
        blood_pressure=float(data.blood_pressure),
        skin_thickness=float(data.skin_thickness),
        insulin=float(data.insulin),
        bmi=float(data.bmi),
        diabetes_pedigree=float(data.diabetes_pedigree),
        age=int(data.age),
        result=result,
    )

    history_record = PredictionHistory(
        patient_id=patient.id,
        prediction_result=result,
        risk_level=risk_level,
        probability=risk_probability,
        glucose=float(data.glucose),
        bmi=float(data.bmi),
        blood_pressure=float(data.blood_pressure),
        age=int(data.age),
        pregnancies=int(data.pregnancies),
        skin_thickness=float(data.skin_thickness),
        insulin=float(data.insulin),
        diabetes_pedigree=float(data.diabetes_pedigree),
    )

    try:
        db.add(saved_prediction)
        db.add(history_record)
        db.commit()
        db.refresh(saved_prediction)
        db.refresh(history_record)
    except Exception as err:
        db.rollback()
        logger.exception("Failed to save prediction for user_id=%s", current_user.id)
        raise HTTPException(status_code=500, detail="Failed to persist prediction")

    # Log activity
    log_activity(db, current_user.id, "Prediction created")
    return {
        "prediction": result,
        "risk_level": risk_level,
        "history_id": history_record.id,
        # Legacy field used by current frontend.
        "confidence": risk_probability,
        # Explicit fields for future-safe frontend mapping.
        "probability": risk_probability,
        "risk_probability": risk_probability,
        "risk_percentage": risk_percentage,
        "model_confidence": model_confidence,
        # Explainability: feature contributions
        "top_factors": top_factors,
    }
