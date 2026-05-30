from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database.db import Base

# SQLAlchemy model for admin users
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
