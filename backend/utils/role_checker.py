
# Reusable dependency for role-based access
def require_role(allowed_roles):
    """
    Role-based authorization middleware
    """
    def role_checker(current_user):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        return current_user
    return role_checker
"""
Role-based access control for DiaShield
Tech: FastAPI + JWT + SQLAlchemy
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database.db import get_db
from models.user_model import User
from utils.jwt_handler import SECRET_KEY, ALGORITHM


security = HTTPBearer()


def get_current_user_role(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user.role


def RoleChecker(allowed_roles: list):

    def checker(
        role: str = Depends(get_current_user_role)
    ):

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return True

    return checker