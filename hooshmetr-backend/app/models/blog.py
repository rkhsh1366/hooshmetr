# app/models/blog.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

# جداول ارتباطی
blog_post_categories = Table(
    "blog_post_categories",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey("blog_categories.id", ondelete="CASCADE"), primary_key=True)
)

blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("blog_tags.id", ondelete="CASCADE"), primary_key=True)
)

class BlogPost(Base):
    """
    مدل پست وبلاگ
    این مدل برای ذخیره پست‌های وبلاگ استفاده می‌شود
    """
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    summary = Column(String(500))
    content = Column(Text, nullable=False)
    featured_image = Column(String(255))
    is_published = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # روابط
    author = relationship("User", back_populates="blog_posts")
    categories = relationship("BlogCategory", secondary=blog_post_categories, back_populates="posts")
    tags = relationship("BlogTag", secondary=blog_post_tags, back_populates="posts")
    comments = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")
    
    def __repr__(self):
        """نمایش رشته‌ای پست وبلاگ"""
        status = "منتشر شده" if self.is_published else "پیش‌نویس"
        return f"<BlogPost {self.id}: {self.title}, {status}>"
    
    def increment_view(self):
        """افزایش تعداد بازدید"""
        self.view_count += 1
    
    @property
    def approved_comments_count(self):
        """تعداد نظرات تأیید شده"""
        return sum(1 for comment in self.comments if comment.is_approved)

class BlogCategory(Base):
    """
    مدل دسته‌بندی وبلاگ
    این مدل برای دسته‌بندی پست‌های وبلاگ استفاده می‌شود
    """
    __tablename__ = "blog_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(String(500))
    
    # روابط
    posts = relationship("BlogPost", secondary=blog_post_categories, back_populates="categories")
    
    def __repr__(self):
        """نمایش رشته‌ای دسته‌بندی وبلاگ"""
        return f"<BlogCategory {self.id}: {self.name}>"

class BlogTag(Base):
    """
    مدل تگ وبلاگ
    این مدل برای تگ‌های پست‌های وبلاگ استفاده می‌شود
    """
    __tablename__ = "blog_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    
    # روابط
    posts = relationship("BlogPost", secondary=blog_post_tags, back_populates="tags")
    
    def __repr__(self):
        """نمایش رشته‌ای تگ وبلاگ"""
        return f"<BlogTag {self.id}: {self.name}>"

class BlogComment(Base):
    """
    مدل نظر وبلاگ
    این مدل برای ذخیره نظرات کاربران روی پست‌های وبلاگ استفاده می‌شود
    """
    __tablename__ = "blog_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    post_id = Column(Integer, ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_id = Column(Integer, ForeignKey("blog_comments.id", ondelete="CASCADE"), nullable=True)
    
    # روابط
    post = relationship("BlogPost", back_populates="comments")
    user = relationship("User", back_populates="blog_comments")
    parent = relationship("BlogComment", back_populates="replies", remote_side=[id])
    replies = relationship("BlogComment", back_populates="parent")
    
    def __repr__(self):
        """نمایش رشته‌ای نظر وبلاگ"""
        status = "تأیید شده" if self.is_approved else "در انتظار تأیید"
        return f"<BlogComment {self.id}: post_id={self.post_id}, {status}>"