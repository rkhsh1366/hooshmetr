# app/models/tool.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, Table, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

# جداول ارتباطی برای روابط many-to-many
# جداول ارتباطی برای روابط many-to-many
tool_category = Table(
    "tool_category",
    Base.metadata,
    Column("tool_id", Integer, ForeignKey("tools.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)
)

tool_technology = Table(
    "tool_technology",
    Base.metadata,
    Column("tool_id", Integer, ForeignKey("tools.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", Integer, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True)
)

tool_tag = Table(
    "tool_tag",
    Base.metadata,
    Column("tool_id", Integer, ForeignKey("tools.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class Tool(Base):
    """
    مدل ابزار هوش مصنوعی
    این مدل برای ذخیره اطلاعات ابزارهای هوش مصنوعی استفاده می‌شود
    """
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    highlight_features = Column(Text)
    website = Column(String(255))
    image_url = Column(String(255))
    is_free = Column(Boolean, default=False)
    is_sanctioned = Column(Boolean, default=False)
    supports_farsi = Column(Boolean, default=False)
    pricing_info = Column(Text)
    license_type = Column(String(100))
    api_available = Column(Boolean, default=False)
    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    comparison_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # روابط
    categories = relationship("Category", secondary=tool_category, backref="tools")
    technologies = relationship("Technology", secondary=tool_technology, backref="tools")
    tags = relationship("Tag", secondary=tool_tag, backref="tools")
    reviews = relationship("ToolReview", back_populates="tool", cascade="all, delete-orphan")
    review_summary = relationship("ToolReviewSummary", back_populates="tool", uselist=False, cascade="all, delete-orphan")
    comparison_tools = relationship("ComparisonTool", back_populates="tool", cascade="all, delete-orphan")
    
    def __repr__(self):
        """نمایش رشته‌ای ابزار"""
        return f"<Tool {self.id}: {self.name}>"
    
    def update_stats(self):
        """به‌روزرسانی آمار ابزار (میانگین امتیاز و تعداد نظرات)"""
        if self.reviews:
            self.review_count = len(self.reviews)
            self.average_rating = sum(review.rating for review in self.reviews) / self.review_count
        else:
            self.review_count = 0
            self.average_rating = 0.0
    
    def increment_view(self):
        """افزایش تعداد بازدید"""
        self.view_count += 1
    
    def increment_comparison(self):
        """افزایش تعداد استفاده در مقایسه‌ها"""
        self.comparison_count += 1