# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.schemas.auth import SendCodeRequest, VerifyCodeRequest, AuthTokens
from app.models.user import User
from app.models.verification_code import VerificationCode
from app.utils.sms import send_verification_code
from datetime import datetime, timedelta
import random
import logging
from jose import jwt

# استفاده از SECRET_KEY و ALGORITHM از dependencies/auth.py
from app.dependencies.auth import SECRET_KEY, ALGORITHM

# تنظیم مدت زمان اعتبار توکن
ACCESS_TOKEN_EXPIRE_DAYS = 7

router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
)

@router.post("/auth/send-code", status_code=status.HTTP_200_OK)
def send_code(data: SendCodeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    ارسال کد تأیید به شماره موبایل
    
    این API یک کد تأیید 5 رقمی تصادفی تولید کرده و به شماره موبایل ارسال می‌کند.
    در محیط توسعه، کد در لاگ نمایش داده می‌شود.
    """
    # بررسی صحت شماره موبایل
    if not data.mobile.startswith("09") or len(data.mobile) != 11:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="شماره موبایل معتبر نیست."
        )

    # حذف کدهای قبلی برای این شماره موبایل
    db.query(VerificationCode).filter(VerificationCode.mobile == data.mobile).delete()
    db.commit()

    # تولید کد تصادفی 5 رقمی
    code = str(random.randint(10000, 99999))
    
    # ایجاد رکورد جدید VerificationCode
    verification_code = VerificationCode(
        mobile=data.mobile, 
        code=code,
        expires_at=datetime.now() + timedelta(minutes=2)  # منقضی شدن بعد از 2 دقیقه
    )
    db.add(verification_code)
    db.commit()
    db.refresh(verification_code)

    # ارسال کد تأیید با پیامک در پس‌زمینه
    def send_sms_task():
        success = send_verification_code(data.mobile, code)
        if not success:
            logging.error(f"خطا در ارسال پیامک به {data.mobile}")
    
    # افزودن وظیفه ارسال پیامک به تسک‌های پس‌زمینه
    background_tasks.add_task(send_sms_task)
    
    # در محیط توسعه، کد را در لاگ نمایش دهید
    if settings.DEBUG:
        logging.info(f"ارسال پیامک به {data.mobile}: کد تأیید شما: {code}")
    
    return {"detail": "کد تأیید ارسال شد", "expires_in": 120}  # 120 ثانیه = 2 دقیقه

@router.post("/auth/verify", response_model=AuthTokens)
def verify_code(data: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    تأیید کد و دریافت توکن دسترسی
    
    این API کد تأیید دریافتی را بررسی کرده و در صورت صحت، توکن دسترسی JWT برمی‌گرداند.
    اگر کاربر قبلاً ثبت‌نام نکرده باشد، یک حساب کاربری جدید ایجاد می‌شود.
    """
    # جستجوی آخرین کد تأیید ارسال شده
    verification_code = db.query(VerificationCode).filter(
        VerificationCode.mobile == data.mobile,
        VerificationCode.used == False  # فقط کدهای استفاده نشده
    ).order_by(VerificationCode.created_at.desc()).first()
    
    if not verification_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="کدی برای این شماره موبایل یافت نشد."
        )
    
    # بررسی منقضی شدن کد
    if verification_code.is_expired():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="کد منقضی شده. لطفاً کد جدید دریافت کنید."
        )
    
    # بررسی تعداد تلاش‌ها
    if not verification_code.can_try():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="تلاش بیش از حد مجاز. لطفاً کد جدید دریافت کنید."
        )

    # بررسی صحت کد
    if verification_code.code != data.code:
        verification_code.attempts += 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="کد وارد شده اشتباه است."
        )

    # علامت‌گذاری کد به عنوان استفاده شده
    verification_code.used = True
    db.commit()

    # بررسی وجود کاربر یا ثبت‌نام کاربر جدید
    user = db.query(User).filter(User.mobile == data.mobile).first()
    if not user:
        # ایجاد کاربر جدید
        user = User(
            mobile=data.mobile,
            role="user",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # به‌روزرسانی زمان آخرین ورود کاربر
    user.last_login = datetime.now()
    db.commit()

    # تولید توکن JWT
    access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    payload = {
        "sub": user.mobile,
        "user_id": user.id,
        "role": user.role,
        "exp": datetime.utcnow() + access_token_expires
    }
    
    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # ایجاد و بازگرداندن پاسخ
    return AuthTokens(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # تبدیل روز به ثانیه
        refresh_token="",  # در نسخه‌های بعدی پیاده‌سازی خواهد شد
        role=user.role
    )

@router.post("/auth/refresh", response_model=AuthTokens)
def refresh_token(db: Session = Depends(get_db)):
    """
    تمدید توکن دسترسی (برای پیاده‌سازی در آینده)
    
    این API در حال حاضر پیاده‌سازی نشده است و برای نسخه‌های بعدی در نظر گرفته شده است.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="این قابلیت هنوز پیاده‌سازی نشده است."
    )

@router.post("/auth/logout")
def logout():
    """
    خروج از حساب کاربری
    
    این API در سمت سرور کاری انجام نمی‌دهد و خروج باید در سمت کلاینت با حذف توکن انجام شود.
    """
    return {"detail": "با موفقیت خارج شدید. توکن را در سمت کلاینت حذف کنید."}