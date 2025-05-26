# app/utils/file_upload.py
import os
import shutil
from fastapi import UploadFile, HTTPException
import uuid
from app.config import settings
import logging
from PIL import Image
import io

def save_profile_image(file: UploadFile, user_id: int) -> str:
    """ذخیره تصویر پروفایل کاربر"""
    # ایجاد مسیر ذخیره‌سازی
    upload_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(upload_dir, exist_ok=True)
    
    # تولید نام فایل منحصر به فرد
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if file_ext.lower() not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="فرمت فایل پشتیبانی نمی‌شود")
    
    filename = f"avatar_{user_id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # خواندن و فشرده‌سازی تصویر
        contents = file.file.read()
        
        # بررسی اندازه فایل
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="حجم فایل بیش از حد مجاز است")
        
        # فشرده‌سازی و تغییر اندازه تصویر
        try:
            image = Image.open(io.BytesIO(contents))
            
            # تغییر اندازه تصویر (حداکثر 500x500)
            image.thumbnail((500, 500))
            
            # ذخیره تصویر فشرده شده
            image.save(file_path, optimize=True, quality=85)
        except Exception as e:
            # اگر پردازش تصویر با خطا مواجه شد، فایل اصلی را ذخیره کن
            logging.warning(f"خطا در پردازش تصویر: {str(e)}")
            with open(file_path, "wb") as f:
                f.write(contents)
        
        # مسیر نسبی برای ذخیره در پایگاه داده
        relative_path = os.path.join("static", "uploads", "avatars", filename)
        return relative_path
    except Exception as e:
        logging.error(f"خطا در ذخیره تصویر پروفایل: {str(e)}")
        raise HTTPException(status_code=500, detail="خطا در ذخیره تصویر")
    finally:
        file.file.close()

def save_blog_image(file: UploadFile) -> str:
    """ذخیره تصویر برای وبلاگ"""
    # ایجاد مسیر ذخیره‌سازی
    upload_dir = os.path.join(settings.UPLOAD_DIR, "blog")
    os.makedirs(upload_dir, exist_ok=True)
    
    # تولید نام فایل منحصر به فرد
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if file_ext.lower() not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="فرمت فایل پشتیبانی نمی‌شود")
    
    filename = f"blog_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # خواندن و فشرده‌سازی تصویر
        contents = file.file.read()
        
        # بررسی اندازه فایل
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="حجم فایل بیش از حد مجاز است")
        
        # فشرده‌سازی و تغییر اندازه تصویر
        try:
            image = Image.open(io.BytesIO(contents))
            
            # تغییر اندازه تصویر (حداکثر 1200x800)
            image.thumbnail((1200, 800))
            
            # ذخیره تصویر فشرده شده
            image.save(file_path, optimize=True, quality=85)
        except Exception as e:
            # اگر پردازش تصویر با خطا مواجه شد، فایل اصلی را ذخیره کن
            logging.warning(f"خطا در پردازش تصویر: {str(e)}")
            with open(file_path, "wb") as f:
                f.write(contents)
        
        # مسیر نسبی برای ذخیره در پایگاه داده
        relative_path = os.path.join("static", "uploads", "blog", filename)
        return relative_path
    except Exception as e:
        logging.error(f"خطا در ذخیره تصویر وبلاگ: {str(e)}")
        raise HTTPException(status_code=500, detail="خطا در ذخیره تصویر")
    finally:
        file.file.close()

def save_tool_image(file: UploadFile) -> str:
    """ذخیره تصویر برای ابزار"""
    # ایجاد مسیر ذخیره‌سازی
    upload_dir = os.path.join(settings.UPLOAD_DIR, "tools")
    os.makedirs(upload_dir, exist_ok=True)
    
    # تولید نام فایل منحصر به فرد
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if file_ext.lower() not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="فرمت فایل پشتیبانی نمی‌شود")
    
    filename = f"tool_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # خواندن و فشرده‌سازی تصویر
        contents = file.file.read()
        
        # بررسی اندازه فایل
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="حجم فایل بیش از حد مجاز است")
        
        # فشرده‌سازی و تغییر اندازه تصویر
        try:
            image = Image.open(io.BytesIO(contents))
            
            # تغییر اندازه تصویر (حداکثر 800x600)
            image.thumbnail((800, 600))
            
            # ذخیره تصویر فشرده شده
            image.save(file_path, optimize=True, quality=85)
        except Exception as e:
            # اگر پردازش تصویر با خطا مواجه شد، فایل اصلی را ذخیره کن
            logging.warning(f"خطا در پردازش تصویر: {str(e)}")
            with open(file_path, "wb") as f:
                f.write(contents)
        
        # مسیر نسبی برای ذخیره در پایگاه داده
        relative_path = os.path.join("static", "uploads", "tools", filename)
        return relative_path
    except Exception as e:
        logging.error(f"خطا در ذخیره تصویر ابزار: {str(e)}")
        raise HTTPException(status_code=500, detail="خطا در ذخیره تصویر")
    finally:
        file.file.close()