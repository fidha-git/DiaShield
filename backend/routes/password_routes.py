# Password routes for DiaShield Forgot/Reset Password API

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas.password_schema import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ResetPasswordResponse
)

from services.password_service import (
    forgot_password,
    reset_password
)

from database.db import get_db


router = APIRouter(
    prefix="/password",
    tags=["Password"]
)


@router.post(
    "/forgot",
    summary="Forgot Password"
)
def forgot_password_endpoint(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        result = forgot_password(
            request.email,
            db
        )

        # Returning token temporarily for testing
        return result

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post(
    "/reset",
    response_model=ResetPasswordResponse,
    summary="Reset Password"
)
def reset_password_endpoint(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        result = reset_password(
            request.token,
            request.new_password,
            db
        )

        return ResetPasswordResponse(
            message=result["message"]
        )

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )