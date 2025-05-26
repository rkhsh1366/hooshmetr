# app/schemas/blog.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BlogCategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=150, pattern="^[a-z0-9-]+$")
    description: Optional[str] = None

class BlogCategoryCreate(BlogCategoryBase):
    pass

class BlogCategoryUpdate(BlogCategoryBase):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=150, pattern="^[a-z0-9-]+$")

class BlogCategoryOut(BlogCategoryBase):
    id: int
    
    model_config = {
        "from_attributes": True
    }

class BlogTagBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=150, pattern="^[a-z0-9-]+$")

class BlogTagCreate(BlogTagBase):
    pass

class BlogTagUpdate(BlogTagBase):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=150, pattern="^[a-z0-9-]+$")

class BlogTagOut(BlogTagBase):
    id: int
    
    model_config = {
        "from_attributes": True
    }

class BlogCommentBase(BaseModel):
    content: str = Field(..., min_length=5)
    parent_id: Optional[int] = None

class BlogCommentCreate(BlogCommentBase):
    pass

class BlogCommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=5)
    is_approved: Optional[bool] = None

class UserMinimal(BaseModel):
    id: int
    display_name: str
    
    model_config = {
        "from_attributes": True
    }

class BlogCommentOut(BlogCommentBase):
    id: int
    is_approved: bool
    created_at: datetime
    user: UserMinimal
    
    model_config = {
        "from_attributes": True
    }

class BlogPostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    slug: str = Field(..., min_length=5, max_length=250, pattern="^[a-z0-9-]+$")
    summary: Optional[str] = Field(None, max_length=500)
    content: str = Field(..., min_length=100)
    featured_image: Optional[str] = None
    is_published: bool = False

class BlogPostCreate(BlogPostBase):
    category_ids: List[int] = []
    tag_ids: List[int] = []

class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    slug: Optional[str] = Field(None, min_length=5, max_length=250, pattern="^[a-z0-9-]+$")
    summary: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = Field(None, min_length=100)
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None
    category_ids: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None

class BlogPostOut(BlogPostBase):
    id: int
    view_count: int
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    author: UserMinimal
    categories: List[BlogCategoryOut]
    tags: List[BlogTagOut]
    
    model_config = {
        "from_attributes": True
    }

class BlogPostWithComments(BlogPostOut):
    comments: List[BlogCommentOut]