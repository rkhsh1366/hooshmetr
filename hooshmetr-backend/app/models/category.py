# app/models/category.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class Category(Base):
    """
    مدل دسته‌بندی ابزارها
    این مدل برای دسته‌بندی ابزارهای هوش مصنوعی استفاده می‌شود
    """
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text)
    icon = Column(String(100))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        """نمایش رشته‌ای دسته‌بندی"""
        return f"<Category {self.id}: {self.name}>"