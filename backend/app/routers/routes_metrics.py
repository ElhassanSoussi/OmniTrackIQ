from datetime import date, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.schemas.metrics import MetricsSummary, CampaignPerformance
from app.services.metrics_service import (
    get_campaigns, 
    get_orders, 
    get_summary,
    get_platform_breakdown,
    get_daily_performance,
    get_top_performers,
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
    """Get metrics summary for the dashboard."""
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_summary(db, user.account_id, from_date, to_date, platform)


@router.get("/campaigns")
def campaigns(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    sort_by: Optional[str] = Query("spend", description="Sort by: spend, roas, clicks, conversions"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get campaign performance data."""
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_campaigns(db, user.account_id, from_date, to_date, platform, sort_by, limit)


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
    """Get orders list with pagination."""
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    total, items = get_orders(db, user.account_id, from_date, to_date, limit, offset, utm_source)
    return {"total": total, "items": items}


@router.get("/breakdown/platform")
def platform_breakdown(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get spend and performance breakdown by platform."""
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
    """Get daily performance data for charts."""
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_daily_performance(db, user.account_id, from_date, to_date, platform, metrics)


@router.get("/top-performers")
def top_performers(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    metric: str = Query("roas", description="Metric to rank by: roas, spend, conversions, clicks"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get top performing campaigns by a specific metric."""
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    return get_top_performers(db, user.account_id, from_date, to_date, metric, limit)
