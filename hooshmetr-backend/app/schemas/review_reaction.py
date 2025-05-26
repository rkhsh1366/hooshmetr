# app/schemas/review_reaction.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewReactionCreate(BaseModel):
    """مدل ایجاد واکنش به نظر"""
    review_id: int
    reaction_type: str = Field(..., pattern="^(like|dislike)$")

class ReviewReactionOut(BaseModel):
    """مدل خروجی واکنش به نظر"""
    id: int
    review_id: int
    user_id: int
    reaction_type: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class ReviewReactionUpdate(BaseModel):
    """مدل به‌روزرسانی واکنش به نظر"""
    reaction_type: str = Field(..., pattern="^(like|dislike)$")