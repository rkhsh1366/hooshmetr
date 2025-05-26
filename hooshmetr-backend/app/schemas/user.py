# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBasic(BaseModel):
    """مدل پایه کاربر برای استفاده در سایر مدل‌ها"""
    id: int
    display_name: Optional[str] = None
    avatar: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class UserCreate(BaseModel):
    """مدل ایجاد کاربر جدید (معمولاً توسط ادمین استفاده می‌شود)"""
    mobile: str = Field(..., min_length=11, max_length=11, pattern="^09\d{9}$")
    display_name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    role: str = "user"
    is_active: bool = True

class UserUpdate(BaseModel):
    """مدل به‌روزرسانی کاربر"""
    display_name: Optional[str] = Field(None, min_length=2, max_length=50)
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None

class UserOut(BaseModel):
    """مدل خروجی کاربر"""
    id: int
    mobile: str
    display_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    }

class UserWithStats(UserOut):
    """مدل خروجی کاربر با آمار"""
    review_count: int = 0
    comparison_count: int = 0
    last_login: Optional[datetime] = None