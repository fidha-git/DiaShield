from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.db import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    reminder_time = Column(
        DateTime,
        nullable=False
    )

    is_sent = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    appointment = relationship(
        "Appointment",
        back_populates="reminders"
    )

    user = relationship(
        "User",
        back_populates="reminders"
    )