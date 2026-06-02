from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    DateTime,
    func
)

from sqlalchemy.orm import relationship
from database.db import Base


class Doctor(Base):
    """
    Doctor profile model
    Stores doctor details
    """

    __tablename__ = "doctors"

    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Connected user
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # Doctor details
    name = Column(
        String(100),
        nullable=False
    )

    specialization = Column(
        String(100),
        nullable=False
    )

    experience = Column(
        Integer,
        nullable=False
    )

    qualification = Column(
        String(150),
        nullable=False
    )

    hospital = Column(
        String(150),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    consultation_fee = Column(
        Float,
        nullable=False
    )

    bio = Column(
        Text,
        nullable=True
    )

    profile_image = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # ==========================
    # Relationships
    # ==========================

    # User profile
    user = relationship(
        "User",
        back_populates="doctor",
        uselist=False
    )

    # Doctor slots
    availability = relationship(
        "DoctorAvailability",
        back_populates="doctor",
        cascade="all, delete-orphan"
    )

    # Doctor appointments
    appointments = relationship(
        "Appointment",
        back_populates="doctor",
        cascade="all, delete-orphan"
    )

    # Doctor notes
    doctor_notes = relationship(
        "DoctorNote",
        back_populates="doctor",
        cascade="all, delete-orphan"
    )

    # Prescriptions
    prescriptions = relationship(
        "Prescription",
        back_populates="doctor",
        cascade="all, delete-orphan"
    )