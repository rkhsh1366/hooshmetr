# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.tool_review import ToolReview
from app.models.comparison import Comparison
from app.schemas.user import UserOut, UserUpdate, UserWithStats
from app.dependencies.auth import get_current_user, get_admin_user

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

@router.get("/me", response_model=UserWithStats)
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    دریافت اطلاعات کاربر جاری بر اساس توکن احراز هویت
    
    این API اطلاعات کاربر جاری را به همراه آمار مربوط به تعداد نظرات و مقایسه‌ها برمی‌گرداند.
    """
    # محاسبه آمار کاربر
    review_count = db.query(func.count(ToolReview.id)).filter(ToolReview.user_id == current_user.id).scalar()
    comparison_count = db.query(func.count(Comparison.id)).filter(Comparison.user_id == current_user.id).scalar()
    
    # تکمیل اطلاعات کاربر با آمار
    user_data = UserWithStats.model_validate(current_user)
    user_data.review_count = review_count or 0
    user_data.comparison_count = comparison_count or 0
    
    return user_data

@router.put("/me", response_model=UserOut)
def update_user_info(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    به‌روزرسانی اطلاعات کاربر جاری
    
    این API امکان به‌روزرسانی اطلاعات کاربر جاری را فراهم می‌کند.
    فیلدهایی که می‌توانند به‌روز شوند شامل نام نمایشی، نام، نام خانوادگی، ایمیل و بیوگرافی هستند.
    """
    # بررسی تکراری نبودن ایمیل در صورت تغییر
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="این ایمیل قبلاً توسط کاربر دیگری استفاده شده است"
            )
    
    # به‌روزرسانی فیلدهای کاربر
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    
    # به‌روزرسانی زمان تغییر
    current_user.updated_at = func.now()
    
    db.commit()
    db.refresh(current_user)
    return current_user

# API های مدیریت کاربران (فقط برای ادمین)
@router.get("/", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)  # فقط ادمین
):
    """
    دریافت لیست کاربران (فقط برای ادمین)
    
    این API لیست کاربران را با امکان جستجو و مرتب‌سازی برمی‌گرداند.
    فقط کاربران با نقش ادمین می‌توانند به این API دسترسی داشته باشند.
    """
    query = db.query(User)
    
    # اعمال جستجو
    if search:
        query = query.filter(
            (User.mobile.ilike(f"%{search}%")) |
            (User.display_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))
        )
    
    # اعمال مرتب‌سازی
    if sort:
        if sort == "created_at":
            query = query.order_by(User.created_at.desc())
        elif sort == "created_at_asc":
            query = query.order_by(User.created_at.asc())
        elif sort == "last_login":
            query = query.order_by(User.last_login.desc())
        elif sort == "display_name":
            query = query.order_by(User.display_name.asc())
    else:
        # مرتب‌سازی پیش‌فرض
        query = query.order_by(User.id.desc())
    
    # اعمال محدودیت و پرش
    users = query.offset(skip).limit(limit).all()
    
    return users

@router.get("/{user_id}", response_model=UserWithStats)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)  # فقط ادمین
):
    """
    دریافت اطلاعات یک کاربر با شناسه (فقط برای ادمین)
    
    این API اطلاعات کامل یک کاربر را به همراه آمار مربوط به تعداد نظرات و مقایسه‌ها برمی‌گرداند.
    فقط کاربران با نقش ادمین می‌توانند به این API دسترسی داشته باشند.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر مورد نظر یافت نشد"
        )
    
    # محاسبه آمار کاربر
    review_count = db.query(func.count(ToolReview.id)).filter(ToolReview.user_id == user.id).scalar()
    comparison_count = db.query(func.count(Comparison.id)).filter(Comparison.user_id == user.id).scalar()
    
    # تکمیل اطلاعات کاربر با آمار
    user_data = UserWithStats.model_validate(user)
    user_data.review_count = review_count or 0
    user_data.comparison_count = comparison_count or 0
    
    return user_data

@router.put("/{user_id}/status", response_model=UserOut)
def toggle_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)  # فقط ادمین
):
    """
    تغییر وضعیت فعال/غیرفعال کاربر (فقط برای ادمین)
    
    این API امکان فعال یا غیرفعال کردن یک کاربر را فراهم می‌کند.
    فقط کاربران با نقش ادمین می‌توانند به این API دسترسی داشته باشند.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر مورد نظر یافت نشد"
        )
    
    # جلوگیری از غیرفعال کردن خود ادمین
    if user.id == admin_user.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما نمی‌توانید حساب کاربری خود را غیرفعال کنید"
        )
    
    user.is_active = is_active
    user.updated_at = func.now()
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)  # فقط ادمین
):
    """
    تغییر نقش کاربر (فقط برای ادمین)
    
    این API امکان تغییر نقش یک کاربر را فراهم می‌کند.
    فقط کاربران با نقش ادمین می‌توانند به این API دسترسی داشته باشند.
    """
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نقش نامعتبر. نقش‌های معتبر: user, admin"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="کاربر مورد نظر یافت نشد"
        )
    
    # جلوگیری از تغییر نقش خود ادمین
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما نمی‌توانید نقش خود را تغییر دهید"
        )
    
    user.role = role
    user.updated_at = func.now()
    db.commit()
    db.refresh(user)
    
    return user