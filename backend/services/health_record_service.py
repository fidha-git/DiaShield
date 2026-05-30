# services/health_record_service.py
# Business logic for HealthRecord

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.health_record_model import HealthRecord
from schemas.health_record_schema import (
    HealthRecordCreate,
    HealthRecordUpdate
)

def create_health_record(db: Session, patient_id: int, data: HealthRecordCreate):
    """
    Create a new health record for a patient.
    """
    record = HealthRecord(patient_id=patient_id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_health_records_by_patient(db: Session, patient_id: int):
    """
    Get all health records for a patient.
    """
    return db.query(HealthRecord).filter(HealthRecord.patient_id == patient_id).all()

def update_health_record(db: Session, record_id: int, patient_id: int, data: HealthRecordUpdate):
    """
    Update a health record if it belongs to the patient.
    """
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health record not found.")
    if record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this record.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record

def delete_health_record(db: Session, record_id: int, patient_id: int):
    """
    Delete a health record if it belongs to the patient.
    """
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health record not found.")
    if record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this record.")
    db.delete(record)
    db.commit()
    return {"detail": "Health record deleted successfully."}
