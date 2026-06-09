from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from database.db import Base

class AppSetting(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String, default="DiaShield")
    timezone = Column(String, default="Asia/Kolkata")
    support_email = Column(String, default="support@diashield.com")
    session_timeout = Column(Integer, default=30)
    password_rotation_days = Column(Integer, default=90)
    mfa_enabled = Column(Boolean, default=True)
    email_alerts = Column(Boolean, default=True)
    critical_incident_notifications = Column(Boolean, default=True)
    appointment_digest = Column(Boolean, default=True)
    model_version = Column(String, default="v3.2.1")
    log_retention_days = Column(Integer, default=180)
    maintenance_mode = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
