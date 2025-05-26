# app/dependencies/auth.py
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime
import os

from app.database import get_db
from app.models.user import User

# تنظیمات JWT
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"

# تنظیم OAuth2PasswordBearer برای دریافت توکن
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """دریافت کاربر فعلی بر اساس توکن JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="اعتبارسنجی ناموفق",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if token is None:
        raise credentials_exception
        
    try:
        # رمزگشایی توکن JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        mobile: str = payload.get("sub")
        if mobile is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # جستجوی کاربر در دیتابیس
    user = db.query(User).filter(User.mobile == mobile).first()
    if user is None:
        raise credentials_exception
    
    # بررسی فعال بودن کاربر
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب کاربری غیرفعال است"
        )
    
    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """
    دریافت کاربر فعلی به صورت اختیاری (برای مسیرهایی که احراز هویت اختیاری است)
    اگر توکن معتبر باشد، کاربر را برمی‌گرداند، در غیر این صورت None برمی‌گرداند
    """
    if token is None:
        return None
        
    try:
        # رمزگشایی توکن JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        mobile: str = payload.get("sub")
        if mobile is None:
            return None
    except JWTError:
        return None
    
    # جستجوی کاربر در دیتابیس
    user = db.query(User).filter(User.mobile == mobile).first()
    if user is None or not user.is_active:
        return None
    
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    """بررسی دسترسی ادمین"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی ادمین نیاز است"
        )
    return current_user