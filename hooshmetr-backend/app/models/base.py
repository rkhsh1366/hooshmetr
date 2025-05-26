# app/models/base.py
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    """کلاس پایه برای تمام مدل‌های SQLAlchemy"""
    
    # ستون‌های مشترک می‌توانند اینجا به عنوان اعضای کلاس تعریف شوند
    # اما باید با استفاده از declared_attr به عنوان متد کلاس تعریف شوند
    
    # برای مثال:
    # @declared_attr
    # def created_at(cls):
    #     return Column(DateTime, default=func.now())
    
    # @declared_attr
    # def updated_at(cls):
    #     return Column(DateTime, default=func.now(), onupdate=func.now())