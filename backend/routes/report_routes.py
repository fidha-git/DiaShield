from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from database.db import get_db
from models.user_model import User
from models.prediction_model import Prediction
from models.health_model import HealthLog
from models.appointment_model import Appointment
from models.reminder_model import Reminder
from utils.auth_middleware import get_current_user

router = APIRouter()

@router.get("/report/pdf", response_class=Response)
def generate_pdf_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Generate a PDF health report for the logged-in user. JWT protected.
    """
    # Fetch user profile
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch related data
    predictions = db.query(Prediction).filter(Prediction.user_id == user.id).all()
    health_history = db.query(HealthLog).filter(HealthLog.user_id == user.id).all()
    appointments = db.query(Appointment).filter(Appointment.user_id == user.id).all()
    reminders = db.query(Reminder).filter(Reminder.user_id == user.id).all()

    # Create PDF in memory
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40

    # Title
    p.setFont("Helvetica-Bold", 18)
    p.drawString(180, y, "DiaShield Health Report")
    y -= 30
    p.setFont("Helvetica", 10)
    p.drawString(400, y, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 30

    # User Information
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "User Information")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawString(60, y, f"Email: {user.email}")
    y -= 15
    p.drawString(60, y, f"User ID: {user.id}")
    y -= 25

    # Prediction History
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Prediction History")
    y -= 20
    p.setFont("Helvetica", 10)
    if predictions:
        for pred in predictions:
            # Only use fields that exist in the database
            p.drawString(60, y, f"Date: {pred.created_at.strftime('%Y-%m-%d %H:%M:%S')} | Result: {getattr(pred, 'result', 'N/A')}")
            y -= 15
            if y < 60:
                p.showPage(); y = height - 40
    else:
        p.drawString(60, y, "No prediction history available.")
        y -= 15
    y -= 10

    # Health Tracking History
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Health Tracking History")
    y -= 20
    p.setFont("Helvetica", 10)
    if health_history:
        for health in health_history:
            p.drawString(60, y, f"Date: {health.created_at.strftime('%Y-%m-%d %H:%M:%S')} | Blood Sugar: {health.blood_sugar} | Weight: {health.weight}kg | Exercise: {health.exercise_minutes}min")
            y -= 15
            if y < 60:
                p.showPage(); y = height - 40
    else:
        p.drawString(60, y, "No health tracking history available.")
        y -= 15
    y -= 10

    # Appointments
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Appointments")
    y -= 20
    p.setFont("Helvetica", 10)
    if appointments:
        for appt in appointments:
            p.drawString(60, y, f"Doctor ID: {appt.doctor_id} | Date: {appt.created_at.strftime('%Y-%m-%d %H:%M:%S')} | Status: {appt.status}")
            y -= 15
            if y < 60:
                p.showPage(); y = height - 40
    else:
        p.drawString(60, y, "No appointments available.")
        y -= 15
    y -= 10

    # Reminders
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Reminders")
    y -= 20
    p.setFont("Helvetica", 10)
    if reminders:
        for rem in reminders:
            p.drawString(60, y, f"Reminder: {rem.message} | Date: {rem.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            y -= 15
            if y < 60:
                p.showPage(); y = height - 40
    else:
        p.drawString(60, y, "No reminders available.")
        y -= 15
    y -= 10

    p.save()
    buffer.seek(0)

    # Return PDF as downloadable response
    return Response(buffer.read(), media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=diashield_health_report_{user.id}.pdf"
    })
