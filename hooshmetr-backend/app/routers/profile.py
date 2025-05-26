# app/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.profile import ProfileUpdate, ProfileOut
from app.dependencies.auth import get_current_user
from app.utils.file_upload import save_profile_image
import os
from app.config import settings
import logging

router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"],
)

@router.get("/", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """دریافت پروفایل کاربر فعلی"""
    return current_user

@router.put("/", response_model=ProfileOut)
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """به‌روزرسانی پروفایل کاربر"""
    # به‌روزرسانی فیلدهای کاربر
    if profile_data.display_name is not None:
        current_user.display_name = profile_data.display_name
    
    if profile_data.email is not None:
        # بررسی تکراری نبودن ایمیل
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="این ایمیل قبلاً توسط کاربر دیگری استفاده شده است"
            )
        
        current_user.email = profile_data.email
    
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
        
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    
    # اعمال تغییرات
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/avatar", response_model=ProfileOut)
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """آپلود تصویر پروفایل"""
    # بررسی نوع فایل
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="فایل آپلود شده باید تصویر باشد"
        )
    
    try:
        # ذخیره تصویر
        avatar_path = save_profile_image(file, current_user.id)
        
        # حذف تصویر قبلی در صورت وجود
        if current_user.avatar and os.path.exists(current_user.avatar):
            try:
                os.remove(current_user.avatar)
            except Exception as e:
                logging.warning(f"خطا در حذف تصویر قبلی: {str(e)}")
        
        # به‌روزرسانی مسیر تصویر در پروفایل کاربر
        current_user.avatar = avatar_path
        db.commit()
        db.refresh(current_user)
        
        return current_user
    except Exception as e:
        logging.error(f"خطا در آپلود تصویر پروفایل: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="خطا در آپلود تصویر پروفایل"
        )

@router.delete("/avatar", response_model=ProfileOut)
def delete_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف تصویر پروفایل"""
    # حذف فایل تصویر در صورت وجود
    if current_user.avatar and os.path.exists(current_user.avatar):
        try:
            os.remove(current_user.avatar)
        except Exception as e:
            logging.warning(f"خطا در حذف تصویر: {str(e)}")
    
    # حذف مسیر تصویر از پروفایل کاربر
    current_user.avatar = None
    db.commit()
    db.refresh(current_user)
    
    return current_user