"""
Service layer for Appointment Reminders in DiaShield.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.reminder_model import Reminder
from models.appointment_model import Appointment
from models.user_model import User
from schemas.reminder_schema import ReminderCreate
from datetime import datetime

def create_reminder(db: Session, appointment_id: int, user_id: int, reminder_data: ReminderCreate):
    # Check appointment exists
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    # Prevent duplicate reminders
    exists = db.query(Reminder).filter(Reminder.appointment_id == appointment_id, Reminder.user_id == user_id).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Reminder already exists for this appointment.")
    reminder = Reminder(
        appointment_id=appointment_id,
        user_id=user_id,
        message=reminder_data.message,
        reminder_time=reminder_data.reminder_time
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

def get_my_reminders(db: Session, user_id: int):
    return db.query(Reminder).filter(Reminder.user_id == user_id).order_by(Reminder.reminder_time.desc()).all()

def send_pending_reminders(db: Session):
    now = datetime.utcnow()
    reminders = db.query(Reminder).filter(Reminder.reminder_time <= now, Reminder.is_sent == False).all()
    for reminder in reminders:
        print(f"[REMINDER] {reminder.message}")
        reminder.is_sent = True
    db.commit()
    return len(reminders)
