# models/health_record_model.py
# SQLAlchemy model for HealthRecord

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

class HealthRecord(Base):
    """
    SQLAlchemy model for storing patient health records.
    Each record is linked to a patient.
    """
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    blood_sugar = Column(String, nullable=False)
    blood_pressure = Column(String, nullable=False)
    heart_rate = Column(String, nullable=False)
    bmi = Column(String, nullable=False)
    weight = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Patient
    patient = relationship(
        "Patient",
        back_populates="health_records"
    )
