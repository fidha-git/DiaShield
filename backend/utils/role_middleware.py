"""
Reusable role-based authorization dependency for FastAPI DiaShield backend.
- Use with Depends(require_role(["role1", "role2"]))
- Reads current user from JWT using get_current_user
- Raises HTTP 403 if user role is not allowed
"""
from fastapi import Depends, HTTPException, status
from utils.auth_middleware import get_current_user

def require_role(allowed_roles: list):
    """
    Dependency to require a user to have one of the allowed roles.
    Returns the current user if authorized.
    """
    def checker(current_user=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{'/'.join(allowed_roles).capitalize()} access required"
            )
        return current_user
    return checker
