from services.activity_log_service import log_activity
from pathlib import Path

import joblib
import logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from models.prediction_model import Prediction as PredictionModel
from models.user_model import User
from schemas.prediction_schema import (
    PredictionRequest,
    PredictionResponse,
    PredictionDBResponse,
)
from utils.auth_middleware import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

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
        data.pregnancies,
        data.glucose,
        data.blood_pressure,
        data.skin_thickness,
        data.insulin,
        data.bmi,
        data.diabetes_pedigree,
        data.age
    ]]

    logger.debug("Prediction request received for user_id=%s input=%s", current_user.id, input_data[0])

    prediction_label = int(model.predict(input_data)[0])
    result = "Positive" if prediction_label == 1 else "Negative"

    # Always compute diabetes risk from the positive class probability when available.
    risk_probability = 0.0
    model_confidence = 0.0
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(input_data)[0]
        logger.debug("Raw predict_proba output for user_id=%s: %s", current_user.id, probabilities)

        if len(probabilities) >= 2:
            risk_probability = float(probabilities[1])
            model_confidence = float(probabilities[prediction_label])
        else:
            # Fallback for non-binary probability outputs.
            risk_probability = float(probabilities[0])
            model_confidence = float(probabilities[0])
    else:
        # If the model does not expose probabilities, use a deterministic fallback from predicted class.
        risk_probability = 1.0 if prediction_label == 1 else 0.0
        model_confidence = risk_probability

    risk_percentage = round(risk_probability * 100, 2)
    logger.info(
        "Prediction completed user_id=%s label=%s result=%s risk_probability=%.4f risk_percentage=%.2f model_confidence=%.4f",
        current_user.id,
        prediction_label,
        result,
        risk_probability,
        risk_percentage,
        model_confidence,
    )

    # Log activity
    log_activity(db, current_user.id, "Prediction created")
    return {
        "prediction": result,
        # Legacy field used by current frontend.
        "confidence": risk_probability,
        # Explicit fields for future-safe frontend mapping.
        "probability": risk_probability,
        "risk_probability": risk_probability,
        "risk_percentage": risk_percentage,
        "model_confidence": model_confidence,
    }
