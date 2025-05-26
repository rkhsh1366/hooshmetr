# app/routers/tools.py
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import or_, func
from typing import List, Optional
from app.database import get_db
from app.schemas.tool import ToolOut, ToolCreate, ToolUpdate, ToolFilterParams, SortOption
from app.models.tool import Tool
from app.models.category import Category
from app.models.technology import Technology
from app.models.tag import Tag
from app.models.review_reaction import ReviewReaction
from app.dependencies.auth import get_admin_user, get_current_user_optional
from app.models.user import User
from app.utils.slugify import slugify
from app.utils.cache import get_cached_tool, cache_tool, invalidate_tool_cache

router = APIRouter(
    prefix="/api/tools",
    tags=["Tools"]
)

@router.get("/", response_model=List[ToolOut])
def list_tools(
    filter_params: ToolFilterParams = Depends(),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """دریافت لیست ابزارها با امکان فیلتر و مرتب‌سازی"""
    # بررسی کش
    cache_key = f"tools_list:{filter_params.json()}"
    cached_tools = get_cached_tool(cache_key)
    
    if cached_tools:
        return cached_tools
    
    # پایه کوئری
    query = db.query(Tool)
    
    # اعمال فیلترها
    if filter_params.search:
        search_term = f"%{filter_params.search}%"
        query = query.filter(or_(
            Tool.name.ilike(search_term),
            Tool.description.ilike(search_term),
            Tool.highlight_features.ilike(search_term),
            Tool.website.ilike(search_term),
            Tool.license_type.ilike(search_term)
        ))

    if filter_params.license_type:
        query = query.filter(Tool.license_type == filter_params.license_type)

    if filter_params.supports_farsi is not None:
        query = query.filter(Tool.supports_farsi == filter_params.supports_farsi)

    if filter_params.is_sanctioned is not None:
        query = query.filter(Tool.is_sanctioned == filter_params.is_sanctioned)
        
    if filter_params.api_available is not None:
        query = query.filter(Tool.api_available == filter_params.api_available)
        
    if filter_params.is_free is not None:
        query = query.filter(Tool.is_free == filter_params.is_free)

    if filter_params.category_ids:
        query = query.filter(Tool.categories.any(Category.id.in_(filter_params.category_ids)))

    if filter_params.technology_ids:
        query = query.filter(Tool.technologies.any(Technology.id.in_(filter_params.technology_ids)))

    if filter_params.tag_ids:
        query = query.filter(Tool.tags.any(Tag.id.in_(filter_params.tag_ids)))
    
    # اعمال مرتب‌سازی
    if filter_params.sort_by == SortOption.RATING_HIGH:
        query = query.order_by(Tool.average_rating.desc().nullslast())
    elif filter_params.sort_by == SortOption.RATING_LOW:
        query = query.order_by(Tool.average_rating.asc().nullsfirst())
    elif filter_params.sort_by == SortOption.VIEWS:
        query = query.order_by(Tool.view_count.desc().nullslast())
    elif filter_params.sort_by == SortOption.REVIEWS:
        query = query.order_by(Tool.review_count.desc().nullslast())
    elif filter_params.sort_by == SortOption.COMPARISONS:
        query = query.order_by(Tool.comparison_count.desc().nullslast())
    elif filter_params.sort_by == SortOption.OLDEST:
        query = query.order_by(Tool.created_at.asc())
    else:  # NEWEST (default)
        query = query.order_by(Tool.created_at.desc())
    
    # محاسبه تعداد کل نتایج
    total_count = query.count()
    
    # اعمال صفحه‌بندی
    query = query.offset((filter_params.page - 1) * filter_params.per_page).limit(filter_params.per_page)
    
    # بارگذاری روابط
    query = query.options(
        joinedload(Tool.review_summary),
        joinedload(Tool.categories),
        joinedload(Tool.technologies),
        joinedload(Tool.tags)
    )
    
    # دریافت نتایج
    tools = query.all()
    
    # ذخیره در کش
    cache_tool(cache_key, tools, 300)  # کش برای 5 دقیقه
    
    return tools

@router.post("/", response_model=ToolOut)
def create_tool(
    data: ToolCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """ایجاد ابزار جدید (فقط ادمین)"""
    # بررسی تکراری نبودن نام و اسلاگ
    if db.query(Tool).filter(Tool.name == data.name).first():
        raise HTTPException(status_code=400, detail="این نام قبلاً ثبت شده است")
        
    if db.query(Tool).filter(Tool.slug == data.slug).first():
        raise HTTPException(status_code=400, detail="این اسلاگ قبلاً ثبت شده است")

    # ایجاد ابزار جدید
    tool = Tool(
        name=data.name,
        slug=data.slug,
        description=data.description,
        website=data.website,
        license_type=data.license_type,
        supports_farsi=data.supports_farsi,
        is_sanctioned=data.is_sanctioned,
        is_free=data.is_free,
        highlight_features=data.highlight_features,
        api_available=data.api_available,
        pricing_info=data.pricing_info,
        image_url=data.image_url
    )

    # افزودن روابط
    if data.category_ids:
        tool.categories = db.query(Category).filter(Category.id.in_(data.category_ids)).all()
    if data.technology_ids:
        tool.technologies = db.query(Technology).filter(Technology.id.in_(data.technology_ids)).all()
    if data.tag_ids:
        tool.tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()

    db.add(tool)
    db.commit()
    db.refresh(tool)
    
    # حذف کش
    invalidate_tool_cache("tools_list")
    
    return tool

@router.get("/{slug}", response_model=ToolOut)
def get_tool(
    slug: str, 
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """دریافت جزئیات یک ابزار"""
    # بررسی کش
    cache_key = f"tool_detail:{slug}"
    cached_tool = get_cached_tool(cache_key)
    
    if cached_tool:
        # افزایش بازدید در پس‌زمینه
        if background_tasks:
            background_tasks.add_task(increment_tool_view, slug, db)
        return cached_tool

    # بارگذاری ابزار با روابط
    tool = db.query(Tool).filter(Tool.slug == slug).options(
        joinedload(Tool.review_summary),
        joinedload(Tool.categories),
        joinedload(Tool.technologies),
        joinedload(Tool.tags)
    ).first()

    if not tool:
        raise HTTPException(status_code=404, detail="ابزار پیدا نشد")

    # افزایش بازدید در پس‌زمینه
    if background_tasks:
        background_tasks.add_task(increment_tool_view, slug, db)
    
    # ذخیره در کش
    cache_tool(cache_key, tool, 600)  # کش برای 10 دقیقه
    
    return tool

@router.put("/{slug}", response_model=ToolOut)
def update_tool(
    slug: str,
    data: ToolUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """به‌روزرسانی یک ابزار (فقط ادمین)"""
    # یافتن ابزار
    tool = db.query(Tool).filter(Tool.slug == slug).first()
    if not tool:
        raise HTTPException(status_code=404, detail="ابزار پیدا نشد")

    # بررسی تکراری نبودن اسلاگ جدید
    if data.slug and data.slug != slug:
        if db.query(Tool).filter(Tool.slug == data.slug).first():
            raise HTTPException(status_code=400, detail="این اسلاگ قبلاً ثبت شده است")

    # به‌روزرسانی فیلدها
    for attr, value in data.dict(exclude_unset=True).items():
        if attr not in ["category_ids", "technology_ids", "tag_ids"]:
            setattr(tool, attr, value)

    # به‌روزرسانی روابط
    if data.category_ids is not None:
        tool.categories = db.query(Category).filter(Category.id.in_(data.category_ids)).all()
    if data.technology_ids is not None:
        tool.technologies = db.query(Technology).filter(Technology.id.in_(data.technology_ids)).all()
    if data.tag_ids is not None:
        tool.tags = db.query(Tag).filter(Tag.id.in_(data.tag_ids)).all()

    db.commit()
    db.refresh(tool)
    
    # حذف کش
    invalidate_tool_cache(f"tool_detail:{slug}")
    if data.slug and data.slug != slug:
        invalidate_tool_cache(f"tool_detail:{data.slug}")
    invalidate_tool_cache("tools_list")
    
    return tool

@router.delete("/{slug}", status_code=204)
def delete_tool(
    slug: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    """حذف یک ابزار (فقط ادمین)"""
    # یافتن ابزار
    tool = db.query(Tool).filter(Tool.slug == slug).first()
    if not tool:
        raise HTTPException(status_code=404, detail="ابزار مورد نظر یافت نشد")
    
    # حذف ابزار
    db.delete(tool)
    db.commit()
    
    # حذف کش
    invalidate_tool_cache(f"tool_detail:{slug}")
    invalidate_tool_cache("tools_list")
    
    return None

@router.get("/search/autocomplete", response_model=List[ToolOut])
def autocomplete_tools(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """جستجوی خودکار برای تکمیل عبارت جستجو"""
    # بررسی کش
    cache_key = f"autocomplete:{q}:{limit}"
    cached_results = get_cached_tool(cache_key)
    
    if cached_results:
        return cached_results
    
    # جستجو در ابزارها
    search_term = f"%{q}%"
    tools = db.query(Tool).filter(
        or_(
            Tool.name.ilike(search_term),
            Tool.description.ilike(search_term),
            Tool.highlight_features.ilike(search_term)
        )
    ).order_by(
        # اولویت با ابزارهایی که نام آنها با عبارت جستجو شروع می‌شود
        func.case(
            (func.lower(Tool.name).like(f"{q.lower()}%"), 1),
            (func.lower(Tool.name).like(f"%{q.lower()}%"), 2),
            else_=3
        ),
        Tool.average_rating.desc().nullslast()
    ).options(
        joinedload(Tool.categories),
        joinedload(Tool.tags)
    ).limit(limit).all()
    
    # ذخیره در کش
    cache_tool(cache_key, tools, 300)  # کش برای 5 دقیقه
    
    return tools

# تابع کمکی برای افزایش تعداد بازدید
def increment_tool_view(slug: str, db: Session):
    """افزایش تعداد بازدید یک ابزار"""
    try:
        tool = db.query(Tool).filter(Tool.slug == slug).with_for_update().first()
        if tool:
            tool.view_count = tool.view_count + 1 if tool.view_count else 1
            db.commit()
    except Exception as e:
        db.rollback()
        # لاگ خطا
        print(f"خطا در افزایش تعداد بازدید: {str(e)}")