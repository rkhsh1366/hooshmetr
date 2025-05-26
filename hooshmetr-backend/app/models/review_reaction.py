# app/models/review_reaction.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class ReviewReaction(Base):
    """
    مدل واکنش به نظر
    این مدل برای ذخیره واکنش‌های کاربران (مانند لایک و دیسلایک) به نظرات استفاده می‌شود
    """
    __tablename__ = "review_reactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    review_id = Column(Integer, ForeignKey("tool_reviews.id", ondelete="CASCADE"), nullable=False)
    reaction_type = Column(String(20), nullable=False)  # like, dislike, etc.
    created_at = Column(DateTime, default=func.now())

    # محدودیت یکتایی: هر کاربر فقط یک واکنش به هر نظر می‌تواند داشته باشد
    __table_args__ = (
        UniqueConstraint('user_id', 'review_id', name='unique_user_review_reaction'),
    )

    # روابط
    user = relationship("User", back_populates="review_reactions")
    review = relationship("ToolReview", back_populates="reactions")
    
    def __repr__(self):
        """نمایش رشته‌ای واکنش"""
        return f"<ReviewReaction {self.id}: user_id={self.user_id}, review_id={self.review_id}, type={self.reaction_type}>"