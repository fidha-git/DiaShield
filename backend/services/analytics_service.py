from sqlalchemy.orm import Session
from models.user_model import User
from models.appointment_model import Appointment
from models.prediction_model import Prediction

# Analytics service for admin dashboard

def get_analytics_data(db: Session):
    """
    Returns analytics data for the admin dashboard.
    """
    # Count total users
    total_users = db.query(User).count()
    # Count users by role
    total_patients = db.query(User).filter(User.role == "patient").count()
    total_doctors = db.query(User).filter(User.role == "doctor").count()
    total_admins = db.query(User).filter(User.role == "admin").count()

    # Count appointments
    total_appointments = db.query(Appointment).count()
    completed_appointments = db.query(Appointment).filter(Appointment.status == "completed").count()
    cancelled_appointments = db.query(Appointment).filter(Appointment.status == "cancelled").count()
    booked_appointments = db.query(Appointment).filter(Appointment.status == "booked").count()

    # Count predictions
    total_predictions = db.query(Prediction).count()

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_admins": total_admins,
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "booked_appointments": booked_appointments,
        "total_predictions": total_predictions
    }
