# app/routers/tool_reviews.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.tool import Tool
from app.models.tool_review import ToolReview
from app.models.user import User
from app.schemas.tool_review import ToolReviewCreate, ToolReviewOut, ToolReviewUpdate
from app.dependencies.auth import get_current_user
from app.services.tool_review_summary import schedule_review_summary_generation

router = APIRouter(
    prefix="/api/tool-reviews",
    tags=["Tool-reviews"],
)

@router.post("/", response_model=ToolReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review: ToolReviewCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """ثبت نظر جدید"""
    # بررسی وجود ابزار
    tool = db.query(Tool).filter(Tool.id == review.tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="ابزار مورد نظر یافت نشد")
    
    # بررسی اینکه آیا کاربر قبلاً نظر داده است
    existing_review = db.query(ToolReview).filter(
        ToolReview.tool_id == review.tool_id,
        ToolReview.user_id == current_user.id
    ).first()
    
    if existing_review:
        # به‌روزرسانی نظر موجود
        existing_review.rating = review.rating
        existing_review.content = review.content
        existing_review.pros = review.pros
        existing_review.cons = review.cons
        db.commit()
        db.refresh(existing_review)
        new_review = existing_review
    else:
        # ایجاد نظر جدید
        new_review = ToolReview(
            tool_id=review.tool_id,
            user_id=current_user.id,
            rating=review.rating,
            content=review.content,
            pros=review.pros,
            cons=review.cons
        )
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        
        # افزایش شمارنده نظرات ابزار
        tool.review_count = tool.review_count + 1 if tool.review_count else 1
        db.commit()
    
    # درخواست تولید خلاصه نظرات در پس‌زمینه
    schedule_review_summary_generation(review.tool_id, background_tasks, db)
    
    return new_review

@router.get("/tools/{tool_id}", response_model=List[ToolReviewOut])
def get_reviews(
    tool_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """دریافت نظرات یک ابزار"""
    # بررسی وجود ابزار
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="ابزار مورد نظر یافت نشد")
    
    # دریافت نظرات
    reviews = db.query(ToolReview).filter(ToolReview.tool_id == tool_id).all()
    
    # محاسبه تعداد واکنش‌های مثبت و منفی و واکنش کاربر فعلی
    for review in reviews:
        review.positive_reactions_count = len([r for r in review.reactions if r.reaction_type == "like"])
        review.negative_reactions_count = len([r for r in review.reactions if r.reaction_type == "dislike"])
        
        # بررسی واکنش کاربر فعلی
        user_reaction = None
        for reaction in review.reactions:
            if reaction.user_id == current_user.id:
                user_reaction = reaction.reaction_type
                break
        review.user_reaction = user_reaction
    
    return reviews

@router.put("/{review_id}", response_model=ToolReviewOut)
def update_review(
    review_id: int,
    review_data: ToolReviewUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """به‌روزرسانی یک نظر"""
    # بررسی وجود نظر
    review = db.query(ToolReview).filter(ToolReview.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="نظر مورد نظر یافت نشد")
    
    # بررسی مالکیت نظر
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="شما اجازه ویرایش این نظر را ندارید")
    
    # به‌روزرسانی مقادیر
    if review_data.rating is not None:
        review.rating = review_data.rating
    if review_data.content is not None:
        review.content = review_data.content
    if review_data.pros is not None:
        review.pros = review_data.pros
    if review_data.cons is not None:
        review.cons = review_data.cons
    
    db.commit()
    db.refresh(review)
    
    # به‌روزرسانی خلاصه نظرات در پس‌زمینه
    schedule_review_summary_generation(review.tool_id, background_tasks, db)
    
    return review

@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف یک نظر"""
    # بررسی وجود نظر
    review = db.query(ToolReview).filter(ToolReview.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="نظر مورد نظر یافت نشد")
    
    # بررسی مالکیت نظر یا دسترسی ادمین
    if review.user_id != current_user.id and not current_user.role == "admin":
        raise HTTPException(status_code=403, detail="شما اجازه حذف این نظر را ندارید")
    
    # ذخیره tool_id قبل از حذف نظر
    tool_id = review.tool_id
    
    # حذف نظر
    db.delete(review)
    db.commit()
    
    # کاهش شمارنده نظرات ابزار
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if tool and tool.review_count:
        tool.review_count = max(0, tool.review_count - 1)
        db.commit()
    
    # به‌روزرسانی خلاصه نظرات در پس‌زمینه
    if tool:
        schedule_review_summary_generation(tool_id, background_tasks, db)
    
    return None