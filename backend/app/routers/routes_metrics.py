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
from app.services.attribution_service import (
    AttributionModel,
    get_attribution_report,
    compare_attribution_models,
    get_conversion_paths,
)
from app.services.cohort_service import (
    CohortPeriod,
    get_retention_cohorts,
    get_revenue_cohorts,
    get_channel_cohorts,
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


# ================== Attribution Endpoints ==================

@router.get("/attribution")
def attribution_report(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    model: str = Query("linear", description="Attribution model: first_touch, last_touch, linear, time_decay, position_based"),
    lookback_days: int = Query(30, ge=1, le=90, description="Days to look back for touchpoints"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get multi-touch attribution report.
    
    Analyzes conversions and attributes revenue to channels based on the selected model:
    - first_touch: 100% credit to the first touchpoint
    - last_touch: 100% credit to the last touchpoint  
    - linear: Equal credit to all touchpoints
    - time_decay: More credit to recent touchpoints
    - position_based: 40% first, 40% last, 20% middle
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    try:
        attribution_model = AttributionModel(model)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid attribution model: {model}. Valid options: first_touch, last_touch, linear, time_decay, position_based"
        )
    
    return get_attribution_report(db, user.account_id, from_date, to_date, attribution_model, lookback_days)


@router.get("/attribution/compare")
def compare_models(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Compare attribution results across different models.
    
    Useful for understanding how different attribution models affect channel credit.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    return compare_attribution_models(db, user.account_id, from_date, to_date)


@router.get("/attribution/paths")
def conversion_paths(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    limit: int = Query(20, ge=1, le=50, description="Number of top paths to return"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get most common conversion paths.
    
    Shows the sequence of touchpoints customers take before converting.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    return get_conversion_paths(db, user.account_id, from_date, to_date, limit)


# ================== Cohort Analysis Endpoints ==================

@router.get("/cohorts/retention")
def retention_cohorts(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    period: str = Query("monthly", description="Cohort period: daily, weekly, monthly"),
    max_periods: int = Query(12, ge=1, le=24, description="Maximum periods to track"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get retention cohort analysis.
    
    Groups customers by their first purchase date and tracks repeat purchase rates over time.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=365)
    
    try:
        cohort_period = CohortPeriod(period)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid period: {period}. Valid options: daily, weekly, monthly"
        )
    
    return get_retention_cohorts(db, user.account_id, from_date, to_date, cohort_period, max_periods)


@router.get("/cohorts/revenue")
def revenue_cohorts(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    period: str = Query("monthly", description="Cohort period: daily, weekly, monthly"),
    max_periods: int = Query(12, ge=1, le=24, description="Maximum periods to track"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get revenue-focused cohort analysis.
    
    Shows cumulative revenue and LTV estimates for each cohort over time.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=365)
    
    try:
        cohort_period = CohortPeriod(period)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid period: {period}. Valid options: daily, weekly, monthly"
        )
    
    return get_revenue_cohorts(db, user.account_id, from_date, to_date, cohort_period, max_periods)


@router.get("/cohorts/by-channel")
def channel_cohorts(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    period: str = Query("monthly", description="Cohort period: daily, weekly, monthly"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get cohort analysis segmented by acquisition channel.
    
    Shows how retention and LTV vary by the channel that acquired the customer.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=365)
    
    try:
        cohort_period = CohortPeriod(period)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid period: {period}. Valid options: daily, weekly, monthly"
        )
    
    return get_channel_cohorts(db, user.account_id, from_date, to_date, cohort_period)
