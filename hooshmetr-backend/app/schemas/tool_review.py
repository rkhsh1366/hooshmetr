# app/schemas/tool_review.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserBasic
from app.schemas.review_reaction import ReviewReactionOut

class ToolReviewBase(BaseModel):
    """مدل پایه برای نظرات ابزار"""
    tool_id: int
    rating: float = Field(..., ge=1, le=5, description="امتیاز بین 1 تا 5")
    content: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None

class ToolReviewCreate(ToolReviewBase):
    """مدل ایجاد نظر جدید"""
    pass

class ToolReviewUpdate(BaseModel):
    """مدل به‌روزرسانی نظر"""
    rating: Optional[float] = Field(None, ge=1, le=5)
    content: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None

class ToolReviewOut(ToolReviewBase):
    """مدل خروجی نظر"""
    id: int
    user: Optional[UserBasic] = None
    created_at: datetime
    updated_at: datetime
    positive_reactions_count: int = 0
    negative_reactions_count: int = 0
    user_reaction: Optional[str] = None  # واکنش کاربر فعلی (like, dislike, None)

    model_config = {
        "from_attributes": True
    }

class ToolReviewDetailOut(ToolReviewOut):
    """مدل خروجی جزئیات نظر"""
    reactions: List[ReviewReactionOut] = []