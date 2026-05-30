from services.activity_log_service import log_activity
from pathlib import Path

import joblib
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

    prediction_label = model.predict(input_data)[0]
    confidence = float(getattr(model, "predict_proba", lambda x: [[1.0]])(input_data)[0][int(prediction_label)])
    result = "Positive" if int(prediction_label) == 1 else "Negative"

    # Log activity
    log_activity(db, current_user.id, "Prediction created")
    return {
        "prediction": result,
        "confidence": confidence
    }
