# app/utils/slugify.py
import re
import unidecode

def slugify(text):
    """تبدیل متن به slug مناسب برای URL"""
    # حذف کاراکترهای غیر الفبایی و تبدیل به حروف کوچک
    text = unidecode.unidecode(text).lower()
    # جایگزینی فاصله‌ها و کاراکترهای غیرمجاز با خط تیره
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # حذف خط تیره‌های اضافی از ابتدا و انتها
    text = text.strip('-')
    # کوتاه کردن slug در صورت نیاز
    return text[:100]