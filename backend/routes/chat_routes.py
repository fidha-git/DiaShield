from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from schemas.chat_schema import ChatCreate, ChatResponse, ChatHistory
from models.chat_model import Chat
from database.db import get_db
from utils.auth_middleware import get_current_user
from services.chat_ai_service import generate_ai_response
from models.user_model import User
from datetime import datetime, timezone
from typing import List

router = APIRouter()



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
        created_at=datetime.now(timezone.utc)
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
