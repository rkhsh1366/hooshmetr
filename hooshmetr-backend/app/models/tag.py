# app/models/tag.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class Tag(Base):
    """
    مدل تگ
    این مدل برای ذخیره تگ‌های مرتبط با ابزارهای هوش مصنوعی استفاده می‌شود
    """
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        """نمایش رشته‌ای تگ"""
        return f"<Tag {self.id}: {self.name}>"