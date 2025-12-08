from typing import List, Optional
from datetime import date as DateType

from pydantic import BaseModel, Field


class DailyMetricsPoint(BaseModel):
    """Single data point for daily metrics."""
    date: str
    spend: float = 0
    revenue: float = 0
    roas: float = 0
    clicks: int = 0
    impressions: int = 0
    conversions: int = 0
    orders: int = 0


class MetricsSummary(BaseModel):
    """Summary KPIs for the dashboard."""
    revenue: float = Field(..., description="Total revenue in the period")
    spend: float = Field(..., description="Total ad spend in the period")
    profit: float = Field(..., description="Revenue minus spend")
    roas: float = Field(..., description="Return on ad spend (revenue/spend)")
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    orders: int = 0
    ctr: float = Field(0, description="Click-through rate as percentage")
    cpc: float = Field(0, description="Cost per click")
    cpa: float = Field(0, description="Cost per acquisition/conversion")
    aov: float = Field(0, description="Average order value")
    daily: Optional[List[DailyMetricsPoint]] = None


class ChannelMetrics(BaseModel):
    """Metrics aggregated by channel/platform."""
    platform: str
    platform_label: str = ""
    spend: float = 0
    spend_percentage: float = 0
    revenue: float = 0
    roas: float = 0
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    orders: int = 0
    ctr: float = 0
    cpc: float = 0
    cpa: float = 0


class ChannelBreakdownResponse(BaseModel):
    """Response for channel breakdown endpoint."""
    channels: List[ChannelMetrics]
    total_spend: float
    total_revenue: float


class TimeseriesDataPoint(BaseModel):
    """Single data point for timeseries chart."""
    date: str
    spend: Optional[float] = None
    revenue: Optional[float] = None
    roas: Optional[float] = None
    clicks: Optional[int] = None
    impressions: Optional[int] = None
    conversions: Optional[int] = None
    orders: Optional[int] = None


class TimeseriesResponse(BaseModel):
    """Response for timeseries endpoint with optional channel breakdown."""
    data: List[TimeseriesDataPoint]
    by_channel: Optional[dict[str, List[TimeseriesDataPoint]]] = None


class CampaignPerformance(BaseModel):
    """Campaign-level performance metrics."""
    campaign_id: str
    campaign_name: str
    platform: str
    platform_label: str = ""
    spend: float = 0
    revenue: float = 0
    roas: float = 0
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    ctr: float = 0
    cpc: float = 0
    cpa: float = 0
    status: str = "active"


class CampaignDetail(BaseModel):
    """Detailed campaign performance with daily breakdown."""
    campaign_id: str
    campaign_name: str
    platform: str
    summary: CampaignPerformance
    daily: List[TimeseriesDataPoint]


class CampaignsResponse(BaseModel):
    """Response for campaigns list endpoint."""
    campaigns: List[CampaignPerformance]
    total_count: int
    total_spend: float
    total_revenue: float


class OrderAttribution(BaseModel):
    """Attribution details for an order."""
    model: str = "last_touch"
    channel: Optional[str] = None
    campaign: Optional[str] = None
    source: Optional[str] = None
    medium: Optional[str] = None


class OrderEntry(BaseModel):
    """Order with attribution details."""
    id: str
    external_order_id: str
    date_time: str
    total_amount: float
    currency: str
    source_platform: str
    utm_source: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_medium: Optional[str] = None
    attribution: Optional[OrderAttribution] = None


class OrdersResponse(BaseModel):
    """Response for orders endpoint with pagination."""
    items: List[OrderEntry]
    total: int
    page: int = 1
    per_page: int = 50
    total_revenue: float = 0
    total_orders: int = 0
    aov: float = 0


class OrdersSummary(BaseModel):
    """Summary statistics for orders."""
    total_orders: int
    total_revenue: float
    aov: float
    orders_by_source: dict[str, int]
    revenue_by_source: dict[str, float]


class TopPerformerItem(BaseModel):
    """Top performing campaign entry."""
    rank: int
    campaign_id: str
    campaign_name: str
    platform: str
    platform_label: str = ""
    spend: float = 0
    clicks: int = 0
    conversions: int = 0
    cpc: float = 0
    cpa: float = 0


# Legacy alias for backward compatibility
DailyMetrics = DailyMetricsPoint
