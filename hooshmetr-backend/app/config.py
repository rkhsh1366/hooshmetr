# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional, Union
import os
from dotenv import load_dotenv
from pydantic import field_validator

# بارگذاری متغیرهای محیطی از فایل .env
load_dotenv()

class Settings(BaseSettings):
    # تنظیمات عمومی
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # تنظیمات دیتابیس PostgreSQL
    DATABASE_URL: str = "postgresql://hooshmetr_user:1Q%40w3e4r@localhost:5432/hooshmetr_db"
    
    # تنظیمات CORS
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "https://hooshmetr.com"]
    
    # تنظیمات آپلود فایل
    UPLOAD_DIR: str = "static/uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    # تنظیمات Redis (برای کش)
    USE_REDIS_CACHE: bool = False
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    
    # تنظیمات سرویس پیامک
    TSMS_USERNAME: str = "khoshnood"
    TSMS_PASSWORD: str = "9556721ee"
    TSMS_SENDER_PRIMARY: str = "3000112711"
    TSMS_SENDER_FALLBACK: str = "3000722725"
    
    # تنظیمات سئو
    SITE_NAME: str = "هوش‌متر"
    SITE_DESCRIPTION: str = "مقایسه و بررسی ابزارهای هوش مصنوعی"
    SITE_URL: str = "https://hooshmetr.com"
    
    # تنظیمات پیشرفته
    PAGINATION_PAGE_SIZE: int = 10
    SEARCH_RESULT_LIMIT: int = 20
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                # اگر به صورت رشته JSON باشد
                import json
                try:
                    return json.loads(v)
                except:
                    pass
            # اگر به صورت رشته جدا شده با کاما باشد
            return [origin.strip() for origin in v.split(",")]
        return v
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

# ایجاد نمونه تنظیمات
settings = Settings()