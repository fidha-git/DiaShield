from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from database.db import Base


# SQLAlchemy model for storing daily health tracking logs.
# Each row belongs to a user and captures key health metrics.
class HealthLog(Base):
    __tablename__ = "health_logs"

    # Primary key for each health log entry
    id = Column(Integer, primary_key=True, index=True)

    # User that owns this health log
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Core health values captured from the client app
    blood_sugar = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    exercise_minutes = Column(Integer, nullable=False)

    # Auto-generated timestamp when this health log is created
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship to User model for easy ORM navigation
    user = relationship("User", backref="health_logs")
