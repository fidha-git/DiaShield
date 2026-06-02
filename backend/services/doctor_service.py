"""
Service layer for Doctor profile management.
Handles database operations for Doctor.
"""

from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.doctor_model import Doctor
from models.user_model import User
from schemas.doctor_schema import (
    DoctorCreate,
    DoctorUpdate
)
from utils.security import get_password_hash


def _create_user_for_doctor(db: Session, doctor_data: DoctorCreate) -> User:
    """Create a User account with role=doctor when admin creates a doctor."""
    from utils.security import get_password_hash
    existing = db.query(User).filter(
        User.email == doctor_data.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    user = User(
        username=doctor_data.email.split("@")[0],
        email=doctor_data.email,
        password=get_password_hash(doctor_data.password),
        role="doctor",
        created_at=datetime.utcnow(),
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


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

    # If email and password provided, create the User account first (admin flow)
    if doctor_data.email and doctor_data.password:
        user = _create_user_for_doctor(db, doctor_data)
        user_id = user.id

    payload = doctor_data.model_dump(exclude={"email", "password"})
    doctor = Doctor(
        user_id=user_id,
        **payload
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
    doctor_data: DoctorUpdate,
    current_user: User = None
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

    # Ownership check — skip for admins
    if (not current_user or current_user.role != "admin") and doctor.user_id != user_id:
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
    user_id: int,
    current_user: User = None
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

    # Ownership check — skip for admins
    if (not current_user or current_user.role != "admin") and doctor.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    db.delete(doctor)

    db.commit()

    return {
        "message": "Doctor profile deleted successfully"
    }

# Return doctor profile by user_id
def get_doctor_by_user_id(db: Session, user_id: int):
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found for this user"
        )
    return doctor

# Return all doctors in the database
def get_all_doctors(db: Session):
    """
    Return all doctors in the database
    """
    return db.query(Doctor).all()