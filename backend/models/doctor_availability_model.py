from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Date,
    Time,
    Boolean,
    DateTime
)

from sqlalchemy.orm import relationship
from datetime import datetime

from database.db import Base


class DoctorAvailability(Base):

    __tablename__ = "doctor_availability"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=False
    )

    date = Column(
        Date,
        nullable=False
    )

    start_time = Column(
        Time,
        nullable=False
    )

    end_time = Column(
        Time,
        nullable=False
    )

    is_booked = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    doctor = relationship(
        "Doctor",
        back_populates="availability"
    )