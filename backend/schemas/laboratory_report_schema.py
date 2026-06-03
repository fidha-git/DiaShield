"""
Pydantic schemas for Laboratory Reports in DiaShield.
"""

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class LaboratoryReportBase(BaseModel):
    report_name: str
    report_type: str
    report_date: datetime
    file_url: Optional[str] = None
    ordered_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LaboratoryReportCreate(LaboratoryReportBase):
    pass


class LaboratoryReportUpdate(BaseModel):
    report_name: Optional[str] = None
    report_type: Optional[str] = None
    report_date: Optional[datetime] = None
    file_url: Optional[str] = None
    ordered_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LaboratoryReportResponse(LaboratoryReportBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
