# app/schemas/tool_review_summary.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ToolReviewSummaryBase(BaseModel):
    """مدل پایه خلاصه نظرات ابزار"""
    summary: Optional[str] = None
    pros_summary: Optional[str] = None
    cons_summary: Optional[str] = None
    average_rating: float = Field(0.0, ge=0, le=5)
    review_count: int = Field(0, ge=0)

class ToolReviewSummaryCreate(ToolReviewSummaryBase):
    """مدل ایجاد خلاصه نظرات ابزار"""
    tool_id: int

class ToolReviewSummaryUpdate(BaseModel):
    """مدل به‌روزرسانی خلاصه نظرات ابزار"""
    summary: Optional[str] = None
    pros_summary: Optional[str] = None
    cons_summary: Optional[str] = None
    average_rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: Optional[int] = Field(None, ge=0)

class ToolReviewSummaryOut(ToolReviewSummaryBase):
    """مدل خروجی خلاصه نظرات ابزار"""
    id: int
    tool_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }