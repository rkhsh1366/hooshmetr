# app/routers/blog.py
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.blog import BlogPost, BlogCategory, BlogTag, BlogComment
from app.models.user import User
from app.schemas.blog import (
    BlogPostCreate, BlogPostUpdate, BlogPostOut, BlogPostWithComments,
    BlogCategoryCreate, BlogCategoryUpdate, BlogCategoryOut,
    BlogTagCreate, BlogTagUpdate, BlogTagOut,
    BlogCommentCreate, BlogCommentUpdate, BlogCommentOut
)
from app.dependencies.auth import get_current_user, get_admin_user, get_current_user_optional
from app.utils.slugify import slugify
from datetime import datetime
from sqlalchemy import func, desc, or_
from app.utils.cache import get_cached_blog, cache_blog, invalidate_blog_cache

router = APIRouter(
    prefix="/api/blog",
    tags=["Blog"]
)

# روتر مقالات وبلاگ
@router.post("/posts", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    post: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند پست ایجاد کند
):
    """ایجاد مقاله جدید"""
    # بررسی تکراری نبودن slug
    existing_post = db.query(BlogPost).filter(BlogPost.slug == post.slug).first()
    if existing_post:
        raise HTTPException(
            status_code=400,
            detail="این slug قبلاً استفاده شده است"
        )
    
    # ایجاد پست جدید
    new_post = BlogPost(
        title=post.title,
        slug=post.slug,
        summary=post.summary,
        content=post.content,
        featured_image=post.featured_image,
        is_published=post.is_published,
        published_at=datetime.now() if post.is_published else None,
        author_id=current_user.id
    )
    
    # افزودن دسته‌بندی‌ها
    if post.category_ids:
        categories = db.query(BlogCategory).filter(BlogCategory.id.in_(post.category_ids)).all()
        if len(categories) != len(post.category_ids):
            raise HTTPException(
                status_code=400,
                detail="یک یا چند دسته‌بندی یافت نشد"
            )
        new_post.categories = categories
    
    # افزودن تگ‌ها
    if post.tag_ids:
        tags = db.query(BlogTag).filter(BlogTag.id.in_(post.tag_ids)).all()
        if len(tags) != len(post.tag_ids):
            raise HTTPException(
                status_code=400,
                detail="یک یا چند تگ یافت نشد"
            )
        new_post.tags = tags
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # حذف کش وبلاگ
    invalidate_blog_cache("posts_list")
    
    return new_post

@router.get("/posts", response_model=List[BlogPostOut])
def get_posts(
    category_slug: Optional[str] = None,
    tag_slug: Optional[str] = None,
    search: Optional[str] = None,
    published_only: bool = True,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """دریافت لیست مقالات وبلاگ"""
    # ساخت کلید کش
    cache_key = f"posts_list:{category_slug}:{tag_slug}:{search}:{published_only}:{page}:{per_page}"
    cached_data = get_cached_blog(cache_key)
    
    if cached_data and (published_only or not current_user or not current_user.is_admin):
        return cached_data
    
    # ساخت کوئری پایه
    query = db.query(BlogPost)
    
    # اعمال فیلترها
    if category_slug:
        query = query.join(BlogPost.categories).filter(BlogCategory.slug == category_slug)
    
    if tag_slug:
        query = query.join(BlogPost.tags).filter(BlogTag.slug == tag_slug)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                BlogPost.title.ilike(search_term),
                BlogPost.summary.ilike(search_term),
                BlogPost.content.ilike(search_term)
            )
        )
    
    # فقط پست‌های منتشر شده (برای کاربران غیر ادمین)
    if published_only and (not current_user or not current_user.is_admin):
        query = query.filter(BlogPost.is_published == True)
    
    # بارگذاری داده‌های مرتبط
    query = query.options(
        joinedload(BlogPost.author),
        joinedload(BlogPost.categories),
        joinedload(BlogPost.tags)
    )
    
    # مرتب‌سازی (جدیدترین ابتدا)
    query = query.order_by(desc(BlogPost.published_at) if published_only else desc(BlogPost.created_at))
    
    # اعمال صفحه‌بندی
    total = query.count()
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # ذخیره در کش (فقط برای پست‌های منتشر شده)
    if published_only or not current_user or not current_user.is_admin:
        cache_blog(cache_key, posts, 600)  # کش برای 10 دقیقه
    
    return posts

@router.get("/posts/{slug}", response_model=BlogPostWithComments)
def get_post(
    slug: str = Path(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    background_tasks: BackgroundTasks = None
):
    """دریافت جزئیات یک مقاله"""
    # بررسی کش
    cache_key = f"post_detail:{slug}"
    cached_post = get_cached_blog(cache_key)
    
    if cached_post:
        # افزایش بازدید در پس‌زمینه
        if background_tasks:
            background_tasks.add_task(increment_post_view, slug, db)
        return cached_post
    
    # بارگذاری مقاله با داده‌های مرتبط
    post = db.query(BlogPost).filter(BlogPost.slug == slug).options(
        joinedload(BlogPost.author),
        joinedload(BlogPost.categories),
        joinedload(BlogPost.tags),
        joinedload(BlogPost.comments).joinedload(BlogComment.user)
    ).first()
    
    if not post:
        raise HTTPException(
            status_code=404,
            detail="مقاله مورد نظر یافت نشد"
        )
    
    # بررسی وضعیت انتشار (فقط ادمین می‌تواند مقالات منتشر نشده را ببیند)
    if not post.is_published and (not current_user or not current_user.is_admin):
        raise HTTPException(
            status_code=404,
            detail="مقاله مورد نظر یافت نشد"
        )
    
    # افزایش بازدید در پس‌زمینه
    if background_tasks:
        background_tasks.add_task(increment_post_view, slug, db)
    
    # فیلتر کردن کامنت‌های تأیید نشده برای کاربران غیر ادمین
    if not current_user or not current_user.is_admin:
        post.comments = [comment for comment in post.comments if comment.is_approved]
    
    # ذخیره در کش (فقط برای مقالات منتشر شده)
    if post.is_published:
        cache_blog(cache_key, post, 600)  # کش برای 10 دقیقه
    
    return post

@router.put("/posts/{slug}", response_model=BlogPostOut)
def update_post(
    slug: str,
    post_data: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند پست را ویرایش کند
):
    """به‌روزرسانی یک مقاله"""
    # یافتن مقاله
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=404,
            detail="مقاله مورد نظر یافت نشد"
        )
    
    # بررسی تکراری نبودن slug جدید
    if post_data.slug and post_data.slug != slug:
        existing_post = db.query(BlogPost).filter(BlogPost.slug == post_data.slug).first()
        if existing_post:
            raise HTTPException(
                status_code=400,
                detail="این slug قبلاً استفاده شده است"
            )
    
    # به‌روزرسانی فیلدها
    if post_data.title is not None:
        post.title = post_data.title
    
    if post_data.slug is not None:
        post.slug = post_data.slug
    
    if post_data.summary is not None:
        post.summary = post_data.summary
    
    if post_data.content is not None:
        post.content = post_data.content
    
    if post_data.featured_image is not None:
        post.featured_image = post_data.featured_image
    
    # اگر وضعیت انتشار تغییر کرده باشد
    if post_data.is_published is not None and post.is_published != post_data.is_published:
        post.is_published = post_data.is_published
        if post_data.is_published:
            post.published_at = datetime.now()
    
    # به‌روزرسانی دسته‌بندی‌ها
    if post_data.category_ids is not None:
        categories = db.query(BlogCategory).filter(BlogCategory.id.in_(post_data.category_ids)).all()
        if len(categories) != len(post_data.category_ids):
            raise HTTPException(
                status_code=400,
                detail="یک یا چند دسته‌بندی یافت نشد"
            )
        post.categories = categories
    
    # به‌روزرسانی تگ‌ها
    if post_data.tag_ids is not None:
        tags = db.query(BlogTag).filter(BlogTag.id.in_(post_data.tag_ids)).all()
        if len(tags) != len(post_data.tag_ids):
            raise HTTPException(
                status_code=400,
                detail="یک یا چند تگ یافت نشد"
            )
        post.tags = tags
    
    db.commit()
    db.refresh(post)
    
    # حذف کش
    invalidate_blog_cache(f"post_detail:{slug}")
    if post_data.slug and post_data.slug != slug:
        invalidate_blog_cache(f"post_detail:{post_data.slug}")
    invalidate_blog_cache("posts_list")
    
    return post

@router.delete("/posts/{slug}", status_code=204)
def delete_post(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند پست را حذف کند
):
    """حذف یک مقاله"""
    # یافتن مقاله
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=404,
            detail="مقاله مورد نظر یافت نشد"
        )
    
    # حذف مقاله
    db.delete(post)
    db.commit()
    
    # حذف کش
    invalidate_blog_cache(f"post_detail:{slug}")
    invalidate_blog_cache("posts_list")
    
    return None

# روترهای دسته‌بندی‌ها
@router.post("/categories", response_model=BlogCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category: BlogCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند دسته‌بندی ایجاد کند
):
    """ایجاد دسته‌بندی جدید"""
    # بررسی تکراری نبودن slug
    existing_category = db.query(BlogCategory).filter(BlogCategory.slug == category.slug).first()
    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="این slug قبلاً استفاده شده است"
        )
    
    # ایجاد دسته‌بندی جدید
    new_category = BlogCategory(
        name=category.name,
        slug=category.slug,
        description=category.description
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    # حذف کش
    invalidate_blog_cache("categories_list")
    
    return new_category

@router.get("/categories", response_model=List[BlogCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    """دریافت لیست دسته‌بندی‌ها"""
    # بررسی کش
    cache_key = "categories_list"
    cached_categories = get_cached_blog(cache_key)
    
    if cached_categories:
        return cached_categories
    
    # دریافت دسته‌بندی‌ها
    categories = db.query(BlogCategory).all()
    
    # ذخیره در کش
    cache_blog(cache_key, categories, 3600)  # کش برای 1 ساعت
    
    return categories

@router.put("/categories/{slug}", response_model=BlogCategoryOut)
def update_category(
    slug: str,
    category_data: BlogCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند دسته‌بندی را ویرایش کند
):
    """به‌روزرسانی یک دسته‌بندی"""
    # یافتن دسته‌بندی
    category = db.query(BlogCategory).filter(BlogCategory.slug == slug).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail="دسته‌بندی مورد نظر یافت نشد"
        )
    
    # بررسی تکراری نبودن slug جدید
    if category_data.slug and category_data.slug != slug:
        existing_category = db.query(BlogCategory).filter(BlogCategory.slug == category_data.slug).first()
        if existing_category:
            raise HTTPException(
                status_code=400,
                detail="این slug قبلاً استفاده شده است"
            )
    
    # به‌روزرسانی فیلدها
    if category_data.name is not None:
        category.name = category_data.name
    
    if category_data.slug is not None:
        category.slug = category_data.slug
    
    if category_data.description is not None:
        category.description = category_data.description
    
    db.commit()
    db.refresh(category)
    
    # حذف کش
    invalidate_blog_cache("categories_list")
    
    return category

@router.delete("/categories/{slug}", status_code=204)
def delete_category(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند دسته‌بندی را حذف کند
):
    """حذف یک دسته‌بندی"""
    # یافتن دسته‌بندی
    category = db.query(BlogCategory).filter(BlogCategory.slug == slug).first()
    if not category:
        raise HTTPException(
            status_code=404,
            detail="دسته‌بندی مورد نظر یافت نشد"
        )
    
    # بررسی استفاده از دسته‌بندی در مقالات
    if category.posts:
        raise HTTPException(
            status_code=400,
            detail="این دسته‌بندی در مقالات استفاده شده است و نمی‌توان آن را حذف کرد"
        )
    
    # حذف دسته‌بندی
    db.delete(category)
    db.commit()
    
    # حذف کش
    invalidate_blog_cache("categories_list")
    
    return None

# روترهای تگ‌ها
@router.post("/tags", response_model=BlogTagOut, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag: BlogTagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # فقط ادمین می‌تواند تگ ایجاد کند
):
    """ایجاد تگ جدید"""
    # بررسی تکراری نبودن slug
    existing_tag = db.query(BlogTag).filter(BlogTag.slug == tag.slug).first()
    if existing_tag:
        raise HTTPException(
            status_code=400,
            detail="این slug قبلاً استفاده شده است"
        )
    
    # ایجاد تگ جدید
    new_tag = BlogTag(
        name=tag.name,
        slug=tag.slug
    )
    
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    
    # حذف کش
    invalidate_blog_cache("tags_list")
    
    return new_tag

@router.get("/tags", response_model=List[BlogTagOut])
def get_tags(db: Session = Depends(get_db)):
    """دریافت لیست تگ‌ها"""
    # بررسی کش
    cache_key = "tags_list"
    cached_tags = get_cached_blog(cache_key)
    
    if cached_tags:
        return cached_tags
    
    # دریافت تگ‌ها
    tags = db.query(BlogTag).all()
    
    # ذخیره در کش
    cache_blog(cache_key, tags, 3600)  # کش برای 1 ساعت
    
    return tags

# روترهای نظرات
@router.post("/posts/{slug}/comments", response_model=BlogCommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    slug: str,
    comment: BlogCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ثبت نظر برای یک مقاله"""
    # یافتن مقاله
    post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=404,
            detail="مقاله مورد نظر یافت نشد"
        )
    
    # بررسی وضعیت انتشار مقاله
    if not post.is_published and not current_user.is_admin:
        raise HTTPException(
            status_code=404,
            detail="مقاله مورد نظر یافت نشد"
        )
    
    # بررسی وجود والد (در صورت پاسخ بودن)
    parent_comment = None
    if comment.parent_id:
        parent_comment = db.query(BlogComment).filter(
            BlogComment.id == comment.parent_id,
            BlogComment.post_id == post.id
        ).first()
        
        if not parent_comment:
            raise HTTPException(
                status_code=404,
                detail="نظر والد یافت نشد"
            )
    
    # ایجاد نظر جدید
    new_comment = BlogComment(
        content=comment.content,
        post_id=post.id,
        user_id=current_user.id,
        parent_id=comment.parent_id,
        is_approved=current_user.is_admin  # نظرات ادمین به صورت خودکار تأیید می‌شوند
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    # حذف کش
    invalidate_blog_cache(f"post_detail:{slug}")
    
    return new_comment

@router.put("/comments/{comment_id}", response_model=BlogCommentOut)
def update_comment(
    comment_id: int,
    comment_data: BlogCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """به‌روزرسانی یک نظر"""
    # یافتن نظر
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=404,
            detail="نظر مورد نظر یافت نشد"
        )
    
    # بررسی دسترسی (فقط نویسنده نظر یا ادمین می‌تواند آن را ویرایش کند)
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="شما اجازه ویرایش این نظر را ندارید"
        )
    
    # به‌روزرسانی فیلدها
    if comment_data.content is not None and (comment.user_id == current_user.id or current_user.is_admin):
        comment.content = comment_data.content
    
    # فقط ادمین می‌تواند وضعیت تأیید را تغییر دهد
    if comment_data.is_approved is not None and current_user.is_admin:
        comment.is_approved = comment_data.is_approved
    
    db.commit()
    db.refresh(comment)
    
    # حذف کش مقاله مربوطه
    post = db.query(BlogPost).filter(BlogPost.id == comment.post_id).first()
    if post:
        invalidate_blog_cache(f"post_detail:{post.slug}")
    
    return comment

@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """حذف یک نظر"""
    # یافتن نظر
    comment = db.query(BlogComment).filter(BlogComment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=404,
            detail="نظر مورد نظر یافت نشد"
        )
    
    # بررسی دسترسی (فقط نویسنده نظر یا ادمین می‌تواند آن را حذف کند)
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="شما اجازه حذف این نظر را ندارید"
        )
    
    # یافتن مقاله مربوطه برای حذف کش
    post = db.query(BlogPost).filter(BlogPost.id == comment.post_id).first()
    
    # حذف نظر
    db.delete(comment)
    db.commit()
    
    # حذف کش مقاله مربوطه
    if post:
        invalidate_blog_cache(f"post_detail:{post.slug}")
    
    return None

# تابع کمکی برای افزایش تعداد بازدید
def increment_post_view(slug: str, db: Session):
    """افزایش تعداد بازدید یک مقاله"""
    try:
        post = db.query(BlogPost).filter(BlogPost.slug == slug).with_for_update().first()
        if post:
            post.view_count += 1
            db.commit()
    except Exception as e:
        db.rollback()
        logging.error(f"خطا در افزایش تعداد بازدید: {str(e)}")