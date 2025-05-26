# app/routers/comparison.py
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
import json
from app.database import get_db
from app.models.user import User
from app.models.comparison import Comparison
from app.models.tool import Tool
from app.schemas.comparison import ComparisonCreate, ComparisonOut, ComparisonResult
from app.dependencies.auth import get_current_user_optional
from app.utils.cache import get_cached_comparison, cache_comparison

router = APIRouter(
    prefix="/api/comparisons",
    tags=["Comparisons"],
)

@router.post("/", response_model=ComparisonOut)
def create_comparison(
    data: ComparisonCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """ایجاد یک مقایسه جدید"""
    # بررسی وجود همه ابزارها
    tools = db.query(Tool).filter(Tool.id.in_(data.tool_ids)).all()
    
    if len(tools) != len(data.tool_ids):
        raise HTTPException(status_code=404, detail="یک یا چند ابزار یافت نشد")
        
    # ایجاد مقایسه جدید
    comparison = Comparison(
        title=data.title or f"مقایسه {', '.join([tool.name for tool in tools])}",
        user_id=current_user.id if current_user else None,
        share_token=str(uuid.uuid4())[:10] if current_user else None,
    )
    
    comparison.tools = tools
    
    # افزایش شمارنده مقایسه برای هر ابزار
    for tool in tools:
        tool.comparison_count = tool.comparison_count + 1 if tool.comparison_count else 1
    
    db.add(comparison)
    db.commit()
    db.refresh(comparison)
    
    return comparison

@router.get("/quick", response_model=ComparisonResult)
def get_quick_comparison(
    tool_ids: str = Query(..., description="شناسه‌های ابزارها، با کاما جدا شده"),
    response: Response = None,
    db: Session = Depends(get_db)
):
    """مقایسه سریع چند ابزار بدون ذخیره‌سازی"""
    try:
        # تبدیل رشته شناسه‌ها به لیست اعداد
        tool_id_list = [int(id.strip()) for id in tool_ids.split(",") if id.strip().isdigit()]
    except:
        raise HTTPException(status_code=400, detail="فرمت شناسه‌های ابزارها نامعتبر است")
    
    if not tool_id_list or len(tool_id_list) < 2:
        raise HTTPException(status_code=400, detail="حداقل دو ابزار برای مقایسه نیاز است")
    
    if len(tool_id_list) > 5:
        raise HTTPException(status_code=400, detail="حداکثر 5 ابزار را می‌توانید مقایسه کنید")
    
    # بررسی کش
    cache_key = f"comparison:{','.join(map(str, sorted(tool_id_list)))}"
    cached_result = get_cached_comparison(cache_key)
    
    if cached_result:
        if response:
            response.headers["Cache-Control"] = "public, max-age=1800"
        return cached_result
    
    # بارگذاری ابزارها با یک کوئری بهینه
    tools = db.query(Tool).filter(Tool.id.in_(tool_id_list)).options(
        joinedload(Tool.categories),
        joinedload(Tool.technologies),
        joinedload(Tool.tags),
        joinedload(Tool.review_summary)
    ).all()
    
    if len(tools) != len(tool_id_list):
        raise HTTPException(status_code=404, detail="یک یا چند ابزار یافت نشد")
    
    # افزایش شمارنده مقایسه برای هر ابزار
    for tool in tools:
        tool.comparison_count = tool.comparison_count + 1 if tool.comparison_count else 1
    db.commit()
    
    # تولید نتایج مقایسه
    result = generate_comparison_results(tools)
    
    # ذخیره در کش
    cache_comparison(cache_key, result, 1800)  # کش برای 30 دقیقه
    
    # تنظیم هدرهای کش
    if response:
        response.headers["Cache-Control"] = "public, max-age=1800"
    
    return result

def generate_comparison_results(tools):
    """تولید نتایج تحلیلی مقایسه"""
    # تعریف ویژگی‌های مقایسه
    features = [
        {"name": "license_type", "display_name": "نوع لایسنس", "feature_type": "text"},
        {"name": "supports_farsi", "display_name": "پشتیبانی از فارسی", "feature_type": "boolean"},
        {"name": "is_sanctioned", "display_name": "تحریم‌شده برای ایران", "feature_type": "boolean"},
        {"name": "is_filtered", "display_name": "فیلتر شده در ایران", "feature_type": "boolean"},
        {"name": "has_chatbot", "display_name": "دارای چت‌بات", "feature_type": "boolean"},
        {"name": "multi_language_support", "display_name": "پشتیبانی چندزبانه", "feature_type": "boolean"},
        {"name": "desktop_version", "display_name": "نسخه دسکتاپ", "feature_type": "boolean"},
        {"name": "average_rating", "display_name": "میانگین امتیاز", "feature_type": "rating"},
        {"name": "review_count", "display_name": "تعداد نظرات", "feature_type": "number"},
    ]
    
    # ساخت جدول مقایسه
    comparison_table = {}
    tool_data = []
    
    # جمع‌آوری داده‌های ابزارها
    for tool in tools:
        tool_info = {
            "id": tool.id,
            "name": tool.name,
            "description": tool.description,
            "website": tool.website,
            "image_url": tool.image_url,
            "categories": [{"id": c.id, "name": c.name} for c in tool.categories],
            "technologies": [{"id": t.id, "name": t.name} for t in tool.technologies],
            "tags": [{"id": t.id, "name": t.name} for t in tool.tags],
            "average_rating": tool.average_rating or 0,
            "review_count": tool.review_count or 0,
        }
        tool_data.append(tool_info)
    
    # ساخت جدول مقایسه
    for feature in features:
        feature_name = feature["name"]
        comparison_table[feature_name] = {}
        
        for tool in tools:
            comparison_table[feature_name][tool.id] = getattr(tool, feature_name, None)
    
    # تحلیل و خلاصه‌سازی
    summary = {
        "highest_rated": find_highest_rated_tool(tools),
        "best_for_iranians": find_best_for_iranians(tools),
        "most_features": find_tool_with_most_features(tools, features)
    }
    
    return {
        "tools": tool_data,
        "features": features,
        "comparison_table": comparison_table,
        "summary": summary
    }

def find_highest_rated_tool(tools):
    """یافتن ابزار با بالاترین امتیاز"""
    if not tools:
        return None
        
    highest_rated = max(tools, key=lambda t: t.average_rating or 0)
    return {
        "tool_id": highest_rated.id,
        "name": highest_rated.name,
        "rating": highest_rated.average_rating or 0
    }

def find_best_for_iranians(tools):
    """یافتن بهترین ابزار برای کاربران ایرانی"""
    # فیلتر ابزارهای غیرتحریمی
    non_sanctioned = [t for t in tools if not getattr(t, 'is_sanctioned', False)]
    
    if not non_sanctioned:
        return None
        
    # اولویت با ابزارهایی که از فارسی پشتیبانی می‌کنند
    farsi_tools = [t for t in non_sanctioned if getattr(t, 'supports_farsi', False)]
    
    if farsi_tools:
        best_tool = max(farsi_tools, key=lambda t: t.average_rating or 0)
    else:
        best_tool = max(non_sanctioned, key=lambda t: t.average_rating or 0)
        
    return {
        "tool_id": best_tool.id,
        "name": best_tool.name
    }

def find_tool_with_most_features(tools, features):
    """یافتن ابزار با بیشترین ویژگی‌های فعال"""
    if not tools:
        return None
        
    boolean_features = [f["name"] for f in features if f["feature_type"] == "boolean"]
    
    feature_counts = {}
    for tool in tools:
        count = sum(1 for feature in boolean_features if getattr(tool, feature, False))
        feature_counts[tool.id] = count
    
    if not feature_counts:
        return None
        
    best_id = max(feature_counts.items(), key=lambda x: x[1])[0]
    best_tool = next(t for t in tools if t.id == best_id)
    
    return {
        "tool_id": best_tool.id,
        "name": best_tool.name,
        "feature_count": feature_counts[best_id]
    }