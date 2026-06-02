# routes/health_record_routes.py
# FastAPI router for HealthRecord APIs

from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException
)
from sqlalchemy.orm import Session
from schemas.health_record_schema import (
    HealthRecordCreate,
    HealthRecordUpdate,
    HealthRecordResponse
)
from services.health_record_service import (
    create_health_record,
    get_health_records_by_patient,
    update_health_record,
    delete_health_record
)
from models.patient_model import Patient
from database.db import get_db
from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role

router = APIRouter(
    prefix="/health-record",
    tags=["Health Record"]
)

# Only allow users with patient role

def patient_only(
    current_user=Depends(get_current_user)
):
    require_role(["patient"])(current_user)
    return current_user

# Create a new health record
@router.post("/create", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    data: HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    """
    Create a new health record for the current patient.
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return create_health_record(db, patient.id, data)

# Get all health records for a patient
@router.get("/{patient_id}", response_model=list[HealthRecordResponse])
def get_records(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    """
    Retrieve all health records for a patient. Only the owner can access.
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    if patient.id != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    return get_health_records_by_patient(db, patient_id)

# Update a health record
@router.put("/update/{record_id}", response_model=HealthRecordResponse)
def update_record(
    record_id: int,
    data: HealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    """
    Update a health record. Only the owner can update.
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return update_health_record(db, record_id, patient.id, data)

# Delete a health record
@router.delete("/delete/{record_id}")
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    """
    Delete a health record. Only the owner can delete.
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return delete_health_record(db, record_id, patient.id)
