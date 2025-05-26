# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import time
import os
import logging
from fastapi.middleware.gzip import GZipMiddleware
from app.database import Base, engine
from app.config import settings

# تنظیم لاگینگ
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("hooshmetr")

# ایجاد جداول در صورت نیاز (فقط در محیط توسعه)
if settings.ENVIRONMENT == "development":
    Base.metadata.create_all(bind=engine)
    logger.info("جداول دیتابیس ایجاد شدند")

app = FastAPI(
    title="هوش‌متر API",
    description="API برای سایت مقایسه ابزارهای هوش مصنوعی",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,  # غیرفعال کردن داکس در محیط تولید
    redoc_url="/api/redoc" if settings.DEBUG else None
)

# فعال‌سازی فشرده‌سازی GZIP برای کاهش حجم داده‌های منتقل‌شده
app.add_middleware(GZipMiddleware, minimum_size=1000)

# تنظیمات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# میدل‌ور برای کش‌کردن پاسخ‌ها
@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    
    # افزودن هدرهای کش برای درخواست‌های GET
    if request.method == "GET" and not any(path in str(request.url) for path in ["/api/auth/", "/api/profile/"]):
        response.headers["Cache-Control"] = "public, max-age=60"  # کش برای 1 دقیقه
    
    return response

# میدل‌ور برای ثبت زمان درخواست‌ها
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # ثبت زمان پاسخگویی برای درخواست‌های طولانی
    if process_time > 1.0:  # بیش از 1 ثانیه
        logger.warning(f"درخواست کند: {request.url} - {process_time:.2f}s")
        
    return response

# میدل‌ور برای مدیریت خطاها
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # ثبت خطا در لاگ
    logger.error(f"خطا در پردازش درخواست: {str(exc)}", exc_info=True)
    
    # در محیط تولید، خطاهای جزئی را نشان ندهید
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)}
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "خطای سرور رخ داده است. لطفاً بعداً تلاش کنید."}
        )

# وارد کردن روترها - بعد از تعریف app
from app.routers import (
    auth, profile, image_upload, comparison, search, users, tools, 
    tool_reviews, tool_review_summary, review_reaction
)

# تلاش برای وارد کردن روتر وبلاگ
try:
    from app.routers import blog
    has_blog_router = True
except ImportError:
    has_blog_router = False


# افزودن روترها با تگ‌های منحصر به فرد
app.include_router(auth.router, tags=["Authentication"])
app.include_router(users.router, tags=["Users"])
app.include_router(profile.router, tags=["Profile"])
app.include_router(tools.router, tags=["Tools"])
app.include_router(tool_reviews.router, tags=["Tool-reviews"])
app.include_router(review_reaction.router, tags=["Review-reactions"])
app.include_router(tool_review_summary.router, tags=["Tool-review-summaries"])
app.include_router(image_upload.router, tags=["Uploads"])
app.include_router(comparison.router, tags=["Comparisons"])
app.include_router(search.router, tags=["Search"])

# اضافه کردن روتر وبلاگ در صورت وجود
if has_blog_router:
    app.include_router(blog.router, tags=["Blog"])
    logger.info("روتر وبلاگ با موفقیت اضافه شد")
else:
    logger.info("روتر وبلاگ یافت نشد")
    

# پوشه فایل‌های استاتیک
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "avatars"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "tools"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "blog"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "به API هوش‌متر خوش آمدید!"}

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "ok", 
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

@app.on_event("startup")
def startup_event():
    """رویداد راه‌اندازی برنامه"""
    logger.info(f"سرویس هوش‌متر در حال اجرا در محیط {settings.ENVIRONMENT}")
    
    # فراخوانی تابع افزودن داده‌های اولیه
    if settings.ENVIRONMENT == "development":
        seed_data()

@app.on_event("shutdown")
def shutdown_event():
    """رویداد خاموش شدن برنامه"""
    logger.info("سرویس هوش‌متر در حال خاموش شدن")

def seed_data():
    """افزودن داده‌های اولیه به پایگاه داده"""
    from app.database import SessionLocal
    from app.models import Category, Technology, Tag
    
    db = SessionLocal()
    
    try:
        # افزودن دسته‌بندی‌ها
        if db.query(Category).count() == 0:
            categories = [
                Category(name="تولید متن", slug="text-generation"),
                Category(name="ساخت تصویر", slug="image-generation"),
                Category(name="تحلیل داده", slug="data-analysis"),
                Category(name="چت‌بات", slug="chatbot"),
                Category(name="برنامه‌نویسی", slug="programming"),
                Category(name="ترجمه", slug="translation"),
                Category(name="تولید صدا", slug="audio-generation"),
                Category(name="تولید ویدیو", slug="video-generation"),
                Category(name="تشخیص تصویر", slug="image-recognition"),
            ]
            db.add_all(categories)
        
        # افزودن تکنولوژی‌ها
        if db.query(Technology).count() == 0:
            technologies = [
                Technology(name="GPT-4", description="مدل پیشرفته OpenAI"),
                Technology(name="GPT-3.5", description="مدل متوسط OpenAI"),
                Technology(name="DALL-E", description="مدل تولید تصویر OpenAI"),
                Technology(name="Stable Diffusion", description="مدل تولید تصویر متن‌باز"),
                Technology(name="Midjourney", description="ابزار تولید تصویر هنری"),
                Technology(name="Bert", description="مدل زبانی Google"),
                Technology(name="LLaMA", description="مدل زبانی Meta"),
                Technology(name="Whisper", description="مدل تشخیص گفتار OpenAI"),
            ]
            db.add_all(technologies)
        
        # افزودن تگ‌ها
        if db.query(Tag).count() == 0:
            tags = [
                Tag(name="رایگان", slug="free"),
                Tag(name="پولی", slug="paid"),
                Tag(name="API", slug="api"),
                Tag(name="طراحی", slug="design"),
                Tag(name="متن به تصویر", slug="text-to-image"),
                Tag(name="چت‌بات", slug="chatbot"),
                Tag(name="کدنویسی", slug="coding"),
                Tag(name="تحلیل داده", slug="data-analysis"),
                Tag(name="ترجمه", slug="translation"),
                Tag(name="خلاصه‌سازی", slug="summarization"),
                Tag(name="ویرایش تصویر", slug="image-editing"),
            ]
            db.add_all(tags)
        
        db.commit()
        logger.info("داده‌های اولیه با موفقیت اضافه شدند")
        
    except Exception as e:
        db.rollback()
        logger.error(f"خطا در افزودن داده‌های اولیه: {str(e)}")
    finally:
        db.close()