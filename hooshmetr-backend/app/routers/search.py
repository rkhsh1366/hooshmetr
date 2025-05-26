# app/routers/search.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
from typing import List, Optional
from app.database import get_db
from app.models.tool import Tool
from app.schemas.search import SearchResult, SearchResponse
from app.utils.cache import get_cached_search, cache_search

router = APIRouter(
    prefix="/api/search",
    tags=["Search"]
)

@router.get("/", response_model=SearchResponse)
def search_tools(
    q: str = Query(None, description="عبارت جستجو"),
    category_id: Optional[int] = Query(None, description="فیلتر بر اساس دسته‌بندی"),
    technology_id: Optional[int] = Query(None, description="فیلتر بر اساس تکنولوژی"),
    tag_id: Optional[int] = Query(None, description="فیلتر بر اساس تگ"),
    supports_farsi: Optional[bool] = Query(None, description="فیلتر بر اساس پشتیبانی از فارسی"),
    is_free: Optional[bool] = Query(None, description="فیلتر بر اساس رایگان بودن"),
    is_sanctioned: Optional[bool] = Query(None, description="فیلتر بر اساس تحریم بودن"),
    sort_by: str = Query("relevance", description="نحوه مرتب‌سازی نتایج"),
    page: int = Query(1, ge=1, description="شماره صفحه"),
    per_page: int = Query(20, ge=1, le=100, description="تعداد نتایج در هر صفحه"),
    db: Session = Depends(get_db)
):
    """جستجوی ابزارها با امکان فیلتر و مرتب‌سازی"""
    # بررسی کش
    cache_key = f"search:{q}:{category_id}:{technology_id}:{tag_id}:{supports_farsi}:{is_free}:{is_sanctioned}:{sort_by}:{page}:{per_page}"
    cached_result = get_cached_search(cache_key)
    if cached_result:
        return cached_result
    
    # ساخت کوئری پایه
    query = db.query(Tool)
    
    # اعمال فیلترها
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Tool.name.ilike(search_term),
                Tool.description.ilike(search_term),
                Tool.highlight_features.ilike(search_term),
                Tool.website.ilike(search_term),
                Tool.license_type.ilike(search_term)
            )
        )
    
    if category_id:
        query = query.filter(Tool.categories.any(id=category_id))
    
    if technology_id:
        query = query.filter(Tool.technologies.any(id=technology_id))
    
    if tag_id:
        query = query.filter(Tool.tags.any(id=tag_id))
    
    if supports_farsi is not None:
        query = query.filter(Tool.supports_farsi == supports_farsi)
    
    if is_free is not None:
        query = query.filter(Tool.is_free == is_free)
    
    if is_sanctioned is not None:
        query = query.filter(Tool.is_sanctioned == is_sanctioned)
    
    # اعمال مرتب‌سازی
    if sort_by == "name_asc":
        query = query.order_by(Tool.name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Tool.name.desc())
    elif sort_by == "rating_high":
        query = query.order_by(Tool.average_rating.desc().nullslast())
    elif sort_by == "rating_low":
        query = query.order_by(Tool.average_rating.asc().nullsfirst())
    elif sort_by == "reviews":
        query = query.order_by(Tool.review_count.desc().nullslast())
    elif sort_by == "views":
        query = query.order_by(Tool.view_count.desc().nullslast())
    elif sort_by == "comparisons":
        query = query.order_by(Tool.comparison_count.desc().nullslast())
    elif sort_by == "newest":
        query = query.order_by(Tool.created_at.desc())
    else:  # relevance (default)
        if q:
            # برای جستجوی متنی، ابزارهایی که نام آنها با عبارت جستجو مطابقت دارد در اولویت قرار می‌گیرند
            query = query.order_by(
                func.case(
                    (func.lower(Tool.name).like(f"%{q.lower()}%"), 1),
                    else_=2
                ),
                Tool.average_rating.desc().nullslast(),
                Tool.review_count.desc().nullslast()
            )
        else:
            # اگر عبارت جستجو وجود نداشت، بر اساس امتیاز و تعداد نظرات مرتب کن
            query = query.order_by(Tool.average_rating.desc().nullslast(), Tool.review_count.desc().nullslast())
    
    # محاسبه تعداد کل نتایج
    total_count = query.count()
    
    # اعمال صفحه‌بندی
    offset = (page - 1) * per_page
    tools = query.offset(offset).limit(per_page).all()
    
    # ساخت پاسخ
    results = []
    for tool in tools:
        results.append({
            "id": tool.id,
            "name": tool.name,
            "description": tool.description[:150] + "..." if tool.description and len(tool.description) > 150 else tool.description,
            "image_url": tool.image_url,
            "website": tool.website,
            "average_rating": tool.average_rating or 0,
            "review_count": tool.review_count or 0,
            "categories": [{"id": c.id, "name": c.name} for c in tool.categories],
            "tags": [{"id": t.id, "name": t.name} for t in tool.tags]
        })
    
    response = {
        "results": results,
        "total": total_count,
        "page": page,
        "per_page": per_page,
        "pages": (total_count + per_page - 1) // per_page
    }
    
    # ذخیره در کش
    cache_search(cache_key, response, 300)  # کش برای 5 دقیقه
    
    return response

@router.get("/autocomplete", response_model=List[SearchResult])
def autocomplete_search(
    q: str = Query(..., min_length=1, description="عبارت جستجو"),
    limit: int = Query(10, ge=1, le=20, description="تعداد نتایج"),
    db: Session = Depends(get_db)
):
    """جستجوی خودکار برای تکمیل عبارت جستجو"""
    # بررسی کش
    cache_key = f"autocomplete:{q}:{limit}"
    cached_result = get_cached_search(cache_key)
    if cached_result:
        return cached_result
    
    search_term = f"%{q}%"
    
    # جستجوی ابزارها بر اساس نام و توضیحات
    query = db.query(Tool).filter(
        or_(
            Tool.name.ilike(search_term),
            Tool.description.ilike(search_term),
            Tool.highlight_features.ilike(search_term)
        )
    )
    
    # مرتب‌سازی بر اساس اولویت تطابق (ابتدا نام، سپس توضیحات) و سپس امتیاز
    query = query.order_by(
        func.case(
            (func.lower(Tool.name).like(f"{q.lower()}%"), 1),  # شروع با عبارت جستجو
            (func.lower(Tool.name).like(f"%{q.lower()}%"), 2),  # شامل عبارت جستجو
            else_=3
        ),
        Tool.average_rating.desc().nullslast()
    ).limit(limit)
    
    tools = query.all()
    
    results = []
    for tool in tools:
        results.append({
            "id": tool.id,
            "name": tool.name,
            "description": tool.description[:100] + "..." if tool.description and len(tool.description) > 100 else tool.description,
            "image_url": tool.image_url,
            "average_rating": tool.average_rating or 0
        })
    
    # ذخیره در کش
    cache_search(cache_key, results, 300)  # کش برای 5 دقیقه
    
    return results