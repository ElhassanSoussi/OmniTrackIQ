"""
DailyMetrics model for aggregated daily performance tracking.

Stores pre-aggregated metrics per day for fast dashboard queries.
Supports multi-tenancy, channel breakdown, and campaign-level metrics.
"""
import uuid
from enum import Enum as PyEnum

from sqlalchemy import Column, Date, Enum, ForeignKey, Index, Integer, Numeric, String

from app.db import Base


class Channel(str, PyEnum):
    """Advertising/marketing channel types."""
    FACEBOOK = "facebook"
    GOOGLE_ADS = "google_ads"
    TIKTOK = "tiktok"
    SNAPCHAT = "snapchat"
    PINTEREST = "pinterest"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    MICROSOFT_ADS = "microsoft_ads"
    SHOPIFY = "shopify"
    GA4 = "ga4"
    EMAIL = "email"
    ORGANIC = "organic"
    DIRECT = "direct"
    OTHER = "other"


class DailyMetrics(Base):
    """
    Aggregated daily metrics for performance tracking.
    
    Can store metrics at different granularity levels:
    - Account-level: only account_id + date set
    - Channel-level: account_id + date + channel set
    - Campaign-level: account_id + date + channel + campaign_id set
    """
    __tablename__ = "daily_metrics"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Multi-tenancy: workspace/account scope (required)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, index=True)
    
    # Date dimension (required)
    date = Column(Date, nullable=False, index=True)
    
    # Channel dimension (optional - for channel-level breakdown)
    channel = Column(Enum(Channel), nullable=True)
    
    # Ad account reference (optional - for ad account level metrics)
    ad_account_id = Column(String, ForeignKey("ad_accounts.id"), nullable=True)
    
    # Campaign dimension (optional - for campaign-level breakdown)
    campaign_id = Column(String, nullable=True)
    campaign_name = Column(String, nullable=True)
    
    # Revenue metrics
    total_revenue = Column(Numeric(18, 4), nullable=False, default=0)
    total_orders = Column(Integer, nullable=False, default=0)
    
    # Spend metrics
    total_ad_spend = Column(Numeric(18, 4), nullable=False, default=0)
    
    # Engagement metrics
    total_impressions = Column(Integer, nullable=False, default=0)
    total_clicks = Column(Integer, nullable=False, default=0)
    
    # Conversion metrics (new)
    total_conversions = Column(Integer, nullable=False, default=0)
    
    # Computed metrics (can be recalculated from above)
    roas = Column(Numeric(18, 4), nullable=False, default=0)
    profit = Column(Numeric(18, 4), nullable=False, default=0)
    
    # Indexes for common query patterns
    __table_args__ = (
        # Multi-tenant date range queries (most common dashboard query)
        Index("ix_daily_metrics_account_date", "account_id", "date"),
        # Channel breakdown queries
        Index("ix_daily_metrics_account_date_channel", "account_id", "date", "channel"),
        # Campaign-level queries
        Index("ix_daily_metrics_account_channel_campaign", "account_id", "channel", "campaign_id"),
        # Ad account level queries
        Index("ix_daily_metrics_account_ad_account", "account_id", "ad_account_id"),
    )
    
    def __repr__(self):
        return f"<DailyMetrics(date={self.date}, account={self.account_id}, channel={self.channel})>"
