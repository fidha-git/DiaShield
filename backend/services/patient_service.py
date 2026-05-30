# Fix imports for upload_profile_image
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
import os
import uuid
# ...existing code...

# Upload profile image
async def upload_profile_image(db: Session, user_id: int, file: UploadFile):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only jpg, jpeg, png allowed.")

    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB.")

    # Get patient profile
    patient = db.query(Patient).filter(Patient.user_id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Ensure upload directory exists
    upload_dir = os.path.join("uploads", "profile_images")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)

    # Store path in patient.profile_image
    patient.profile_image = file_path.replace("\\", "/")
    db.commit()

    return {
        "message": "Profile image uploaded successfully",
        "image_url": patient.profile_image
    }
# services/patient_service.py

# Handles business logic for Patient profile
# No database logic inside routes

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.patient_model import Patient
from schemas.patient_schema import (
    PatientCreate,
    PatientUpdate
)


# Create patient profile
def create_patient_profile(
    db: Session,
    user_id: int,
    patient_data: PatientCreate
):

    # Check if patient profile already exists
    existing_patient = db.query(
        Patient
    ).filter(
        Patient.user_id == user_id
    ).first()

    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient profile already exists"
        )

    # Create new patient object
    patient = Patient(
        user_id=user_id,
        **patient_data.model_dump()
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


# Get patient profile
def get_patient_profile(
    db: Session,
    patient_id: int
):

    patient = db.query(
        Patient
    ).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )

    return patient


# Update patient profile
def update_patient_profile(
    db: Session,
    patient_id: int,
    user_id: int,
    update_data: PatientUpdate
):

    patient = db.query(
        Patient
    ).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )

    # Allow only owner of profile
    if patient.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update profile"
        )

    update_fields = update_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_fields.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)

    return patient


# Delete patient profile
def delete_patient_profile(
    db: Session,
    patient_id: int,
    user_id: int
):

    patient = db.query(
        Patient
    ).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )

    # Allow only owner of profile
    if patient.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete profile"
        )

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient profile deleted successfully"
    }