"""
Service layer for Laboratory Reports in DiaShield.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from datetime import datetime
from models.laboratory_report_model import LaboratoryReport
from schemas.laboratory_report_schema import (
    LaboratoryReportCreate,
    LaboratoryReportUpdate
)
from utils.file_handler import save_lab_report, delete_lab_report


def create_laboratory_report(
    db: Session,
    user_id: int,
    data: LaboratoryReportCreate
):
    """
    Create a new laboratory report for a user.
    """
    report = LaboratoryReport(
        user_id=user_id,
        **data.model_dump()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_patient_laboratory_reports(
    db: Session,
    user_id: int
):
    """
    Get all laboratory reports for a user (patient).
    Returns reports sorted by report_date (newest first).
    """
    reports = db.query(LaboratoryReport).filter(
        LaboratoryReport.user_id == user_id
    ).order_by(LaboratoryReport.report_date.desc()).all()
    return reports


def get_laboratory_report(
    db: Session,
    report_id: int
):
    """
    Get a single laboratory report by ID.
    """
    report = db.query(LaboratoryReport).filter(
        LaboratoryReport.id == report_id
    ).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratory report not found."
        )
    return report


def update_laboratory_report(
    db: Session,
    report_id: int,
    user_id: int,
    data: LaboratoryReportUpdate
):
    """
    Update a laboratory report if it belongs to the user.
    """
    report = db.query(LaboratoryReport).filter(
        LaboratoryReport.id == report_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratory report not found."
        )
    
    if report.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this report."
        )
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    return report


def delete_laboratory_report(
    db: Session,
    report_id: int,
    user_id: int
):
    """
    Delete a laboratory report if it belongs to the user.
    """
    report = db.query(LaboratoryReport).filter(
        LaboratoryReport.id == report_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratory report not found."
        )
    
    if report.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this report."
        )
    
    db.delete(report)
    db.commit()
    return {"detail": "Laboratory report deleted successfully."}


async def upload_laboratory_report(
    db: Session,
    user_id: int,
    file: UploadFile,
    report_name: str,
    report_type: str,
    report_date: str
):
    """
    Handle file upload and create laboratory report record.
    
    Args:
        db: Database session
        user_id: User uploading the report
        file: Uploaded file
        report_name: Name of the report
        report_type: Type of report (e.g., "Blood Test", "X-Ray")
        report_date: Date of the report (ISO format)
        
    Returns:
        LaboratoryReport: Created report with file metadata
    """
    try:
        print(f"[LAB_REPORT_SERVICE] Upload started - user_id={user_id}, report_name={report_name}")
        
        # Save file and get URL
        file_url, original_filename = await save_lab_report(file, user_id)
        print(f"[LAB_REPORT_SERVICE] File saved successfully: {file_url}")
        
        # Create database record
        report = LaboratoryReport(
            user_id=user_id,
            report_name=report_name,
            report_type=report_type,
            report_date=report_date,
            file_url=file_url,
            ordered_by="Patient",
            created_at=datetime.utcnow()
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        print(f"[LAB_REPORT_SERVICE] Report record created: id={report.id}")
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LAB_REPORT_SERVICE] Error in upload_laboratory_report: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading report: {str(e)}"
        )
