"""
Seed script: creates an admin user in the database.
Run: python backend/seed_admin.py
"""
import os
import sys
from datetime import datetime, timezone
from passlib.context import CryptContext

# Ensure we can import from backend
sys.path.insert(0, os.path.dirname(__file__))

# Import ALL models first so SQLAlchemy can resolve relationships
import models.user_model
import models.patient_model
import models.doctor_model
import models.appointment_model
import models.health_model
import models.prediction_model
import models.chat_model
import models.reminder_model
import models.notification_model
import models.admin_model
import models.activity_log_model
import models.doctor_availability_model
import models.doctor_note_model
import models.prescription_model
import models.medical_history_model
import models.health_record_model
import models.prediction_history_model

from database.db import SessionLocal
from models.user_model import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@diashield.com").first()
        if existing:
            print(f"Admin already exists: {existing.email} (role: {existing.role})")
            return

        admin = User(
            username="admin",
            email="admin@diashield.com",
            password=pwd_context.hash("admin123"),
            role="admin",
            created_at=datetime.now(timezone.utc),
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully!")
        print("  Email: admin@diashield.com")
        print("  Password: admin123")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
