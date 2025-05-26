# app/schemas/profile.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class ProfileUpdate(BaseModel):
    """مدل به‌روزرسانی پروفایل کاربر"""
    display_name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('نام نمایشی باید حداقل 2 کاراکتر باشد')
        return v

class ProfileOut(BaseModel):
    """مدل خروجی پروفایل کاربر"""
    id: int
    mobile: str
    display_name: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    role: str = "user"
    created_at: datetime
    updated_at: datetime
    review_count: int = 0
    comparison_count: int = 0
    
    model_config = {
        "from_attributes": True
    }