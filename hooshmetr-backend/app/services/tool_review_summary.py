# app/services/tool_review_summary.py
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
import re
import nltk
from collections import Counter
from app.models.tool_review import ToolReview
from app.models.tool_review_summary import ToolReviewSummary
from app.models.tool import Tool
from app.config import settings
from typing import List, Dict, Any
import logging

# دانلود داده‌های مورد نیاز برای NLTK (فقط یک بار اجرا شود)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
    
try:
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

logger = logging.getLogger("hooshmetr.services")

def generate_review_summary_background(tool_id: int, db: Session):
    """تولید خلاصه نظرات در پس‌زمینه"""
    try:
        logger.info(f"شروع تولید خلاصه نظرات برای ابزار {tool_id}")
        
        # بررسی تعداد نظرات
        reviews = db.query(ToolReview).filter(ToolReview.tool_id == tool_id).all()
        
        if not reviews:
            logger.info(f"هیچ نظری برای ابزار {tool_id} یافت نشد")
            save_empty_summary(db, tool_id)
            return
        
        # اگر تعداد نظرات کمتر از حداقل است، یک خلاصه ساده ایجاد کنید
        min_reviews = getattr(settings, "SUMMARIZE_MIN_REVIEWS", 5)
        if len(reviews) < min_reviews:
            logger.info(f"تعداد نظرات ({len(reviews)}) کمتر از حداقل لازم ({min_reviews}) است، تولید خلاصه ساده")
            summary_data = generate_simple_summary(reviews)
        else:
            # در غیر این صورت، خلاصه کامل ایجاد کنید
            logger.info(f"تولید خلاصه کامل برای {len(reviews)} نظر")
            summary_data = generate_statistical_summary(reviews)
        
        # ذخیره خلاصه در پایگاه داده
        save_summary_to_db(db, tool_id, summary_data)
        
        # به‌روزرسانی میانگین امتیاز ابزار
        update_tool_average_rating(db, tool_id)
        
        logger.info(f"خلاصه نظرات برای ابزار {tool_id} با موفقیت تولید شد")
                
    except Exception as e:
        logger.error(f"خطا در تولید خلاصه نظرات برای ابزار {tool_id}: {str(e)}", exc_info=True)

def generate_simple_summary(reviews: List[ToolReview]) -> Dict[str, Any]:
    """تولید یک خلاصه ساده براساس میانگین امتیاز"""
    # محاسبه میانگین امتیاز
    ratings = [r.rating for r in reviews if r.rating is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    # استخراج نقاط قوت و ضعف
    pros = []
    cons = []
    
    for review in reviews:
        if review.pros:
            pros.append(review.pros)
        if review.cons:
            cons.append(review.cons)
    
    pros_summary = "\n".join(pros[:3]) if pros else None
    cons_summary = "\n".join(cons[:3]) if cons else None
    
    summary = f"میانگین امتیاز {avg_rating:.1f} از 5 براساس {len(ratings)} نظر."
    
    return {
        "summary": summary,
        "pros_summary": pros_summary,
        "cons_summary": cons_summary,
        "average_rating": avg_rating,
        "review_count": len(reviews)
    }

def generate_statistical_summary(reviews: List[ToolReview]) -> Dict[str, Any]:
    """تولید خلاصه آماری از نظرات"""
    # محاسبه میانگین امتیاز
    ratings = [r.rating for r in reviews if r.rating is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    # شمارش امتیازات
    rating_counts = {}
    for r in range(1, 6):
        rating_counts[r] = len([rating for rating in ratings if rating == r])
    
    # استخراج نقاط قوت و ضعف
    all_pros = []
    all_cons = []
    
    for review in reviews:
        if review.pros:
            all_pros.append(review.pros)
        if review.cons:
            all_cons.append(review.cons)
    
    # تولید خلاصه نقاط قوت و ضعف
    pros_summary = extract_common_points(all_pros) if all_pros else None
    cons_summary = extract_common_points(all_cons) if all_cons else None
    
    # تولید خلاصه کلی
    if avg_rating >= 4:
        sentiment = "بسیار مثبت"
    elif avg_rating >= 3:
        sentiment = "نسبتاً مثبت"
    elif avg_rating >= 2:
        sentiment = "متوسط"
    else:
        sentiment = "منفی"
    
    summary = f"براساس {len(ratings)} نظر، کاربران دیدگاه {sentiment} نسبت به این ابزار دارند. میانگین امتیاز {avg_rating:.1f} از 5 است."
    
    if pros_summary:
        summary += " نقاط قوت اصلی شامل مواردی مانند کیفیت، سرعت و کارایی است."
    
    if cons_summary:
        summary += " برخی کاربران از مواردی مانند قیمت، پشتیبانی و محدودیت‌ها ناراضی هستند."
    
    return {
        "summary": summary,
        "pros_summary": pros_summary,
        "cons_summary": cons_summary,
        "average_rating": avg_rating,
        "review_count": len(reviews)
    }

def extract_common_points(points: List[str]) -> str:
    """استخراج نقاط مشترک از لیست نقاط قوت یا ضعف"""
    if not points:
        return None
        
    # ترکیب همه نقاط
    all_text = " ".join(points)
    
    # تقسیم به جملات
    sentences = re.split(r'[.!?؟]+', all_text)
    
    # حذف جملات خالی و کوتاه
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    # انتخاب حداکثر 3 جمله
    selected_sentences = sentences[:3]
    
    return ". ".join(selected_sentences) + "." if selected_sentences else None

def save_empty_summary(db: Session, tool_id: int):
    """ذخیره یک خلاصه خالی"""
    summary_data = {
        "summary": "هنوز نظری برای این ابزار ثبت نشده است.",
        "pros_summary": None,
        "cons_summary": None,
        "average_rating": 0.0,
        "review_count": 0
    }
    
    save_summary_to_db(db, tool_id, summary_data)

def save_summary_to_db(db: Session, tool_id: int, summary_data: Dict[str, Any]):
    """ذخیره خلاصه نظرات در پایگاه داده"""
    # بررسی وجود خلاصه قبلی
    existing_summary = db.query(ToolReviewSummary).filter(ToolReviewSummary.tool_id == tool_id).first()
    
    if existing_summary:
        # به‌روزرسانی خلاصه موجود
        existing_summary.summary = summary_data["summary"]
        existing_summary.pros_summary = summary_data["pros_summary"]
        existing_summary.cons_summary = summary_data["cons_summary"]
        existing_summary.average_rating = summary_data["average_rating"]
        existing_summary.review_count = summary_data["review_count"]
    else:
        # ایجاد خلاصه جدید
        new_summary = ToolReviewSummary(
            tool_id=tool_id,
            summary=summary_data["summary"],
            pros_summary=summary_data["pros_summary"],
            cons_summary=summary_data["cons_summary"],
            average_rating=summary_data["average_rating"],
            review_count=summary_data["review_count"]
        )
        db.add(new_summary)
    
    db.commit()

def update_tool_average_rating(db: Session, tool_id: int):
    """به‌روزرسانی میانگین امتیاز ابزار"""
    # محاسبه میانگین امتیاز
    avg_rating = db.query(func.avg(ToolReview.rating)).filter(
        ToolReview.tool_id == tool_id,
        ToolReview.rating.isnot(None)
    ).scalar() or 0.0
    
    # به‌روزرسانی ابزار
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if tool:
        tool.average_rating = round(float(avg_rating), 2)
        tool.review_count = db.query(ToolReview).filter(ToolReview.tool_id == tool_id).count()
        db.commit()

def schedule_review_summary_generation(tool_id: int, background_tasks: BackgroundTasks, db: Session):
    """زمان‌بندی تولید خلاصه نظرات در پس‌زمینه"""
    background_tasks.add_task(generate_review_summary_background, tool_id, db)
    logger.info(f"تولید خلاصه نظرات برای ابزار {tool_id} زمان‌بندی شد")