# app/models/__init__.py
"""
ماژول مدل‌های پایگاه داده برای پروژه هوش‌متر
این ماژول تمام مدل‌های مورد نیاز برای پروژه را وارد می‌کند
"""

# وارد کردن مدل‌های پایه
from app.models.base import Base

# وارد کردن مدل‌های اصلی
from app.models.user import User
from app.models.verification_code import VerificationCode

# وارد کردن مدل‌های مربوط به ابزارها
from app.models.category import Category
from app.models.technology import Technology
from app.models.tag import Tag
from app.models.tool import Tool

# وارد کردن مدل‌های مربوط به نظرات
from app.models.tool_review import ToolReview
from app.models.review_reaction import ReviewReaction
from app.models.tool_review_summary import ToolReviewSummary

# وارد کردن مدل‌های مربوط به مقایسه
from app.models.comparison import Comparison
from app.models.comparison_tool import ComparisonTool

# وارد کردن مدل‌های مربوط به وبلاگ (اگر وجود دارند)
try:
    from app.models.blog import BlogPost, BlogCategory, BlogTag, BlogComment
except ImportError:
    pass

# تعریف آرایه‌ای از تمام مدل‌ها برای استفاده در مهاجرت‌ها
__all__ = [
    "Base", "User", "VerificationCode", 
    "Category", "Technology", "Tag", "Tool",
    "ToolReview", "ReviewReaction", "ToolReviewSummary",
    "Comparison", "ComparisonTool"
]