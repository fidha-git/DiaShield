from sqlalchemy.orm import Session
from models.settings_model import AppSetting
from schemas.settings_schema import SettingsUpdate

def get_settings(db: Session) -> AppSetting:
    setting = db.query(AppSetting).first()
    if not setting:
        setting = AppSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

def update_settings(db: Session, data: SettingsUpdate) -> AppSetting:
    setting = get_settings(db)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(setting, key, value)
    db.commit()
    db.refresh(setting)
    return setting
