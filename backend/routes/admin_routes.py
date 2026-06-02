# ==========================================
# Imports
# ==========================================

from datetime import datetime
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from database.db import get_db

from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role

from models.admin_model import Admin
from models.user_model import User
from models.doctor_model import Doctor
from models.prediction_history_model import PredictionHistory
from models.appointment_model import Appointment

from schemas.admin_schema import (
    AdminCreate,
    AdminResponse,
    UserResponse
)

from schemas.analytics_schema import AnalyticsResponse
from schemas.activity_log_schema import ActivityLogResponse

from services.analytics_service import get_analytics_data
from services.activity_log_service import get_activity_logs


# ==========================================
# Router
# ==========================================

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ==========================================
# Role Protection
# ==========================================

admin_only = require_role(["admin"])


# ==========================================
# Activity Logs
# ==========================================

@router.get(
    "/activity-logs",
    response_model=List[ActivityLogResponse],
    dependencies=[Depends(admin_only)]
)
def activity_logs(
    db: Session = Depends(get_db)
):
    return get_activity_logs(db)


# ==========================================
# Block User
# ==========================================

@router.put(
    "/block-user/{user_id}",
    dependencies=[Depends(admin_only)]
)
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot block self"
        )

    user.is_active = False

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User blocked successfully"
    }


# ==========================================
# Unblock User
# ==========================================

@router.put(
    "/unblock-user/{user_id}",
    dependencies=[Depends(admin_only)]
)
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.is_active = True

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "User unblocked successfully"
    }


# ==========================================
# Delete User
# ==========================================

@router.delete(
    "/delete-user/{user_id}",
    dependencies=[Depends(admin_only)]
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete self"
        )

    try:
        db.delete(user)
        db.commit()

        return {
            "success": True,
            "message": "User deleted successfully"
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Delete failed"
        )


# ==========================================
# Analytics Dashboard
# ==========================================

@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
    dependencies=[Depends(admin_only)]
)
def analytics_dashboard(
    db: Session = Depends(get_db)
):

    return get_analytics_data(db)


# ==========================================
# Users
# ==========================================

@router.get(
    "/users",
    response_model=List[UserResponse],
    dependencies=[Depends(admin_only)]
)
def get_all_users(
    db: Session = Depends(get_db)
):

    return db.query(User).all()


# ==========================================
# Doctors
# ==========================================

@router.get(
    "/doctors",
    dependencies=[Depends(admin_only)]
)
def get_all_doctors(
    db: Session = Depends(get_db)
):

    return db.query(Doctor).all()


# ==========================================
# Predictions
# ==========================================

@router.get(
    "/predictions",
    dependencies=[Depends(admin_only)]
)
def get_all_predictions(
    db: Session = Depends(get_db)
):

    return db.query(PredictionHistory).all()


# ==========================================
# Appointments
# ==========================================

@router.get(
    "/appointments",
    dependencies=[Depends(admin_only)]
)
def get_all_appointments(
    db: Session = Depends(get_db)
):

    return db.query(Appointment).all()