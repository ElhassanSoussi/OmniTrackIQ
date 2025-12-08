"""
Saved view schemas for dashboard configurations.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.saved_view import ViewType


class SavedViewConfig(BaseModel):
    """Configuration for a saved view."""
    date_range: Optional[str] = "30d"
    platform_filter: Optional[str] = None
    metrics: Optional[List[str]] = None
    sort_by: Optional[str] = None
    sort_direction: Optional[str] = "desc"
    columns: Optional[List[str]] = None
    custom_filters: Optional[dict] = None


class SavedViewCreate(BaseModel):
    """Schema for creating a saved view."""
    name: str = Field(..., min_length=1, max_length=100)
    view_type: ViewType = ViewType.CUSTOM
    description: Optional[str] = Field(None, max_length=500)
    config: SavedViewConfig = SavedViewConfig()
    is_shared: bool = False
    is_default: bool = False


class SavedViewUpdate(BaseModel):
    """Schema for updating a saved view."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    config: Optional[SavedViewConfig] = None
    is_shared: Optional[bool] = None
    is_default: Optional[bool] = None


class SavedViewResponse(BaseModel):
    """Response schema for a saved view."""
    id: str
    name: str
    view_type: ViewType
    description: Optional[str]
    config: SavedViewConfig
    is_shared: bool
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime]
    user_id: str
    
    class Config:
        from_attributes = True


class SavedViewListResponse(BaseModel):
    """Response schema for list of saved views."""
    items: List[SavedViewResponse]
    total: int
