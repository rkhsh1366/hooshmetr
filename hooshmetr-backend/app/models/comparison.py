# app/models/comparison.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid

class Comparison(Base):
    """
    مدل مقایسه ابزارها
    این مدل برای ذخیره مقایسه‌های ایجاد شده توسط کاربران استفاده می‌شود
    """
    __tablename__ = "comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200))
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    shared = Column(Boolean, default=False)  # آیا این مقایسه عمومی است
    share_token = Column(String(50), unique=True, index=True)  # توکن اشتراک‌گذاری
    comparison_data = Column(JSON)  # داده‌های اضافی مقایسه
    view_count = Column(Integer, default=0)
    
    # روابط
    user = relationship("User", back_populates="comparisons")
    tools = relationship("ComparisonTool", back_populates="comparison", cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        """سازنده با ایجاد خودکار توکن اشتراک‌گذاری"""
        super().__init__(**kwargs)
        if not self.share_token:
            self.share_token = str(uuid.uuid4())[:8]
    
    def __repr__(self):
        """نمایش رشته‌ای مقایسه"""
        return f"<Comparison {self.id}: {self.title or 'بدون عنوان'}, tools={len(self.tools)}>"
    
    def increment_view(self):
        """افزایش تعداد بازدید"""
        self.view_count += 1