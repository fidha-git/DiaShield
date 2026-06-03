"""
API routes for Laboratory Reports in DiaShield.
"""

import traceback
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from schemas.laboratory_report_schema import (
    LaboratoryReportCreate,
    LaboratoryReportUpdate,
    LaboratoryReportResponse
)

from services.laboratory_report_service import (
    create_laboratory_report,
    get_patient_laboratory_reports,
    get_laboratory_report,
    update_laboratory_report,
    delete_laboratory_report,
    upload_laboratory_report
)

from utils.auth_middleware import get_current_user
from utils.role_middleware import require_role
from database.db import get_db


router = APIRouter(
    prefix="/health-records",
    tags=["Health Records - Laboratory Reports"]
)


@router.post(
    "/labs",
    response_model=LaboratoryReportResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_lab_report(
    data: LaboratoryReportCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """
    Create a new laboratory report for the logged-in patient.
    """
    try:
        user_id = current_user.id
        return create_laboratory_report(db, user_id, data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORTS] Error creating report: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get(
    "/labs",
    response_model=list[LaboratoryReportResponse]
)
async def read_patient_labs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """
    Get all laboratory reports for the logged-in patient.
    Reports are sorted by date (newest first).
    """
    try:
        user_id = current_user.id
        reports = get_patient_laboratory_reports(db, user_id)
        return reports
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORTS] Error fetching reports: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get(
    "/labs/{report_id}",
    response_model=LaboratoryReportResponse
)
async def read_lab_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """
    Get a specific laboratory report by ID.
    Only the owner can retrieve their report.
    """
    try:
        report = get_laboratory_report(db, report_id)
        
        # Verify ownership
        if report.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this report."
            )
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORTS] Error fetching report: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.put(
    "/labs/{report_id}",
    response_model=LaboratoryReportResponse
)
async def update_lab_report(
    report_id: int,
    data: LaboratoryReportUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """
    Update a laboratory report.
    Only the owner can update their report.
    """
    try:
        user_id = current_user.id
        return update_laboratory_report(db, report_id, user_id, data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORTS] Error updating report: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete(
    "/labs/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_lab_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """
    Delete a laboratory report.
    Only the owner can delete their report.
    """
    try:
        user_id = current_user.id
        delete_laboratory_report(db, report_id, user_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORTS] Error deleting report: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post(
    "/upload-report",
    response_model=LaboratoryReportResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_report(
    file: UploadFile = File(...),
    report_name: str = Form(...),
    report_type: str = Form(...),
    report_date: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _: None = Depends(require_role(["patient"]))
):
    """
    Upload a laboratory report file.
    
    - **file**: PDF, JPG, or PNG file (max 10MB)
    - **report_name**: Name of the report (e.g., "Blood Test Report")
    - **report_type**: Type of report (e.g., "Blood Test", "X-Ray", "ECG")
    - **report_date**: Date of the report (ISO format: YYYY-MM-DD)
    
    Only logged-in patients can upload their own reports.
    """
    try:
        print(f"[LAB_REPORTS] Upload endpoint called - user_id={current_user.id}")
        print(f"[LAB_REPORTS] File: {file.filename}, Report: {report_name}")
        
        user_id = current_user.id
        
        report = await upload_laboratory_report(
            db=db,
            user_id=user_id,
            file=file,
            report_name=report_name,
            report_type=report_type,
            report_date=report_date
        )
        
        print(f"[LAB_REPORTS] Upload successful - report_id={report.id}")
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORTS] Error in upload endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
