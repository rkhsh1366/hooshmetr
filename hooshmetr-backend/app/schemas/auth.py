# app/schemas/auth.py
from pydantic import BaseModel, Field
from typing import Optional

class SendCodeRequest(BaseModel):
    """درخواست ارسال کد تأیید"""
    mobile: str = Field(..., min_length=11, max_length=11, pattern="^09\d{9}$", 
                      description="شماره موبایل کاربر (مثال: 09123456789)")

class VerifyCodeRequest(BaseModel):
    """درخواست تأیید کد ارسال شده"""
    mobile: str = Field(..., min_length=11, max_length=11, pattern="^09\d{9}$")
    code: str = Field(..., min_length=5, max_length=5, pattern="^\d{5}$", 
                    description="کد تأیید 5 رقمی")

class AuthTokens(BaseModel):
    """توکن‌های احراز هویت"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None
    role: str = "user"