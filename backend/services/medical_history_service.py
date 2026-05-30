# services/medical_history_service.py
# Business logic for Medical History

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.medical_history_model import MedicalHistory
from models.patient_model import Patient
from schemas.medical_history_schema import MedicalHistoryCreate, MedicalHistoryUpdate

# Create a new medical history record
def create_medical_history(db: Session, patient_id: int, data: MedicalHistoryCreate):
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found.")
    record = MedicalHistory(patient_id=patient_id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

# Get all medical history records for a patient
def get_medical_history_by_patient(db: Session, patient_id: int):
    records = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).all()
    return records

# Update a medical history record
def update_medical_history(db: Session, history_id: int, patient_id: int, data: MedicalHistoryUpdate):
    record = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical history record not found.")
    if record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this record.")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record

# Delete a medical history record
def delete_medical_history(db: Session, history_id: int, patient_id: int):
    record = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medical history record not found.")
    if record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this record.")
    db.delete(record)
    db.commit()
    return {"detail": "Medical history record deleted successfully."}
