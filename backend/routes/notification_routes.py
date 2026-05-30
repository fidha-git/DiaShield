from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.db import get_db
from models.notification_model import Notification
from schemas.notification_schema import NotificationCreate, NotificationUpdate, NotificationResponse
from utils.auth_middleware import get_current_user
from models.user_model import User
from datetime import datetime

router = APIRouter()

# POST /notification: Create a new notification (JWT protected)
@router.post("/notification", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_notification = Notification(
        user_id=current_user.id,
        title=notification.title,
        message=notification.message,
        reminder_time=notification.reminder_time,
        is_sent=False,
        created_at=datetime.utcnow()
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification

# GET /notifications: Get all notifications for the logged-in user (JWT protected)
@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications

# PUT /notification/{id}: Update a notification (JWT protected)
@router.put("/notification/{id}", response_model=NotificationResponse)
def update_notification(
    id: int,
    notification: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.title is not None:
        notif.title = notification.title
    if notification.message is not None:
        notif.message = notification.message
    if notification.reminder_time is not None:
        notif.reminder_time = notification.reminder_time
    if notification.is_sent is not None:
        notif.is_sent = notification.is_sent
    db.commit()
    db.refresh(notif)
    return notif

# DELETE /notification/{id}: Delete a notification (JWT protected)
@router.delete("/notification/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return None
