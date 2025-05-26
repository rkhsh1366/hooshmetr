# app/schemas/search.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class SearchType(str, Enum):
    """نوع جستجو"""
    TOOL = "tool"
    BLOG = "blog"
    ALL = "all"

class SearchResult(BaseModel):
    """مدل نتیجه جستجو"""
    id: int
    type: str  # tool, blog, etc.
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    website: Optional[str] = None
    average_rating: float = 0.0
    review_count: int = 0
    view_count: int = 0
    categories: List[Dict[str, Any]] = []
    tags: List[Dict[str, Any]] = []
    highlight: Optional[Dict[str, List[str]]] = None  # بخش‌های برجسته شده در نتایج جستجو

class SearchResponse(BaseModel):
    """مدل پاسخ جستجو"""
    results: List[SearchResult]
    total: int
    page: int
    per_page: int
    pages: int
    search_type: SearchType
    query: str
    filters: Dict[str, Any] = {}