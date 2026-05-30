from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    prediction_result = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    probability = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Patient
    patient = relationship("Patient", back_populates="prediction_histories")
