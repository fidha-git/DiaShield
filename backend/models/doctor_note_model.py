"""
SQLAlchemy model for Doctor Notes in DiaShield.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database.db import Base

class DoctorNote(Base):
    __tablename__ = "doctor_notes"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    diagnosis = Column(String, nullable=False)
    notes = Column(Text)
    medicines = Column(Text)
    advice = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships (optional, for easier joins)
    appointment = relationship("Appointment", back_populates="doctor_note")
    doctor = relationship("Doctor", back_populates="doctor_notes")
