# app/schemas/comparison.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.schemas.tool import ToolOut

class ComparisonToolData(BaseModel):
    """مدل داده‌های سفارشی ابزار در مقایسه"""
    tool_id: int
    custom_data: Optional[Dict[str, Any]] = None

class ComparisonBase(BaseModel):
    """مدل پایه مقایسه"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    
class ComparisonCreate(ComparisonBase):
    """مدل ایجاد مقایسه"""
    tool_ids: List[int] = Field(..., min_items=2, max_items=10)
    tools_data: Optional[List[ComparisonToolData]] = None
    shared: bool = False
    
class ComparisonUpdate(ComparisonBase):
    """مدل به‌روزرسانی مقایسه"""
    tool_ids: Optional[List[int]] = Field(None, min_items=2, max_items=10)
    tools_data: Optional[List[ComparisonToolData]] = None
    shared: Optional[bool] = None
    comparison_data: Optional[Dict[str, Any]] = None
    
class ComparisonToolOut(BaseModel):
    """مدل خروجی ابزار در مقایسه"""
    id: int
    tool: ToolOut
    custom_data: Optional[Dict[str, Any]] = None
    
    model_config = {
        "from_attributes": True
    }
    
class ComparisonOut(ComparisonBase):
    """مدل خروجی مقایسه"""
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    shared: bool
    share_token: str
    view_count: int = 0
    comparison_data: Optional[Dict[str, Any]] = None
    tools: List[ComparisonToolOut] = []
    
    model_config = {
        "from_attributes": True
    }
    
class ComparisonFeature(BaseModel):
    """مدل ویژگی قابل مقایسه"""
    name: str
    display_name: str
    description: Optional[str] = None
    feature_type: str  # boolean, text, number, rating
    
class ComparisonResult(BaseModel):
    """مدل نتیجه مقایسه"""
    tools: List[ToolOut]
    features: List[ComparisonFeature]
    comparison_table: Dict[str, Dict[int, Any]]
    summary: Dict[str, Any]