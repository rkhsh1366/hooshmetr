# app/models/technology.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class Technology(Base):
    """
    مدل تکنولوژی
    این مدل برای ذخیره تکنولوژی‌های مورد استفاده در ابزارهای هوش مصنوعی استفاده می‌شود
    """
    __tablename__ = "technologies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        """نمایش رشته‌ای تکنولوژی"""
        return f"<Technology {self.id}: {self.name}>"