from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database.db import get_db
from models.user_model import User
from utils.jwt_handler import SECRET_KEY, ALGORITHM


security = HTTPBearer()



def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user from JWT token, with detailed logging and error reasons.
    """
    authorization = credentials.credentials
    print("Authorization Header:", authorization)
    try:
        payload = jwt.decode(
            authorization,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        print("Decoded Token:", payload)
        email = payload.get("sub")
        if not email:
            print("401: Missing 'sub' claim in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing 'sub' claim in token payload"
            )
    except jwt.ExpiredSignatureError:
        print("401: Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except JWTError as e:
        print(f"401: Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}"
        )
    user = db.query(User).filter(User.email == email).first()
    print("Patient ID:", getattr(user, 'id', None))
    if not user:
        print("401: User not found for email", email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user


def require_role(allowed_roles):
    """
    Role-based authorization middleware
    """

    def role_checker(current_user):

        if current_user.role not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return current_user

    return role_checker