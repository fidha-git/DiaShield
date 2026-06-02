from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import get_db
from models.user_model import User
from models.patient_model import Patient
from schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    UserRegister
)

from services.activity_log_service import log_activity
from utils.jwt_handler import create_access_token
from utils.security import (
    get_password_hash,
    verify_password
)


# Create router
router = APIRouter(tags=["auth"])

# Ensure UserCreateResponse is defined before use
class UserCreateResponse(BaseModel):
    success: bool
    message: str

@router.post(
    "/register",
    response_model=UserCreateResponse
)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    try:

        # Check email
        existing_email = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Check username
        existing_username = db.query(User).filter(
            User.username == user.username
        ).first()

        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        # Hash password
        hashed_password = get_password_hash(
            user.password.strip()
        )

        # Create user
        new_user = User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            role=user.role,
            created_at=datetime.now(timezone.utc)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)


        # Auto-create patient profile
        if new_user.role.lower() == "patient":
            patient = Patient(
                user_id=new_user.id,
                name=new_user.username,
                age=18,
                gender="Not Specified",
                phone="0000000000",
                address="",
                height=0,
                weight=0,
                blood_group="Unknown",
                profile_image="",
                email=new_user.email,
                emergency_contact_name="",
                emergency_contact_phone="",
                emergency_contact_relationship="",
                insurance_provider="",
                policy_number="",
                group_code="",
                primary_clinic=""
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)

        return {
            "success": True,
            "message": "User registered successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# -----------------------------
# Login
# -----------------------------

@router.post(
    "/login",
    response_model=LoginResponse
)
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    # Find user by email or username
    user = db.query(User).filter(
        (User.email == login_data.email) | (User.username == login_data.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # Verify password
    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # Check blocked account
    if user.is_active is False:
        raise HTTPException(
            status_code=403,
            detail="Account is blocked. Contact admin."
        )

    # Save activity log
    log_activity(
        db,
        user.id,
        "User logged in"
    )

    # Generate JWT token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "username": user.username,
            "role": user.role
        }
    )

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }