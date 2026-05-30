"""
APScheduler background scheduler for sending reminders in DiaShield.
"""
from apscheduler.schedulers.background import BackgroundScheduler
from database.db import SessionLocal
from services.reminder_service import send_pending_reminders

scheduler = BackgroundScheduler()

def scheduled_job():
    db = SessionLocal()
    try:
        send_pending_reminders(db)
    finally:
        db.close()

scheduler.add_job(scheduled_job, trigger="interval", minutes=1)
scheduler.start()
