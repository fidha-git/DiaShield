# routes/medical_history_routes.py

from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException
)

from sqlalchemy.orm import Session

from schemas.medical_history_schema import (
    MedicalHistoryCreate,
    MedicalHistoryUpdate,
    MedicalHistoryResponse
)

from services.medical_history_service import (
    create_medical_history,
    get_medical_history_by_patient,
    update_medical_history,
    delete_medical_history
)

from models.patient_model import Patient
from database.db import get_db

from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role


router = APIRouter(
    prefix="/medical-history",
    tags=["Medical History"]
)


# Only patient users allowed

# Only patient users allowed
def patient_only(current_user=Depends(get_current_user)):
    print("Current user:", getattr(current_user, "username", None))
    print("Current role:", getattr(current_user, "role", None))
    require_role(["patient"])(current_user)
    return current_user


# Create medical history
@router.post(
    "/create",
    response_model=MedicalHistoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_history(
    data: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found"
        )

    return create_medical_history(
        db,
        patient.id,
        data
    )


# Get medical history
@router.get(
    "/{patient_id}",
    response_model=list[MedicalHistoryResponse]
)
def get_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found"
        )

    if patient.id != patient_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    return get_medical_history_by_patient(
        db,
        patient_id
    )


# Update medical history
@router.put(
    "/update/{history_id}",
    response_model=MedicalHistoryResponse
)
def update_history(
    history_id: int,
    data: MedicalHistoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found"
        )

    return update_medical_history(
        db,
        history_id,
        patient.id,
        data
    )


# Delete medical history
@router.delete(
    "/delete/{history_id}"
)
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found"
        )

    return delete_medical_history(
        db,
        history_id,
        patient.id
    )