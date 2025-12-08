"""
Anomaly detection routes.
Provides endpoints for detecting and analyzing anomalies in marketing metrics.
"""
from datetime import date, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.schemas.anomaly import (
    AnomalyDetectionResponse,
    AnomalyTrendsResponse,
    MetricHealthResponse,
    AnomalyMetadata,
    Sensitivity,
)
from app.services.anomaly_service import (
    detect_anomalies,
    get_anomaly_trends,
    get_metric_health,
    METRIC_CONFIG,
    AnomalyType,
    AnomalySeverity,
)

router = APIRouter()


@router.get("/metadata", response_model=AnomalyMetadata)
def get_anomaly_metadata(
    user=Depends(get_current_account_user),
):
    """
    Get metadata about available anomaly detection options.
    """
    metrics = [
        {"id": k, "label": v["label"], "format": v["format"]}
        for k, v in METRIC_CONFIG.items()
    ]
    
    return AnomalyMetadata(
        metrics=metrics,
        severity_levels=[s.value for s in AnomalySeverity],
        anomaly_types=[t.value for t in AnomalyType],
        sensitivity_levels=[s.value for s in Sensitivity],
    )


@router.get("", response_model=AnomalyDetectionResponse)
def detect_metric_anomalies(
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    metrics: Optional[List[str]] = Query(None, description="Metrics to analyze"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    sensitivity: Sensitivity = Query(Sensitivity.medium, description="Detection sensitivity"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Detect anomalies in marketing metrics.
    
    Uses Z-score based statistical analysis to identify unusual patterns:
    - Spikes: Unusually high values
    - Drops: Unusually low values
    - Zero values: Unexpected missing data
    
    Sensitivity levels:
    - low: Only detect major anomalies (3+ standard deviations)
    - medium: Balanced detection (2+ standard deviations)
    - high: Detect minor anomalies (1.5+ standard deviations)
    
    Default date range is last 30 days if not specified.
    """
    if not from_date or not to_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = detect_anomalies(
        db=db,
        account_id=user.account_id,
        date_from=from_date,
        date_to=to_date,
        metrics=metrics,
        platform=platform,
        sensitivity=sensitivity.value,
    )
    
    return AnomalyDetectionResponse(
        anomalies=result["anomalies"],
        summary=result["summary"],
        date_range={"from": str(from_date), "to": str(to_date)},
        sensitivity=result["sensitivity"],
        metrics_analyzed=result["metrics_analyzed"],
        message=result.get("message"),
    )


@router.get("/trends", response_model=AnomalyTrendsResponse)
def get_anomaly_trend_data(
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get anomaly trends over time.
    
    Shows how many anomalies occurred on each day, useful for identifying
    problematic periods or patterns.
    
    Default date range is last 30 days if not specified.
    """
    if not from_date or not to_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = get_anomaly_trends(
        db=db,
        account_id=user.account_id,
        date_from=from_date,
        date_to=to_date,
        platform=platform,
    )
    
    return AnomalyTrendsResponse(
        timeline=result["timeline"],
        total_days_with_anomalies=result["total_days_with_anomalies"],
        date_range={"from": str(from_date), "to": str(to_date)},
    )


@router.get("/health", response_model=MetricHealthResponse)
def get_metrics_health(
    from_date: Optional[date] = Query(None, alias="from", description="Start date"),
    to_date: Optional[date] = Query(None, alias="to", description="End date"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get overall health status of each metric.
    
    Compares recent values to historical baseline and indicates whether
    each metric is stable, improving, declining, or critical.
    
    Default date range is last 30 days if not specified.
    """
    if not from_date or not to_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    result = get_metric_health(
        db=db,
        account_id=user.account_id,
        date_from=from_date,
        date_to=to_date,
        platform=platform,
    )
    
    return MetricHealthResponse(
        metrics=result["metrics"],
        overall_health=result["overall_health"],
        date_range={"from": str(from_date), "to": str(to_date)},
        message=result.get("message"),
    )
