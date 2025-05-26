# app/models/tool_review.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class ToolReview(Base):
    """
    مدل نظر کاربر درباره ابزار
    این مدل برای ذخیره نظرات و امتیازات کاربران درباره ابزارها استفاده می‌شود
    """
    __tablename__ = "tool_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    tool_id = Column(Integer, ForeignKey("tools.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)
    content = Column(Text)
    pros = Column(Text)
    cons = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # روابط
    user = relationship("User", back_populates="reviews")
    tool = relationship("Tool", back_populates="reviews")
    reactions = relationship("ReviewReaction", back_populates="review", cascade="all, delete-orphan")
    
    def __repr__(self):
        """نمایش رشته‌ای نظر"""
        return f"<ToolReview {self.id}: tool_id={self.tool_id}, rating={self.rating}>"
    
    def get_positive_reactions_count(self):
        """تعداد واکنش‌های مثبت (لایک) را برمی‌گرداند"""
        return sum(1 for reaction in self.reactions if reaction.reaction_type == "like")
    
    def get_negative_reactions_count(self):
        """تعداد واکنش‌های منفی (دیسلایک) را برمی‌گرداند"""
        return sum(1 for reaction in self.reactions if reaction.reaction_type == "dislike")