# models/patient_model.py

# SQLAlchemy model for Patient profile
# Uses existing database setup and follows project architecture

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship
from datetime import datetime

from database.db import Base


class Patient(Base):
    # Relationship with health records
    health_records = relationship(
        "HealthRecord",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    # Relationship with prediction histories
    prediction_histories = relationship(
        "PredictionHistory",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    __tablename__ = "patients"

    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Link patient with user table
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # Patient details
    name = Column(
        String,
        nullable=False
    )

    age = Column(
        Integer,
        nullable=False
    )

    gender = Column(
        String,
        nullable=False
    )

    phone = Column(
        String,
        nullable=False
    )

    address = Column(
        String,
        nullable=True
    )

    height = Column(
        String,
        nullable=True
    )

    weight = Column(
        String,
        nullable=True
    )

    blood_group = Column(
        String,
        nullable=True
    )

    profile_image = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Relationship with user model
    user = relationship(
        "User",
        back_populates="patient_profile"
    )

    # Relationship with medical histories
    medical_histories = relationship(
        "MedicalHistory",
        back_populates="patient",
        cascade="all, delete-orphan"
    )