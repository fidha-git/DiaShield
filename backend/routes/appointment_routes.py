from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role

from schemas.appointment_schema import (
    AppointmentCreate,
    AppointmentResponse
)

from services.appointment_service import (
    book_appointment,
    get_user_appointments,
    cancel_appointment,
    get_appointment_by_slot,
    doctor_cancel_appointment,
    get_doctor_appointments,
    complete_appointment,
    reschedule_appointment,
    get_doctor_dashboard
)

# -------------------------
# Create router FIRST
# -------------------------

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)


# -------------------------
# Book appointment
# -------------------------

@router.post(
    "/book/{slot_id}",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED
)
def book_appointment_route(
    slot_id: int,
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["patient"]))
):
    """
    Book an appointment (patients only).
    """
    appointment.slot_id = slot_id
    return book_appointment(
        db,
        current_user.id,
        appointment
    )


# -------------------------
# Get my appointments
# -------------------------

from fastapi import Query

# ...existing code...

from schemas.enriched_appointment_schema import EnrichedAppointmentResponse

@router.get(
    "/my-appointments",
    response_model=dict,  # OpenAPI: returns paginated dict with enriched appointments
)
def get_my_appointments_route(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["patient"])),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Results per page"),
    status: str = Query(None, description="Filter by status: booked, completed, cancelled")
):
    """
    View own appointments (patients only), paginated and filterable by status.
    """
    return get_user_appointments(
        db,
        current_user.id,
        page=page,
        limit=limit,
        status=status
    )


# -------------------------
# Cancel appointment
# -------------------------

@router.delete(
    "/cancel/{appointment_id}",
    response_model=AppointmentResponse,
    status_code=status.HTTP_200_OK
)
def cancel_appointment_route(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["patient"]))
):
    """
    Cancel own appointment (patients only).
    """
    return cancel_appointment(
        db,
        appointment_id,
        current_user.id
    )


# -------------------------
# Doctor view appointments
# -------------------------

@router.get(
    "/doctor/{doctor_id}",
    # No response_model for paginated dict
)
def get_doctor_appointments_route(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor"])),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Results per page"),
    status: str = Query(None, description="Filter by status: booked, completed, cancelled")
):
    """
    View all appointments for a doctor (doctors only), paginated and filterable by status.
    """
    return get_doctor_appointments(
        db,
        doctor_id,
        page=page,
        limit=limit,
        status=status
    )


# -------------------------
# Complete appointment
# -------------------------

@router.put(
    "/complete/{appointment_id}",
    response_model=AppointmentResponse,
    status_code=status.HTTP_200_OK
)
def complete_appointment_route(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor"]))
):
    """
    Mark appointment as completed (doctors only).
    """
    return complete_appointment(
        db,
        appointment_id
    )


# -------------------------
# Reschedule appointment
# -------------------------

@router.put(
    "/reschedule/{appointment_id}/{new_slot_id}",
    response_model=AppointmentResponse,
    status_code=status.HTTP_200_OK
)
def reschedule_appointment_route(
    appointment_id: int,
    new_slot_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["patient"]))
):
    """
    Reschedule own appointment (patients only).
    """
    return reschedule_appointment(
        db,
        appointment_id,
        new_slot_id,
        current_user.id
    )


# -------------------------
# Get appointment by slot
# -------------------------

@router.get(
    "/slot/{slot_id}",
    status_code=status.HTTP_200_OK
)
def get_appointment_by_slot_route(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor", "admin"]))
):
    """
    Get appointment details for a specific slot (doctors/admin only).
    Useful for viewing booking details from the slot management page.
    """
    return get_appointment_by_slot(db, slot_id)


# -------------------------
# Doctor cancel appointment
# -------------------------

@router.put(
    "/doctor-cancel/{appointment_id}",
    status_code=status.HTTP_200_OK
)
def doctor_cancel_appointment_route(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor"]))
):
    """
    Cancel an appointment (doctors only).
    Frees the slot and marks the appointment as cancelled.
    """
    from models.doctor_model import Doctor
    doctor = db.query(Doctor).filter(
        Doctor.user_id == current_user.id
    ).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    return doctor_cancel_appointment(db, appointment_id, doctor.id)


# -------------------------
# Doctor dashboard
# -------------------------

@router.get(
    "/dashboard/{doctor_id}",
    status_code=status.HTTP_200_OK
)
def doctor_dashboard_route(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["doctor"]))
):
    """
    View doctor dashboard (doctors only).
    """
    return get_doctor_dashboard(
        db,
        doctor_id
    )