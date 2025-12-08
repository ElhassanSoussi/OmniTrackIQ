"""
Pydantic schemas for funnel visualization and analysis.
"""
from typing import List, Optional, Dict, Any
from datetime import date as DateType
from enum import Enum

from pydantic import BaseModel, Field


class FunnelStage(BaseModel):
    """Single stage in the marketing funnel."""
    id: str = Field(..., description="Unique identifier for the stage")
    name: str = Field(..., description="Display name of the stage")
    value: int = Field(..., description="Number of users at this stage")
    percentage: float = Field(..., description="Percentage of total (from first stage)")
    drop_off: int = Field(..., description="Number of users lost from previous stage")
    drop_off_rate: float = Field(..., description="Percentage of users lost from previous stage")


class FunnelSummary(BaseModel):
    """Summary metrics for the funnel."""
    total_impressions: int = Field(0, description="Total ad impressions")
    total_clicks: int = Field(0, description="Total ad clicks")
    total_purchases: int = Field(0, description="Total completed purchases")
    total_revenue: float = Field(0, description="Total revenue generated")
    overall_conversion_rate: float = Field(0, description="End-to-end conversion rate (purchases/impressions)")
    click_through_rate: float = Field(0, description="CTR (clicks/impressions)")
    average_order_value: float = Field(0, description="Average order value")


class DateRange(BaseModel):
    """Date range for the query."""
    from_date: str = Field(..., alias="from")
    to_date: str = Field(..., alias="to")
    
    class Config:
        populate_by_name = True


class FunnelDataResponse(BaseModel):
    """Response for funnel data endpoint."""
    stages: List[FunnelStage] = Field(..., description="Funnel stages with metrics")
    summary: FunnelSummary = Field(..., description="Aggregate funnel metrics")
    date_range: DateRange = Field(..., description="Date range of the data")


class FunnelCompareBy(str, Enum):
    """Comparison dimension for funnels."""
    platform = "platform"
    time_period = "time_period"


class FunnelSegmentComparison(BaseModel):
    """Funnel data for a single segment (e.g., one platform)."""
    segment: str = Field(..., description="Segment identifier (e.g., platform name)")
    segment_label: str = Field(..., description="Human-readable label for the segment")
    stages: List[FunnelStage] = Field(..., description="Funnel stages for this segment")
    summary: FunnelSummary = Field(..., description="Summary metrics for this segment")


class FunnelComparisonResponse(BaseModel):
    """Response for funnel comparison by segments (platforms, campaigns, etc.)."""
    compare_by: str = Field(..., description="Dimension used for comparison")
    comparisons: List[FunnelSegmentComparison] = Field(..., description="Funnel data per segment")
    date_range: DateRange = Field(..., description="Date range of the data")


class PeriodMetrics(BaseModel):
    """Metrics for a single time period."""
    from_date: str = Field(..., alias="from")
    to_date: str = Field(..., alias="to")
    stages: List[FunnelStage] = Field(..., description="Funnel stages")
    summary: FunnelSummary = Field(..., description="Summary metrics")
    
    class Config:
        populate_by_name = True


class MetricChange(BaseModel):
    """Change in a single metric between periods."""
    current: Any = Field(..., description="Value in current period")
    previous: Any = Field(..., description="Value in previous period")
    change: float = Field(..., description="Absolute change")
    change_percentage: float = Field(..., description="Percentage change")


class FunnelTimePeriodComparison(BaseModel):
    """Response for funnel comparison by time period."""
    compare_by: str = Field("time_period", description="Comparison type")
    current_period: PeriodMetrics = Field(..., description="Current period data")
    previous_period: PeriodMetrics = Field(..., description="Previous period data")
    changes: Dict[str, MetricChange] = Field(..., description="Changes between periods")


class FunnelGranularity(str, Enum):
    """Time granularity for funnel trends."""
    daily = "daily"
    weekly = "weekly"


class FunnelTrendPoint(BaseModel):
    """Single data point in funnel trend."""
    period: str = Field(..., description="Date or week identifier")
    impressions: int = Field(0, description="Ad impressions")
    clicks: int = Field(0, description="Ad clicks")
    ctr: float = Field(0, description="Click-through rate")
    purchases: int = Field(0, description="Completed purchases")
    revenue: float = Field(0, description="Revenue")
    conversion_rate: float = Field(0, description="Conversion rate (purchases/clicks)")


class FunnelTrendsResponse(BaseModel):
    """Response for funnel trends endpoint."""
    granularity: str = Field(..., description="Time granularity (daily/weekly)")
    trends: List[FunnelTrendPoint] = Field(..., description="Trend data points")
    date_range: DateRange = Field(..., description="Date range of the data")


class FunnelStageDefinition(BaseModel):
    """Definition of a funnel stage for metadata."""
    id: str = Field(..., description="Stage identifier")
    name: str = Field(..., description="Display name")
    description: str = Field(..., description="Stage description")


class FunnelMetadataResponse(BaseModel):
    """Response for funnel metadata endpoint."""
    default_stages: List[FunnelStageDefinition] = Field(..., description="Default funnel stages")
    compare_options: List[str] = Field(..., description="Available comparison dimensions")
    granularity_options: List[str] = Field(..., description="Available time granularities")
