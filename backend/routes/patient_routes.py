# routes/patient_routes.py

from fastapi import (
    APIRouter,
    Depends,
    status,
    HTTPException,
    UploadFile,
    File
)

from sqlalchemy.orm import Session

from schemas.patient_schema import (
    PatientCreate,
    PatientUpdate,
    PatientResponse
)

from services.patient_service import (
    create_patient_profile,
    get_patient_profile,
    update_patient_profile,
    delete_patient_profile,
    upload_profile_image
)



from database.db import get_db
from utils.auth_middleware import get_current_user
from utils.role_checker import require_role

router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)


router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)



# Allow only patient users
def patient_only(
    current_user=Depends(get_current_user)
):
    require_role(["patient"])(current_user)
    return current_user


# Upload profile image
@router.post(
    "/upload-image",
    status_code=status.HTTP_200_OK
)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    return await upload_profile_image(db, current_user.id, file)


# Create profile
@router.post(
    "/create",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
def create_profile(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    return create_patient_profile(
        db=db,
        user_id=current_user.id,
        patient_data=patient_data
    )



# Dashboard route must be declared before dynamic routes to avoid conflict
@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):
    """
    Patient dashboard endpoint. Delegates to patient_dashboard_routes logic.
    """
    from services.patient_dashboard_service import get_patient_dashboard_data
    data = get_patient_dashboard_data(db, current_user.id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    from schemas.patient_dashboard_schema import PatientDashboardResponse, HealthRecordSummary
    recent_health_records = [
        HealthRecordSummary(
            id=hr.id,
            created_at=hr.created_at,
            summary=getattr(hr, "summary", None)
        ) for hr in data["recent_health_records"]
    ]

    return PatientDashboardResponse(
        patient_name=data["patient_name"],
        upcoming_appointments_count=data["upcoming_appointments_count"],
        medical_history_count=data["medical_history_count"],
        health_records_count=data["health_records_count"],
        prescription_count=data["prescription_count"],
        recent_health_records=recent_health_records,
        latest_prediction=data["latest_prediction"]
    )

# Get profile
@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
def get_profile(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    patient = get_patient_profile(
        db,
        patient_id
    )

    if patient.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="Not authorized to view profile"
        )

    return patient


# Update profile
@router.put(
    "/update/{patient_id}",
    response_model=PatientResponse
)
def update_profile(
    patient_id: int,
    update_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    return update_patient_profile(
        db,
        patient_id,
        current_user.id,
        update_data
    )


# Delete profile
@router.delete(
    "/delete/{patient_id}"
)
def delete_profile(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(patient_only)
):

    return delete_patient_profile(
        db,
        patient_id,
        current_user.id
    )