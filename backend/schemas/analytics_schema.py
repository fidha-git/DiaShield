from pydantic import BaseModel

class AnalyticsResponse(BaseModel):
    total_users: int
    total_patients: int
    total_doctors: int
    total_admins: int
    total_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    booked_appointments: int
    total_predictions: int
