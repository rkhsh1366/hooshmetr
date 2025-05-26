# app/utils/cache.py
import json
import logging
from app.config import settings

# متغیرهای کش محلی
local_cache = {}

def get_redis_client():
    """دریافت کلاینت Redis در صورت فعال بودن"""
    if settings.USE_REDIS_CACHE:
        try:
            import redis
            return redis.Redis.from_url(settings.REDIS_URL)
        except Exception as e:
            logging.warning(f"خطا در اتصال به Redis: {str(e)}")
            return None
    return None

def get_cached_summary(tool_id: int):
    """دریافت خلاصه نظرات از کش"""
    # ابتدا از کش محلی بررسی کنید
    cache_key = f"summary:{tool_id}"
    if cache_key in local_cache:
        return local_cache[cache_key]
    
    # سپس از Redis بررسی کنید (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                result = json.loads(cached_data)
                # ذخیره در کش محلی
                local_cache[cache_key] = result
                return result
        except Exception as e:
            logging.warning(f"خطا در دریافت از کش Redis: {str(e)}")
    
    return None

def cache_summary(tool_id: int, summary_data, expire_seconds=3600):
    """ذخیره خلاصه نظرات در کش"""
    cache_key = f"summary:{tool_id}"
    
    # ذخیره در کش محلی
    local_cache[cache_key] = summary_data
    
    # ذخیره در Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.setex(cache_key, expire_seconds, json.dumps(summary_data))
        except Exception as e:
            logging.warning(f"خطا در ذخیره‌سازی کش Redis: {str(e)}")

def invalidate_summary_cache(tool_id: int):
    """حذف خلاصه نظرات از کش"""
    cache_key = f"summary:{tool_id}"
    
    # حذف از کش محلی
    if cache_key in local_cache:
        del local_cache[cache_key]
    
    # حذف از Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.delete(cache_key)
        except Exception as e:
            logging.warning(f"خطا در حذف کش Redis: {str(e)}")

def get_cached_tool(key):
    """دریافت اطلاعات ابزار از کش"""
    # ابتدا از کش محلی بررسی کنید
    if key in local_cache:
        return local_cache[key]
    
    # سپس از Redis بررسی کنید (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_data = redis_client.get(key)
            if cached_data:
                result = json.loads(cached_data)
                # ذخیره در کش محلی
                local_cache[key] = result
                return result
        except Exception as e:
            logging.warning(f"خطا در دریافت از کش Redis: {str(e)}")
    
    return None

def cache_tool(key, tool_data, expire_seconds=600):
    """ذخیره اطلاعات ابزار در کش"""
    # ذخیره در کش محلی
    local_cache[key] = tool_data
    
    # ذخیره در Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.setex(key, expire_seconds, json.dumps(tool_data))
        except Exception as e:
            logging.warning(f"خطا در ذخیره‌سازی کش Redis: {str(e)}")

def invalidate_tool_cache(key=None):
    """حذف اطلاعات ابزار از کش"""
    if key:
        # حذف کلید مشخص
        if key in local_cache:
            del local_cache[key]
        
        # حذف از Redis (اگر فعال است)
        redis_client = get_redis_client()
        if redis_client:
            try:
                redis_client.delete(key)
            except Exception as e:
                logging.warning(f"خطا در حذف کش Redis: {str(e)}")
    else:
        # حذف تمام کلیدهای ابزار
        keys_to_delete = [k for k in local_cache.keys() if k.startswith("tool_") or k.startswith("tools_")]
        for k in keys_to_delete:
            del local_cache[k]
        
        # حذف از Redis (اگر فعال است)
        redis_client = get_redis_client()
        if redis_client:
            try:
                keys = redis_client.keys("tool_*") + redis_client.keys("tools_*")
                if keys:
                    redis_client.delete(*keys)
            except Exception as e:
                logging.warning(f"خطا در حذف کش Redis: {str(e)}")

def get_cached_comparison(key):
    """دریافت نتایج مقایسه از کش"""
    # ابتدا از کش محلی بررسی کنید
    if key in local_cache:
        return local_cache[key]
    
    # سپس از Redis بررسی کنید (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_data = redis_client.get(key)
            if cached_data:
                result = json.loads(cached_data)
                # ذخیره در کش محلی
                local_cache[key] = result
                return result
        except Exception as e:
            logging.warning(f"خطا در دریافت از کش Redis: {str(e)}")
    
    return None

def cache_comparison(key, comparison_data, expire_seconds=1800):
    """ذخیره نتایج مقایسه در کش"""
    # ذخیره در کش محلی
    local_cache[key] = comparison_data
    
    # ذخیره در Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.setex(key, expire_seconds, json.dumps(comparison_data))
        except Exception as e:
            logging.warning(f"خطا در ذخیره‌سازی کش Redis: {str(e)}")

def get_cached_search(key):
    """دریافت نتایج جستجو از کش"""
    # ابتدا از کش محلی بررسی کنید
    if key in local_cache:
        return local_cache[key]
    
    # سپس از Redis بررسی کنید (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_data = redis_client.get(key)
            if cached_data:
                result = json.loads(cached_data)
                # ذخیره در کش محلی
                local_cache[key] = result
                return result
        except Exception as e:
            logging.warning(f"خطا در دریافت از کش Redis: {str(e)}")
    
    return None

def cache_search(key, search_data, expire_seconds=300):
    """ذخیره نتایج جستجو در کش"""
    # ذخیره در کش محلی
    local_cache[key] = search_data
    
    # ذخیره در Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.setex(key, expire_seconds, json.dumps(search_data))
        except Exception as e:
            logging.warning(f"خطا در ذخیره‌سازی کش Redis: {str(e)}")

def get_cached_blog(key):
    """دریافت داده‌های وبلاگ از کش"""
    # ابتدا از کش محلی بررسی کنید
    if key in local_cache:
        return local_cache[key]
    
    # سپس از Redis بررسی کنید (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_data = redis_client.get(key)
            if cached_data:
                result = json.loads(cached_data)
                # ذخیره در کش محلی
                local_cache[key] = result
                return result
        except Exception as e:
            logging.warning(f"خطا در دریافت از کش Redis: {str(e)}")
    
    return None

def cache_blog(key, blog_data, expire_seconds=600):
    """ذخیره داده‌های وبلاگ در کش"""
    # ذخیره در کش محلی
    local_cache[key] = blog_data
    
    # ذخیره در Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.setex(key, expire_seconds, json.dumps(blog_data))
        except Exception as e:
            logging.warning(f"خطا در ذخیره‌سازی کش Redis: {str(e)}")

def invalidate_blog_cache(key=None):
    """حذف داده‌های وبلاگ از کش"""
    if key:
        # حذف کلید مشخص
        if key in local_cache:
            del local_cache[key]
        
        # حذف از Redis (اگر فعال است)
        redis_client = get_redis_client()
        if redis_client:
            try:
                redis_client.delete(key)
            except Exception as e:
                logging.warning(f"خطا در حذف کش Redis: {str(e)}")
    else:
        # حذف تمام کلیدهای وبلاگ
        keys_to_delete = [k for k in local_cache.keys() if k.startswith("post_") or k.startswith("posts_") or k.startswith("categories_") or k.startswith("tags_")]
        for k in keys_to_delete:
            del local_cache[k]
        
        # حذف از Redis (اگر فعال است)
        redis_client = get_redis_client()
        if redis_client:
            try:
                keys = redis_client.keys("post_*") + redis_client.keys("posts_*") + redis_client.keys("categories_*") + redis_client.keys("tags_*")
                if keys:
                    redis_client.delete(*keys)
            except Exception as e:
                logging.warning(f"خطا در حذف کش Redis: {str(e)}")

def clear_cache():
    """پاک کردن کل کش"""
    global local_cache
    local_cache = {}
    
    # پاک کردن Redis (اگر فعال است)
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.flushdb()
        except Exception as e:
            logging.warning(f"خطا در پاک کردن کش Redis: {str(e)}")