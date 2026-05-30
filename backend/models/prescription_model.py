"""
SQLAlchemy model for Prescriptions in DiaShield.
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


class Prescription(Base):

    __tablename__ = "prescriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=False
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=False
    )

    medicines = Column(
        String,
        nullable=False
    )

    dosage = Column(
        String,
        nullable=False
    )

    duration = Column(
        String,
        nullable=False
    )

    instructions = Column(
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

    appointment = relationship(
        "Appointment",
        back_populates="prescription"
    )

    doctor = relationship(
        "Doctor",
        back_populates="prescriptions"
    )