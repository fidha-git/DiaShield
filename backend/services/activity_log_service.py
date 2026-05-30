from sqlalchemy.orm import Session
from models.activity_log_model import ActivityLog
from models.user_model import User
from datetime import datetime

def log_activity(db: Session, user_id: int, action: str):
    """
    Helper to log user activity.
    """
    log = ActivityLog(user_id=user_id, action=action, created_at=datetime.utcnow())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_activity_logs(db: Session):
    """
    Returns all activity logs with username.
    """
    logs = db.query(ActivityLog, User).join(User, ActivityLog.user_id == User.id).order_by(ActivityLog.created_at.desc()).all()
    return [
        {
            "user_id": log.user_id,
            "username": user.username,
            "action": log.action,
            "created_at": log.created_at
        }
        for log, user in logs
    ]
