
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
import os

from database.db import Base, engine


# ==========================================
# Import models
# ==========================================

import models.user_model
import models.prediction_model
import models.health_model
import models.reminder_model
import models.appointment_model
import models.doctor_model
import models.doctor_availability_model
import models.doctor_note_model
import models.prescription_model
import models.laboratory_report_model


import models.patient_model
import models.medical_history_model
import models.health_record_model
import models.prediction_history_model
import models.settings_model


# ==========================================
# Import routes
# ==========================================

from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from routes.prediction_routes import router as prediction_router
from routes.health_routes import router as health_router
from routes.reminder_routes import router as reminder_router
from routes.appointment_routes import router as appointment_router
from routes.chat_routes import router as chat_router
from routes.notification_routes import router as notification_router
from routes.doctor_routes import router as doctor_router
from routes.doctor_availability_routes import (
    router as doctor_availability_router
)
from routes.report_routes import router as report_router
from routes.admin_routes import router as admin_router
from routes.password_routes import router as password_router
from routes.doctor_note_routes import (
    router as doctor_note_router
)
from routes.prescription_routes import (
    router as prescription_router
)

from routes.patient_routes import (
    router as patient_router
)


from routes.medical_history_routes import (
    router as medical_history_router
)

from routes.health_record_routes import (
    router as health_record_router
)

from routes.patient_dashboard_routes import (
    router as patient_dashboard_router
)
from routes.prediction_history_routes import (
    router as prediction_history_router
)

from routes.laboratory_report_routes import (
    router as laboratory_report_router
)


# ==========================================
# Create database tables
# ==========================================

Base.metadata.create_all(bind=engine)



app = FastAPI(
    title="DiaShield API",
    description="AI-powered diabetes healthcare platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# ==========================================
# CORS Configuration
# ==========================================

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/profile_images", exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# ==========================================
# Swagger JWT Configuration
# ==========================================

def custom_openapi():

    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="DiaShield API",
        version="1.0.0",
        description="AI-powered diabetes healthcare platform",
        routes=app.routes
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    openapi_schema["security"] = [
        {
            "BearerAuth": []
        }
    ]

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi


# ==========================================

# Register Routes
# ==========================================

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(prediction_router)
app.include_router(health_router)
app.include_router(reminder_router)
app.include_router(appointment_router)
app.include_router(chat_router)
app.include_router(notification_router)
app.include_router(doctor_router)
app.include_router(doctor_availability_router)
app.include_router(report_router)
app.include_router(admin_router)
app.include_router(password_router)

app.include_router(
    doctor_note_router,
    tags=["Doctor Notes"]
)

app.include_router(
    prescription_router,
    tags=["Prescriptions"]
)

app.include_router(
    patient_router,
    tags=["Patient"]
)

app.include_router(
    medical_history_router,
    tags=["Medical History"]
)

app.include_router(
    health_record_router,
    tags=["Health Record"]
)

app.include_router(
    patient_dashboard_router,
    tags=["Patient Dashboard"]
)
app.include_router(
    prediction_history_router,
    tags=["Prediction History"]
)

app.include_router(
    laboratory_report_router,
    tags=["Health Records - Laboratory Reports"]
)

# Register analytics routes
from routes.analytics_routes import router as analytics_router
app.include_router(analytics_router)

# Register settings routes
from routes.settings_routes import router as settings_router
app.include_router(settings_router)

# Register doctor patient access routes
from routes.doctor_patient_routes import router as doctor_patient_router
app.include_router(doctor_patient_router)


# ==========================================
# Reminder Scheduler
# ==========================================

from utils.reminder_scheduler import scheduler


@app.on_event("startup")
def start_scheduler():

    if not scheduler.running:
        scheduler.start()


# ==========================================
# Root endpoint
# ==========================================

@app.get("/")
def read_root():

    return {
        "message": "DiaShield backend is running!"
    }


# ==========================================
# Health endpoint
# ==========================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "DiaShield API"
    }