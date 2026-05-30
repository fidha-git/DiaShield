# models/medical_history_model.py
# SQLAlchemy model for Medical History
# Each patient can have multiple medical history records

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base

class MedicalHistory(Base):
    __tablename__ = "medical_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    past_illnesses = Column(Text, nullable=True)
    surgeries = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    chronic_diseases = Column(Text, nullable=True)
    smoking_status = Column(String, nullable=True)
    alcohol_status = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Patient
    patient = relationship(
        "Patient",
        back_populates="medical_histories"
    )
