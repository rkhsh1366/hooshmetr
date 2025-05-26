# app/models/comparison_tool.py
from sqlalchemy import Column, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class ComparisonTool(Base):
    """
    مدل ابزار در مقایسه
    این مدل برای ذخیره ابزارهای موجود در یک مقایسه استفاده می‌شود
    """
    __tablename__ = "comparison_tools"
    
    id = Column(Integer, primary_key=True, index=True)
    comparison_id = Column(Integer, ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id", ondelete="CASCADE"), nullable=False)
    custom_data = Column(JSON)  # داده‌های سفارشی برای هر ابزار در مقایسه
    
    # روابط
    comparison = relationship("Comparison", back_populates="tools")
    tool = relationship("Tool", back_populates="comparison_tools")
    
    def __repr__(self):
        """نمایش رشته‌ای ابزار در مقایسه"""
        return f"<ComparisonTool: comparison_id={self.comparison_id}, tool_id={self.tool_id}>"