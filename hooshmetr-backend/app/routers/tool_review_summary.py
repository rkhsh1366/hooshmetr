# app/routers/tool_review_summary.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tool import Tool
from app.models.tool_review_summary import ToolReviewSummary
from app.schemas.tool_review_summary import ToolReviewSummaryOut
from app.services.tool_review_summary import generate_review_summary_background
from app.dependencies.auth import get_admin_user
from app.utils.cache import get_cached_summary

router = APIRouter(
    prefix="/api/tool-review-summaries",
    tags=["Tool-review-summaries"],
)

@router.get("/{tool_id}", response_model=ToolReviewSummaryOut)
def get_review_summary(
    tool_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """دریافت خلاصه نظرات برای یک ابزار"""
    # بررسی وجود ابزار
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="ابزار مورد نظر یافت نشد")
    
    # بررسی وجود خلاصه در کش
    cached_summary = get_cached_summary(tool_id)
    if cached_summary:
        return cached_summary
    
    # بررسی وجود خلاصه در پایگاه داده
    summary = db.query(ToolReviewSummary).filter(ToolReviewSummary.tool_id == tool_id).first()
    
    if summary:
        return summary
    else:
        # اگر خلاصه وجود ندارد، یک وظیفه در پس‌زمینه برای تولید آن ایجاد کنید
        background_tasks.add_task(generate_review_summary_background, tool_id, db)
        
        # یک خلاصه خالی برگردانید
        return {
            "id": None,
            "tool_id": tool_id,
            "summary": "در حال تولید خلاصه نظرات...",
            "pros_summary": None,
            "cons_summary": None,
            "average_rating": 0.0,
            "review_count": 0,
            "created_at": tool.created_at,
            "updated_at": tool.updated_at
        }

@router.post("/{tool_id}/generate", response_model=ToolReviewSummaryOut)
def request_summary_generation(
    tool_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_admin = Depends(get_admin_user)
):
    """درخواست تولید یا به‌روزرسانی خلاصه نظرات (فقط برای مدیران)"""
    # بررسی وجود ابزار
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="ابزار مورد نظر یافت نشد")
    
    # ایجاد وظیفه تولید خلاصه
    background_tasks.add_task(generate_review_summary_background, tool_id, db)
    
    # بررسی وجود خلاصه قبلی
    summary = db.query(ToolReviewSummary).filter(ToolReviewSummary.tool_id == tool_id).first()
    
    if summary:
        return summary
    else:
        # اگر خلاصه وجود ندارد، یک خلاصه خالی برگردانید
        return {
            "id": None,
            "tool_id": tool_id,
            "summary": "در حال تولید خلاصه نظرات...",
            "pros_summary": None,
            "cons_summary": None,
            "average_rating": 0.0,
            "review_count": 0,
            "created_at": tool.created_at,
            "updated_at": tool.updated_at
        }