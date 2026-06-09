from pydantic import BaseModel
from datetime import datetime

class SettingsResponse(BaseModel):
    id: int
    organization_name: str
    timezone: str
    support_email: str
    session_timeout: int
    password_rotation_days: int
    mfa_enabled: bool
    email_alerts: bool
    critical_incident_notifications: bool
    appointment_digest: bool
    model_version: str
    log_retention_days: int
    maintenance_mode: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    organization_name: str | None = None
    timezone: str | None = None
    support_email: str | None = None
    session_timeout: int | None = None
    password_rotation_days: int | None = None
    mfa_enabled: bool | None = None
    email_alerts: bool | None = None
    critical_incident_notifications: bool | None = None
    appointment_digest: bool | None = None
    model_version: str | None = None
    log_retention_days: int | None = None
    maintenance_mode: bool | None = None
