from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base


class Appointment(Base):
    """
    SQLAlchemy model for appointment bookings
    between patients and doctors.
    """

    __tablename__ = "appointments"

    # ==========================
    # Columns
    # ==========================

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

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=False
    )

    slot_id = Column(
        Integer,
        ForeignKey("doctor_availability.id"),
        nullable=False
    )

    status = Column(
        String(20),
        default="booked"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # ==========================
    # Relationships
    # ==========================

    # Patient
    user = relationship(
        "User",
        back_populates="appointments"
    )

    # Doctor
    doctor = relationship(
        "Doctor",
        back_populates="appointments"
    )

    # Selected slot
    slot = relationship(
        "DoctorAvailability"
    )

    # One appointment → one doctor note
    doctor_note = relationship(
        "DoctorNote",
        back_populates="appointment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # One appointment → one prescription
    prescription = relationship(
        "Prescription",
        back_populates="appointment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # One appointment → many reminders
    reminders = relationship(
        "Reminder",
        back_populates="appointment",
        cascade="all, delete-orphan"
    )