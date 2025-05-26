# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger("hooshmetr.database")

# تنظیمات اتصال به دیتابیس
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # بررسی اتصال قبل از استفاده
        pool_recycle=3600,   # بازیافت اتصال‌ها هر 1 ساعت
        echo=settings.DEBUG   # نمایش کوئری‌ها در حالت دیباگ
    )
    logger.info("اتصال به دیتابیس با موفقیت برقرار شد")
except Exception as e:
    logger.error(f"خطا در اتصال به دیتابیس: {str(e)}")
    raise

# ایجاد کلاس SessionLocal برای مدیریت نشست‌های دیتابیس
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# کلاس پایه برای تمام مدل‌های SQLAlchemy
Base = declarative_base()

# تابع وابستگی برای دریافت نشست دیتابیس
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"خطا در استفاده از نشست دیتابیس: {str(e)}")
        raise
    finally:
        db.close()

# تابع برای تست اتصال به دیتابیس
def test_db_connection():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return True
    except Exception as e:
        logger.error(f"تست اتصال به دیتابیس ناموفق بود: {str(e)}")
        return False