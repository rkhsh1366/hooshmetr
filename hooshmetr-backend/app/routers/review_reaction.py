# app/routers/review_reaction.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tool_review import ToolReview
from app.models.review_reaction import ReviewReaction
from app.models.user import User
from app.schemas.review_reaction import ReviewReactionCreate, ReviewReactionOut, ReviewReactionUpdate
from typing import List
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/api/review-reactions",
    tags=["Review-reactions"],
)

@router.post("/{review_id}", response_model=ReviewReactionOut)
def add_reaction(
    review_id: int,
    data: ReviewReactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """افزودن واکنش به یک نظر"""
    # بررسی وجود نظر
    review = db.query(ToolReview).filter(ToolReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="نظر پیدا نشد")

    # بررسی اینکه کاربر قبلاً واکنش داده یا نه
    existing = db.query(ReviewReaction).filter(
        ReviewReaction.review_id == review_id,
        ReviewReaction.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="شما قبلاً واکنشی ثبت کرده‌اید")

    # ایجاد واکنش جدید
    reaction = ReviewReaction(
        review_id=review_id,
        user_id=current_user.id,
        reaction_type=data.reaction_type
    )

    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction


@router.put("/{review_id}", response_model=ReviewReactionOut)
def update_reaction(
    review_id: int,
    data: ReviewReactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """به‌روزرسانی واکنش به یک نظر"""
    # بررسی وجود واکنش
    reaction = db.query(ReviewReaction).filter(
        ReviewReaction.review_id == review_id,
        ReviewReaction.user_id == current_user.id
    ).first()

    if not reaction:
        raise HTTPException(status_code=404, detail="واکنش ثبت نشده است")

    # به‌روزرسانی نوع واکنش
    reaction.reaction_type = data.reaction_type
    db.commit()
    db.refresh(reaction)
    return reaction


@router.delete("/{review_id}")
def delete_reaction(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف واکنش به یک نظر"""
    # بررسی وجود واکنش
    reaction = db.query(ReviewReaction).filter(
        ReviewReaction.review_id == review_id,
        ReviewReaction.user_id == current_user.id
    ).first()

    if not reaction:
        raise HTTPException(status_code=404, detail="واکنشی برای حذف یافت نشد")

    # حذف واکنش
    db.delete(reaction)
    db.commit()
    return {"detail": "واکنش شما حذف شد"}


@router.get("/{review_id}/count")
def get_reaction_counts(review_id: int, db: Session = Depends(get_db)):
    """دریافت تعداد واکنش‌های یک نظر"""
    # بررسی وجود نظر
    review = db.query(ToolReview).filter(ToolReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="نظر پیدا نشد")
    
    # محاسبه تعداد واکنش‌های مثبت و منفی
    total_likes = db.query(ReviewReaction).filter_by(
        review_id=review_id, 
        reaction_type="like"
    ).count()
    
    total_dislikes = db.query(ReviewReaction).filter_by(
        review_id=review_id, 
        reaction_type="dislike"
    ).count()

    return {
        "likes": total_likes,
        "dislikes": total_dislikes
    }