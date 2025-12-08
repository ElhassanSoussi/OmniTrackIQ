"""
Custom report schemas for request/response validation.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

from app.models.custom_report import VisualizationType


class MetricType(str, Enum):
    """Available metrics for custom reports."""
    REVENUE = "revenue"
    SPEND = "spend"
    PROFIT = "profit"
    ROAS = "roas"
    IMPRESSIONS = "impressions"
    CLICKS = "clicks"
    CONVERSIONS = "conversions"
    CTR = "ctr"
    CPC = "cpc"
    CPA = "cpa"
    AOV = "aov"
    ORDERS = "orders"


class DimensionType(str, Enum):
    """Available dimensions for grouping data."""
    DATE = "date"
    PLATFORM = "platform"
    CAMPAIGN = "campaign"
    UTM_SOURCE = "utm_source"
    UTM_CAMPAIGN = "utm_campaign"
    UTM_MEDIUM = "utm_medium"


class FilterOperator(str, Enum):
    """Filter comparison operators."""
    EQUALS = "eq"
    NOT_EQUALS = "neq"
    GREATER_THAN = "gt"
    GREATER_THAN_OR_EQUALS = "gte"
    LESS_THAN = "lt"
    LESS_THAN_OR_EQUALS = "lte"
    CONTAINS = "contains"
    IN = "in"


class ReportFilter(BaseModel):
    """A single filter condition."""
    field: str
    operator: FilterOperator
    value: Any


class ReportConfig(BaseModel):
    """Configuration for a custom report."""
    metrics: List[MetricType] = Field(default_factory=lambda: [MetricType.REVENUE, MetricType.SPEND])
    dimensions: List[DimensionType] = Field(default_factory=lambda: [DimensionType.DATE])
    filters: List[ReportFilter] = Field(default_factory=list)
    date_range: str = "30d"
    custom_date_from: Optional[str] = None
    custom_date_to: Optional[str] = None
    sort_by: Optional[str] = None
    sort_direction: str = "desc"
    limit: int = Field(default=100, ge=1, le=1000)
    compare_previous_period: bool = False


class CustomReportCreate(BaseModel):
    """Schema for creating a custom report."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    config: ReportConfig = Field(default_factory=ReportConfig)
    visualization_type: VisualizationType = VisualizationType.TABLE
    is_shared: bool = False
    is_favorite: bool = False


class CustomReportUpdate(BaseModel):
    """Schema for updating a custom report."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    config: Optional[ReportConfig] = None
    visualization_type: Optional[VisualizationType] = None
    is_shared: Optional[bool] = None
    is_favorite: Optional[bool] = None


class CustomReportResponse(BaseModel):
    """Response schema for a custom report."""
    id: str
    name: str
    description: Optional[str]
    config: ReportConfig
    visualization_type: VisualizationType
    is_shared: bool
    is_favorite: bool
    last_run_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    user_id: str
    
    class Config:
        from_attributes = True


class CustomReportListResponse(BaseModel):
    """Response schema for list of custom reports."""
    items: List[CustomReportResponse]
    total: int


class ReportDataPoint(BaseModel):
    """A single data point in report results."""
    dimensions: Dict[str, Any]
    metrics: Dict[str, Any]


class ReportResultsResponse(BaseModel):
    """Response schema for report execution results."""
    report_id: str
    data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    total_rows: int
    executed_at: datetime
    
    # Comparison data if compare_previous_period is enabled
    comparison_data: Optional[List[Dict[str, Any]]] = None
    comparison_summary: Optional[Dict[str, Any]] = None


# Available metrics metadata for the UI
METRICS_METADATA = [
    {"id": "revenue", "label": "Revenue", "format": "currency", "description": "Total revenue from orders"},
    {"id": "spend", "label": "Ad Spend", "format": "currency", "description": "Total advertising spend"},
    {"id": "profit", "label": "Profit", "format": "currency", "description": "Revenue minus ad spend"},
    {"id": "roas", "label": "ROAS", "format": "decimal", "description": "Return on ad spend (Revenue / Spend)"},
    {"id": "impressions", "label": "Impressions", "format": "number", "description": "Number of ad impressions"},
    {"id": "clicks", "label": "Clicks", "format": "number", "description": "Number of ad clicks"},
    {"id": "conversions", "label": "Conversions", "format": "number", "description": "Number of conversions"},
    {"id": "ctr", "label": "CTR", "format": "percent", "description": "Click-through rate"},
    {"id": "cpc", "label": "CPC", "format": "currency", "description": "Cost per click"},
    {"id": "cpa", "label": "CPA", "format": "currency", "description": "Cost per acquisition"},
    {"id": "aov", "label": "AOV", "format": "currency", "description": "Average order value"},
    {"id": "orders", "label": "Orders", "format": "number", "description": "Number of orders"},
]

DIMENSIONS_METADATA = [
    {"id": "date", "label": "Date", "description": "Group by date"},
    {"id": "platform", "label": "Platform", "description": "Group by advertising platform"},
    {"id": "campaign", "label": "Campaign", "description": "Group by campaign"},
    {"id": "utm_source", "label": "UTM Source", "description": "Group by UTM source parameter"},
    {"id": "utm_campaign", "label": "UTM Campaign", "description": "Group by UTM campaign parameter"},
    {"id": "utm_medium", "label": "UTM Medium", "description": "Group by UTM medium parameter"},
]
