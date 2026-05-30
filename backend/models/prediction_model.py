from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.db import Base


# SQLAlchemy model to store prediction history for users
# Each record stores input features, prediction result, and a timestamp
class Prediction(Base):
    __tablename__ = "predictions"

    # Primary key for the predictions table
    id = Column(Integer, primary_key=True, index=True)

    # Reference to the user who made the prediction
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Input features commonly used for diabetes prediction
    pregnancies = Column(Integer, nullable=True)
    glucose = Column(Float, nullable=True)
    blood_pressure = Column(Float, nullable=True)
    skin_thickness = Column(Float, nullable=True)
    insulin = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    diabetes_pedigree = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)


    # Prediction result (e.g., "positive", "negative", "high", "low")
    result = Column(String, nullable=False)

    # Timestamp when the prediction was created
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Optional relationship to the User model for convenient access
    user = relationship("User", backref="predictions")
