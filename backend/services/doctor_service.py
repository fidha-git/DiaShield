"""
Service layer for Doctor profile management.
Handles database operations for Doctor.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.doctor_model import Doctor
from schemas.doctor_schema import (
    DoctorCreate,
    DoctorUpdate
)


# Create doctor profile
def create_doctor(
    db: Session,
    user_id: int,
    doctor_data: DoctorCreate
):
    """
    Create doctor profile
    """

    # Check whether profile already exists
    existing = db.query(
        Doctor
    ).filter(
        Doctor.user_id == user_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor profile already exists"
        )

    doctor = Doctor(
        user_id=user_id,
        **doctor_data.model_dump()
    )

    db.add(doctor)

    db.commit()

    db.refresh(doctor)

    return doctor


# Get doctor profile
def get_doctor(
    db: Session,
    doctor_id: int
):
    """
    Get doctor profile
    """

    doctor = db.query(
        Doctor
    ).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )

    return doctor


# Update doctor profile
def update_doctor(
    db: Session,
    doctor_id: int,
    user_id: int,
    doctor_data: DoctorUpdate
):
    """
    Update doctor profile
    """

    doctor = db.query(
        Doctor
    ).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )

    # Ownership check
    if doctor.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    update_data = doctor_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            doctor,
            field,
            value
        )

    db.commit()

    db.refresh(doctor)

    return doctor


# Delete doctor profile
def delete_doctor(
    db: Session,
    doctor_id: int,
    user_id: int
):
    """
    Delete doctor profile
    """

    doctor = db.query(
        Doctor
    ).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )

    # Ownership check
    if doctor.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    db.delete(doctor)

    db.commit()

    return {
        "message": "Doctor profile deleted successfully"
    }

# Return all doctors in the database
def get_all_doctors(db: Session):
    """
    Return all doctors in the database
    """
    return db.query(Doctor).all()