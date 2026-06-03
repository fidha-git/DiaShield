"""
File upload and handling utilities for DiaShield.
"""
import os
import uuid
from pathlib import Path
from typing import Optional, Tuple
from fastapi import HTTPException, status, UploadFile


# Configuration
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
LAB_REPORTS_DIR = UPLOAD_DIR / "lab_reports"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}


def ensure_upload_directory():
    """Ensure the lab_reports upload directory exists"""
    LAB_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[FILE_HANDLER] Upload directory ensured: {LAB_REPORTS_DIR}")


def validate_file(file: UploadFile) -> Tuple[bool, Optional[str]]:
    """
    Validate uploaded file.
    
    Returns:
        Tuple[bool, Optional[str]]: (is_valid, error_message)
    """
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        error = f"Invalid file type. Allowed: PDF, JPG, PNG (got {file_ext})"
        return False, error
    
    print(f"[FILE_HANDLER] File extension valid: {file_ext}")
    return True, None


async def save_lab_report(file: UploadFile, user_id: int) -> Tuple[str, str]:
    """
    Save a lab report file.
    
    Args:
        file: UploadFile from FastAPI
        user_id: ID of the user uploading
        
    Returns:
        Tuple[str, str]: (file_url, original_filename)
        
    Raises:
        HTTPException: If validation or save fails
    """
    try:
        # Validate file
        is_valid, error_msg = validate_file(file)
        if not is_valid:
            print(f"[FILE_HANDLER] Validation failed: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Check file size (read content first)
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_FILE_SIZE:
            error = f"File too large. Max size: 10MB (got {file_size / 1024 / 1024:.2f}MB)"
            print(f"[FILE_HANDLER] Size validation failed: {error}")
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=error
            )
        
        print(f"[FILE_HANDLER] File size valid: {file_size / 1024:.2f}KB")
        
        # Ensure upload directory exists
        ensure_upload_directory()
        
        # Generate unique filename (preserving extension)
        file_ext = Path(file.filename).suffix.lower()
        unique_filename = f"{user_id}_{uuid.uuid4()}{file_ext}"
        file_path = LAB_REPORTS_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        print(f"[FILE_HANDLER] File saved: {file_path}")
        
        # Return relative URL path (for storage and serving)
        file_url = f"lab_reports/{unique_filename}"
        
        return file_url, file.filename
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FILE_HANDLER] Error saving file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )


def delete_lab_report(file_url: str) -> bool:
    """
    Delete a lab report file.
    
    Args:
        file_url: The relative file URL (e.g., "lab_reports/filename.pdf")
        
    Returns:
        bool: True if deleted successfully
    """
    try:
        file_path = UPLOAD_DIR / file_url
        if file_path.exists():
            file_path.unlink()
            print(f"[FILE_HANDLER] File deleted: {file_path}")
            return True
        else:
            print(f"[FILE_HANDLER] File not found: {file_path}")
            return False
    except Exception as e:
        print(f"[FILE_HANDLER] Error deleting file: {str(e)}")
        return False
