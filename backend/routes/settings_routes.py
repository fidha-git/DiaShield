from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from database.db import get_db

from utils.role_middleware import require_role

from schemas.settings_schema import SettingsResponse, SettingsUpdate

from services.settings_service import get_settings, update_settings

admin_only = require_role(["admin"])

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get(
    "/settings",
    response_model=SettingsResponse,
    dependencies=[Depends(admin_only)]
)
def read_settings(
    db: Session = Depends(get_db)
):
    return get_settings(db)

@router.put(
    "/settings",
    response_model=SettingsResponse,
    dependencies=[Depends(admin_only)]
)
def save_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db)
):
    return update_settings(db, data)
