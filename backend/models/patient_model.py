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
    health_records = relationship(
        "HealthRecord",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    prediction_histories = relationship(
        "PredictionHistory",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    height = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    # New commercial healthcare fields
    email = Column(String(255), nullable=False, default="")
    emergency_contact_name = Column(String(255), nullable=True, default="")
    emergency_contact_phone = Column(String(100), nullable=True, default="")
    emergency_contact_relationship = Column(String(100), nullable=True, default="")
    insurance_provider = Column(String(255), nullable=True, default="")
    policy_number = Column(String(255), nullable=True, default="")
    group_code = Column(String(255), nullable=True, default="")
    primary_clinic = Column(String(255), nullable=True, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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