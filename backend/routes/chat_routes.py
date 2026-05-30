from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from schemas.chat_schema import ChatCreate, ChatResponse, ChatHistory
from models.chat_model import Chat
from database.db import get_db
from utils.auth_middleware import get_current_user
from models.user_model import User
from datetime import datetime
from typing import List

router = APIRouter()



# Simple AI response generator for diabetes-related queries
def generate_ai_response(message: str) -> str:
    # Basic keyword-based logic for demonstration
    message_lower = message.lower()
    disclaimer = "\n\nConsult a healthcare professional for medical advice."
    if any(word in message_lower for word in ["food", "eat", "diet", "meal"]):
        return "For diabetes, focus on whole grains, vegetables, lean proteins, and avoid sugary foods." + disclaimer
    elif any(word in message_lower for word in ["exercise", "workout", "activity", "walk"]):
        return "Regular exercise like walking, cycling, or swimming helps manage blood sugar levels." + disclaimer
    elif any(word in message_lower for word in ["blood sugar", "glucose", "value", "reading"]):
        return "Normal fasting blood sugar is 70-99 mg/dL. High values may need attention, but always consult your doctor." + disclaimer
    elif any(word in message_lower for word in ["lifestyle", "healthy", "habit"]):
        return "Maintain a balanced diet, exercise regularly, manage stress, and get enough sleep for a healthy lifestyle." + disclaimer
    elif any(word in message_lower for word in ["diabetes", "what is diabetes", "about diabetes"]):
        return "Diabetes is a condition where the body has trouble regulating blood sugar. It can be managed with healthy habits." + disclaimer
    else:
        return "I'm here to help with diabetes-related questions, food, exercise, and healthy living tips." + disclaimer

# POST /chat endpoint: Accepts user message, generates AI response, saves to DB, returns response
@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def chat(
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ai_response = generate_ai_response(chat.message)
    new_chat = Chat(
        user_id=current_user.id,
        message=chat.message,
        response=ai_response,
        created_at=datetime.utcnow()
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

# GET /chat-history endpoint: Returns all chats for the logged-in user
@router.get("/chat-history", response_model=ChatHistory)
def chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.desc()).all()
    return {"chats": chats}
