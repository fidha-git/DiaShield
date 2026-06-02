"""
Doctor profile management API routes
"""

import os
import uuid
from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from schemas.doctor_schema import (
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse
)

from services.doctor_service import (
    create_doctor,
    get_doctor,
    update_doctor,
    delete_doctor,
    get_all_doctors,
    get_doctor_by_user_id
)

from database.db import get_db
from utils.auth_middleware import (
    get_current_user
)
from utils.role_middleware import require_role


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# Create router BEFORE decorators
router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.post(
    "/profile/upload-image",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK
)
async def upload_doctor_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor"]))
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Allowed: jpg, jpeg, png, webp"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5 MB"
        )

    upload_dir = "uploads/profile_images"
    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    doctor = get_doctor_by_user_id(db, current_user.id)
    doctor.profile_image = f"/uploads/profile_images/{unique_name}"
    db.commit()
    db.refresh(doctor)

    return doctor


@router.get(
    "/all",
    response_model=list[DoctorResponse],
    status_code=status.HTTP_200_OK
)
def get_all_doctors_route(
    db: Session = Depends(get_db)
):
    """
    Get all doctors (public, no authentication required)
    """
    return get_all_doctors(db)


@router.post(
    "/create",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_doctor_profile(
    doctor_data: DoctorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor", "admin"]))
):
    """
    Create doctor profile
    """

    return create_doctor(
        db=db,
        user_id=current_user.id,
        doctor_data=doctor_data
    )


@router.get(
    "/me",
    response_model=DoctorResponse
)
def get_current_doctor(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor"]))
):
    """
    Get current doctor's own profile (from JWT token).
    """
    return get_doctor_by_user_id(db, current_user.id)


@router.get(
    "/{doctor_id}",
    response_model=DoctorResponse
)
def get_doctor_profile(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    """
    Get doctor profile
    """

    return get_doctor(
        db=db,
        doctor_id=doctor_id
    )


@router.put(
    "/update/{doctor_id}",
    response_model=DoctorResponse
)
def update_doctor_profile(
    doctor_id: int,
    doctor_data: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor", "admin"]))
):
    """
    Update doctor profile
    """

    return update_doctor(
        db=db,
        doctor_id=doctor_id,
        user_id=current_user.id,
        doctor_data=doctor_data,
        current_user=current_user
    )


@router.delete(
    "/delete/{doctor_id}"
)
def delete_doctor_profile(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor", "admin"]))
):
    """
    Delete doctor profile
    """

    return delete_doctor(
        db=db,
        doctor_id=doctor_id,
        user_id=current_user.id,
        current_user=current_user
    )