from sqlalchemy import Column, DateTime, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from database.db import Base


class User(Base):

    __tablename__ = "users"

    # =========================
    # Activity Log Relationship
    # =========================
    activity_logs = relationship(
        "ActivityLog",
        back_populates="user"
    )

    # =========================
    # Basic Fields
    # =========================
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        nullable=False
    )

    role = Column(
        String(20),
        default="patient",
        nullable=False
    )

    profile_image = Column(
        String,
        nullable=True
    )

    email_verified = Column(
        Boolean,
        default=False
    )

    refresh_token = Column(
        String,
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True
    )

    # =========================
    # Healthcare Profile Fields
    # =========================

    age = Column(
        Integer,
        nullable=True
    )

    phone = Column(
        String,
        nullable=True
    )

    gender = Column(
        String,
        nullable=True
    )

    height = Column(
        Float,
        nullable=True
    )

    weight = Column(
        Float,
        nullable=True
    )

    # =========================
    # Relationships
    # =========================

    appointments = relationship(
        "Appointment",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reminders = relationship(
        "Reminder",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    chats = relationship(
        "Chat",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    predictions = relationship(
        "Prediction",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    doctor = relationship(
        "Doctor",
        back_populates="user",
        uselist=False
    )

    patient_profile = relationship(
        "Patient",
        back_populates="user",
        uselist=False
    )