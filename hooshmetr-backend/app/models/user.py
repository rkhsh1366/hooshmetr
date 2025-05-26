# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

class User(Base):
    """
    مدل کاربر
    این مدل اطلاعات کاربران سایت را نگهداری می‌کند
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String(11), unique=True, index=True, nullable=False)
    display_name = Column(String(50), index=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True, index=True)
    role = Column(String(20), default="user")  # user, admin
    avatar = Column(String(255))
    bio = Column(Text)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    reviews = relationship("ToolReview", back_populates="user", cascade="all, delete-orphan")
    review_reactions = relationship("ReviewReaction", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("Comparison", back_populates="user", cascade="all, delete-orphan")
    
    # اگر مدل‌های وبلاگ وجود دارند، روابط را تعریف می‌کنیم
    try:
        blog_posts = relationship("BlogPost", back_populates="author", cascade="all, delete-orphan")
        blog_comments = relationship("BlogComment", back_populates="user", cascade="all, delete-orphan")
    except:
        pass
    
    def __repr__(self):
        """نمایش رشته‌ای کاربر"""
        return f"<User {self.id}: {self.mobile}>"
    
    @property
    def full_name(self):
        """نام کامل کاربر"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.display_name:
            return self.display_name
        return "کاربر هوش‌متر"
    
    def update_last_login(self):
        """به‌روزرسانی زمان آخرین ورود"""
        self.last_login = datetime.now()
    
    @property
    def is_admin(self):
        """بررسی اینکه آیا کاربر ادمین است یا خیر"""
        return self.role == "admin"