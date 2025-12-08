from datetime import date, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.schemas.metrics import (
    MetricsSummary, 
    CampaignPerformance, 
    CampaignsResponse,
    CampaignDetail,
    ChannelBreakdownResponse,
    TimeseriesResponse,
    OrdersResponse,
    OrdersSummary,
    TopPerformerItem,
)
from app.services.metrics_service import (
    get_campaigns, 
    get_orders, 
    get_summary,
    get_platform_breakdown,
    get_daily_performance,
    get_top_performers,
    get_timeseries,
    get_channel_breakdown,
    get_campaign_detail,
    get_orders_summary,
)

router = APIRouter()


@router.get("/summary", response_model=MetricsSummary)
def summary(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get metrics summary for the dashboard.
    
    Returns aggregate KPIs including revenue, spend, ROAS, orders, and daily breakdown.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_summary(db, user.account_id, from_date, to_date, platform)


@router.get("/timeseries", response_model=TimeseriesResponse)
def timeseries(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    group_by_channel: bool = Query(False, description="Include breakdown by channel"),
    metrics: List[str] = Query(["spend", "revenue", "roas"], description="Metrics to include"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get timeseries data for charts.
    
    Returns daily data points with optional channel breakdown.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_timeseries(db, user.account_id, from_date, to_date, platform, group_by_channel, metrics)


@router.get("/channels", response_model=ChannelBreakdownResponse)
def channels(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get metrics breakdown by channel/platform.
    
    Returns spend, revenue, ROAS, and engagement metrics per channel.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_channel_breakdown(db, user.account_id, from_date, to_date)


@router.get("/campaigns", response_model=List[CampaignPerformance])
def campaigns(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    sort_by: Optional[str] = Query("spend", description="Sort by: spend, roas, clicks, conversions"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get campaign performance data.
    
    Returns list of campaigns with metrics, filterable by platform.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_campaigns(db, user.account_id, from_date, to_date, platform, sort_by, limit)


@router.get("/campaigns/{campaign_id}", response_model=CampaignDetail)
def campaign_detail(
    campaign_id: str,
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get detailed metrics for a single campaign.
    
    Returns summary stats and daily breakdown.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = get_campaign_detail(db, user.account_id, campaign_id, from_date, to_date)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaign {campaign_id} not found"
        )
    return result


@router.get("/orders")
def orders(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    utm_source: Optional[str] = Query(None, description="Filter by UTM source"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get orders list with pagination and filtering.
    
    Returns paginated orders with attribution details.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    total, items = get_orders(db, user.account_id, from_date, to_date, limit, offset, utm_source)
    
    # Calculate summary stats
    total_revenue = sum(item.get("total_amount", 0) for item in items)
    aov = total_revenue / len(items) if items else 0
    
    return {
        "total": total, 
        "items": items,
        "page": (offset // limit) + 1,
        "per_page": limit,
        "total_revenue": round(total_revenue, 2),
        "total_orders": total,
        "aov": round(aov, 2),
    }


@router.get("/orders/summary", response_model=OrdersSummary)
def orders_summary_endpoint(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get orders summary with attribution breakdown.
    
    Returns aggregate stats and breakdown by source.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_orders_summary(db, user.account_id, from_date, to_date)


@router.get("/breakdown/platform")
def platform_breakdown(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get spend and performance breakdown by platform.
    
    Legacy endpoint - prefer /channels for new integrations.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_platform_breakdown(db, user.account_id, from_date, to_date)


@router.get("/daily")
def daily_performance(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    platform: Optional[str] = Query(None),
    metrics: List[str] = Query(["spend", "revenue", "roas"], description="Metrics to include"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get daily performance data for charts.
    
    Legacy endpoint - prefer /timeseries for new integrations.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_daily_performance(db, user.account_id, from_date, to_date, platform, metrics)


@router.get("/top-performers", response_model=List[TopPerformerItem])
def top_performers(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    metric: str = Query("spend", description="Metric to rank by: spend, conversions, clicks"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get top performing campaigns by a specific metric.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_top_performers(db, user.account_id, from_date, to_date, metric, limit)
