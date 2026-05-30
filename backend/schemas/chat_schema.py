from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Pydantic schema for creating a chat (user sends a message)
class ChatCreate(BaseModel):
    message: str

# Pydantic schema for a chat response (returned to user)
class ChatResponse(BaseModel):
    id: int
    user_id: int
    message: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True

# Pydantic schema for chat history (list of chats)
class ChatHistory(BaseModel):
    chats: List[ChatResponse]
