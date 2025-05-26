# app/models/verification_code.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.models.base import Base
from datetime import datetime, timedelta
import logging

logger = logging.getLogger("hooshmetr.models")

class VerificationCode(Base):
    """
    مدل کد تأیید
    این مدل برای ذخیره کدهای تأیید ارسال شده به کاربران استفاده می‌شود
    """
    __tablename__ = "verification_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    mobile = Column(String(11), index=True, nullable=False)
    code = Column(String(5), nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    
    def __init__(self, mobile, code, expires_minutes=2):
        """
        ایجاد یک کد تأیید جدید
        
        Args:
            mobile (str): شماره موبایل کاربر
            code (str): کد تأیید (معمولاً 5 رقمی)
            expires_minutes (int): مدت اعتبار کد به دقیقه
        """
        self.mobile = mobile
        self.code = code
        self.expires_at = datetime.now() + timedelta(minutes=expires_minutes)
        logger.debug(f"کد تأیید جدید برای {mobile} ایجاد شد: {code}")
    
    def is_expired(self):
        """
        بررسی اینکه آیا کد منقضی شده است یا خیر
        
        Returns:
            bool: True اگر کد منقضی شده باشد، در غیر این صورت False
        """
        return datetime.now() > self.expires_at
    
    def can_try(self):
        """
        بررسی اینکه آیا هنوز امکان تلاش برای استفاده از کد وجود دارد
        
        Returns:
            bool: True اگر هنوز امکان تلاش وجود داشته باشد، در غیر این صورت False
        """
        return self.attempts < 5
    
    def increment_attempts(self):
        """افزایش تعداد تلاش‌ها"""
        self.attempts += 1
        logger.debug(f"تلاش {self.attempts} برای کد {self.id} (موبایل: {self.mobile})")
        return self.attempts
    
    def mark_as_used(self):
        """علامت‌گذاری کد به عنوان استفاده شده"""
        self.used = True
        logger.debug(f"کد {self.id} برای {self.mobile} استفاده شد")
    
    def __repr__(self):
        """نمایش رشته‌ای کد تأیید"""
        status = "منقضی" if self.is_expired() else "معتبر"
        used = "استفاده شده" if self.used else "استفاده نشده"
        return f"<VerificationCode {self.id}: {self.mobile}, {status}, {used}>"