"""
Funnel visualization and analysis routes.
Provides endpoints for funnel data, comparisons, and trend analysis.
"""
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.schemas.funnel import (
    FunnelDataResponse,
    FunnelComparisonResponse,
    FunnelTimePeriodComparison,
    FunnelTrendsResponse,
    FunnelMetadataResponse,
    FunnelCompareBy,
    FunnelGranularity,
    FunnelStageDefinition,
)
from app.services.funnel_service import (
    get_funnel_data,
    get_funnel_comparison,
    get_funnel_trends,
    DEFAULT_FUNNEL_STAGES,
)

router = APIRouter()


@router.get("/metadata", response_model=FunnelMetadataResponse)
def get_funnel_metadata(
    user=Depends(get_current_account_user),
):
    """
    Get funnel metadata including available stages and options.
    
    Returns:
        - Default funnel stages with descriptions
        - Available comparison options
        - Available time granularities
    """
    return FunnelMetadataResponse(
        default_stages=[
            FunnelStageDefinition(**stage) for stage in DEFAULT_FUNNEL_STAGES
        ],
        compare_options=[e.value for e in FunnelCompareBy],
        granularity_options=[e.value for e in FunnelGranularity],
    )


@router.get("", response_model=FunnelDataResponse)
def get_funnel(
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get funnel data for visualization.
    
    Returns a marketing funnel with stages from impressions to purchase,
    including drop-off rates and conversion metrics.
    
    Default date range is last 30 days if not specified.
    """
    if not from_date or not to_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = get_funnel_data(
        db=db,
        account_id=user.account_id,
        date_from=from_date,
        date_to=to_date,
        platform=platform,
    )
    
    # Transform date_range to use correct field names
    return FunnelDataResponse(
        stages=result["stages"],
        summary=result["summary"],
        date_range={
            "from": result["date_range"]["from"],
            "to": result["date_range"]["to"],
        },
    )


@router.get("/comparison")
def get_funnel_comparison_data(
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    compare_by: FunnelCompareBy = Query(FunnelCompareBy.platform, description="Comparison dimension"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Compare funnel performance across segments.
    
    Compare by:
    - platform: Compare funnels across different ad platforms
    - time_period: Compare current period with previous period of same duration
    
    Default date range is last 30 days if not specified.
    """
    if not from_date or not to_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = get_funnel_comparison(
        db=db,
        account_id=user.account_id,
        date_from=from_date,
        date_to=to_date,
        compare_by=compare_by.value,
    )
    
    # Return appropriate response based on comparison type
    if compare_by == FunnelCompareBy.time_period:
        return result  # FunnelTimePeriodComparison format
    else:
        # Transform date_range for FunnelComparisonResponse
        return {
            "compare_by": result["compare_by"],
            "comparisons": result["comparisons"],
            "date_range": {
                "from": result["date_range"]["from"],
                "to": result["date_range"]["to"],
            },
        }


@router.get("/trends", response_model=FunnelTrendsResponse)
def get_funnel_trend_data(
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    granularity: FunnelGranularity = Query(FunnelGranularity.daily, description="Time granularity"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get funnel metrics over time for trend analysis.
    
    Returns daily or weekly data points for impressions, clicks,
    purchases, revenue, and conversion rates.
    
    Default date range is last 30 days if not specified.
    """
    if not from_date or not to_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = get_funnel_trends(
        db=db,
        account_id=user.account_id,
        date_from=from_date,
        date_to=to_date,
        granularity=granularity.value,
    )
    
    return FunnelTrendsResponse(
        granularity=result["granularity"],
        trends=result["trends"],
        date_range={
            "from": result["date_range"]["from"],
            "to": result["date_range"]["to"],
        },
    )
