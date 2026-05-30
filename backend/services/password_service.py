# Password service for DiaShield Forgot/Reset Password API

from datetime import datetime, timedelta, timezone
import os

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext

from models.user_model import User


# JWT configuration
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "your-secret-key"
)

ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = 15


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def forgot_password(email: str, db: Session):
    """
    Verify user and create reset token
    """

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    expire = datetime.now(
        timezone.utc
    ) + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": expire,
        "type": "reset_password"
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "token": token,
        "message": "Reset token generated successfully"
    }


def reset_password(
    token: str,
    new_password: str,
    db: Session
):
    """
    Reset password using token
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "reset_password":
            raise HTTPException(
                status_code=400,
                detail="Invalid token type"
            )

        user_id = payload.get("sub")

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=400,
            detail="Token expired"
        )

    except jwt.JWTError:
        raise HTTPException(
            status_code=400,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    hashed_password = pwd_context.hash(
        new_password
    )

    user.password = hashed_password

    db.commit()
    db.refresh(user)

    return {
        "message": "Password reset successful"
    }