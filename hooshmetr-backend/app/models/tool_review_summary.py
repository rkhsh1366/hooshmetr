# app/models/tool_review_summary.py
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class ToolReviewSummary(Base):
    """
    مدل خلاصه نظرات ابزار
    این مدل برای ذخیره خلاصه نظرات کاربران درباره یک ابزار استفاده می‌شود
    """
    __tablename__ = "tool_review_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("tools.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(Text)
    pros_summary = Column(Text)
    cons_summary = Column(Text)
    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # رابطه با ابزار
    tool = relationship("Tool", back_populates="review_summary")
    
    def __repr__(self):
        """نمایش رشته‌ای خلاصه نظرات"""
        return f"<ToolReviewSummary {self.id}: tool_id={self.tool_id}, rating={self.average_rating}, reviews={self.review_count}>"
    
    def update_stats(self, reviews):
        """
        به‌روزرسانی آمار نظرات
        
        Args:
            reviews: لیست نظرات ابزار
        """
        if not reviews:
            self.average_rating = 0.0
            self.review_count = 0
            return
            
        self.review_count = len(reviews)
        self.average_rating = sum(review.rating for review in reviews) / self.review_count