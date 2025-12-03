from typing import List, Optional

from pydantic import BaseModel


class DailyMetric(BaseModel):
    date: str
    spend: float
    revenue: float
    impressions: int
    clicks: int


class MetricsSummary(BaseModel):
    revenue: float
    spend: float
    profit: float
    roas: float
    impressions: int
    clicks: int
    conversions: int
    orders: int
    daily: Optional[List[DailyMetric]] = None


class CampaignPerformance(BaseModel):
    campaign_id: str
    campaign_name: str
    platform: str
    spend: float
    revenue: float
    roas: float
    impressions: int
    clicks: int
    conversions: int


class OrderEntry(BaseModel):
    id: str
    date_time: str
    total_amount: float
    currency: str
    source_platform: str
    utm_source: Optional[str]
    utm_campaign: Optional[str]


class OrdersResponse(BaseModel):
    total: int
    items: List[OrderEntry]
