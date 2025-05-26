# app/schemas/tool.py
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.schemas.tool_review_summary import ToolReviewSummaryOut

class TagOut(BaseModel):
    """اسکیمای خروجی برای تگ"""
    id: int
    name: str
    slug: str

    model_config = {
        "from_attributes": True
    }

class TechnologyOut(BaseModel):
    """اسکیمای خروجی برای تکنولوژی"""
    id: int
    name: str
    description: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class CategoryOut(BaseModel):
    """اسکیمای خروجی برای دسته‌بندی"""
    id: int
    name: str
    slug: str
    icon: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class ToolOut(BaseModel):
    """اسکیمای خروجی برای ابزار"""
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    highlight_features: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None
    is_free: bool = False
    is_sanctioned: bool = False
    supports_farsi: bool = False
    pricing_info: Optional[str] = None
    license_type: Optional[str] = None
    api_available: bool = False
    average_rating: float = 0.0
    review_count: int = 0
    view_count: int = 0
    comparison_count: int = 0
    created_at: datetime
    updated_at: datetime

    categories: List[CategoryOut]
    technologies: List[TechnologyOut]
    tags: List[TagOut]
    review_summary: Optional[ToolReviewSummaryOut] = None

    model_config = {
        "from_attributes": True
    }

class ToolCreate(BaseModel):
    """اسکیمای ورودی برای ایجاد ابزار"""
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    description: Optional[str] = None
    highlight_features: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None
    is_free: bool = False
    is_sanctioned: bool = False
    supports_farsi: bool = False
    pricing_info: Optional[str] = None
    license_type: Optional[str] = None
    api_available: bool = False
    category_ids: List[int] = []
    technology_ids: List[int] = []
    tag_ids: List[int] = []

class SortOption(str, Enum):
    """گزینه‌های مرتب‌سازی"""
    NEWEST = "newest"
    OLDEST = "oldest"
    RATING_HIGH = "rating-high"
    RATING_LOW = "rating-low"
    VIEWS = "views"
    REVIEWS = "reviews"
    COMPARISONS = "comparisons"

class ToolFilterParams(BaseModel):
    """پارامترهای فیلتر ابزارها"""
    search: Optional[str] = None
    category_ids: Optional[List[int]] = None
    technology_ids: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None
    is_free: Optional[bool] = None
    supports_farsi: Optional[bool] = None
    is_sanctioned: Optional[bool] = None
    api_available: Optional[bool] = None
    license_type: Optional[str] = None
    sort_by: Optional[SortOption] = SortOption.NEWEST
    page: int = 1
    per_page: int = 10

class ToolUpdate(BaseModel):
    """اسکیمای ورودی برای به‌روزرسانی ابزار"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    description: Optional[str] = None
    highlight_features: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None
    is_free: Optional[bool] = None
    is_sanctioned: Optional[bool] = None
    supports_farsi: Optional[bool] = None
    pricing_info: Optional[str] = None
    license_type: Optional[str] = None
    api_available: Optional[bool] = None
    category_ids: Optional[List[int]] = None
    technology_ids: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None

    model_config = {
        "from_attributes": True
    }