"""
SQLAlchemy model for Laboratory Reports in DiaShield.
Stores patient laboratory test results and reports.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    func
)

from sqlalchemy.orm import relationship
from database.db import Base


class LaboratoryReport(Base):
    """
    Model for storing laboratory test reports.
    Each report is linked to a patient/user.
    """

    __tablename__ = "laboratory_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    report_name = Column(
        String,
        nullable=False
    )

    report_type = Column(
        String,
        nullable=False
    )

    report_date = Column(
        DateTime(timezone=True),
        nullable=False
    )

    file_url = Column(
        String,
        nullable=True
    )

    ordered_by = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # ======================
    # Relationships
    # ======================

    user = relationship(
        "User",
        back_populates="laboratory_reports"
    )
