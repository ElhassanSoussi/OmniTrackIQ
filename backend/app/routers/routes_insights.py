"""
API routes for AI-powered insights and advanced analytics.
"""
from datetime import date, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.services.insights_service import (
    generate_insights,
    explain_anomaly,
    get_predictive_alerts,
)
from app.services.mmm_service import (
    OptimizationGoal,
    get_channel_contribution_analysis,
    get_budget_optimization,
    get_scenario_analysis,
    get_diminishing_returns_analysis,
)
from app.services.incrementality_service import (
    analyze_incrementality,
    estimate_baseline_conversions,
    get_holdout_test_design,
    get_conversion_lift_analysis,
)

router = APIRouter()


# ================== AI Insights Endpoints ==================

@router.get("/insights")
def insights(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    include_forecasts: bool = Query(True, description="Include predictive forecasts"),
    include_recommendations: bool = Query(True, description="Include optimization recommendations"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get AI-powered insights for the account.
    
    Analyzes trends, detects patterns, and provides actionable recommendations:
    - Trend analysis (revenue, ROAS, efficiency)
    - Channel performance insights
    - Correlation analysis
    - Predictive forecasts
    - Budget recommendations
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    return generate_insights(
        db, user.account_id, from_date, to_date,
        include_forecasts=include_forecasts,
        include_recommendations=include_recommendations,
    )


@router.get("/insights/anomaly-explanation")
def anomaly_explanation(
    anomaly_date: date = Query(..., description="Date of the anomaly"),
    metric: str = Query(..., description="Metric that showed anomaly (revenue, spend, roas, etc.)"),
    anomaly_type: str = Query(..., description="Type of anomaly: spike or drop"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get AI explanation for a specific anomaly.
    
    Analyzes potential causes and provides context for why an anomaly occurred.
    """
    if anomaly_type not in ["spike", "drop"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="anomaly_type must be 'spike' or 'drop'"
        )
    
    valid_metrics = ["revenue", "spend", "roas", "conversions", "ctr", "cpc", "impressions", "clicks"]
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid metric. Valid options: {', '.join(valid_metrics)}"
        )
    
    return explain_anomaly(db, user.account_id, anomaly_date, metric, anomaly_type)


@router.get("/insights/predictive-alerts")
def predictive_alerts(
    days_ahead: int = Query(7, ge=1, le=30, description="Days to forecast ahead"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get predictive alerts based on trend analysis.
    
    Warns about potential issues before they become critical:
    - Declining revenue trends
    - ROAS degradation
    - Efficiency concerns
    - Spend anomalies
    """
    return get_predictive_alerts(db, user.account_id, days_ahead)


# ================== Marketing Mix Modeling Endpoints ==================

@router.get("/mmm/channel-contribution")
def channel_contribution(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Analyze contribution of each marketing channel to overall revenue.
    
    Returns:
    - Channel-level metrics (spend, revenue, ROAS, CPA)
    - Marginal efficiency estimates
    - Saturation levels
    - Efficiency ratings
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    return get_channel_contribution_analysis(db, user.account_id, from_date, to_date)


@router.get("/mmm/budget-optimization")
def budget_optimization(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    total_budget: Optional[float] = Query(None, description="Total budget to allocate. Uses current spend if not provided."),
    goal: str = Query("balanced", description="Optimization goal: maximize_revenue, maximize_roas, minimize_cpa, balanced"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Get budget allocation recommendations based on channel performance.
    
    Analyzes historical performance and suggests optimal budget distribution
    to maximize the specified goal (revenue, ROAS, or CPA efficiency).
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    try:
        optimization_goal = OptimizationGoal(goal)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid goal. Valid options: maximize_revenue, maximize_roas, minimize_cpa, balanced"
        )
    
    return get_budget_optimization(
        db, user.account_id, from_date, to_date,
        total_budget=total_budget,
        goal=optimization_goal,
    )


@router.post("/mmm/scenario-analysis")
def scenario_analysis(
    scenarios: List[dict],
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Analyze different budget scenarios and their expected outcomes.
    
    Request body should contain a list of scenarios, each being a dict
    of channel name to spend amount.
    
    Example:
    ```json
    [
        {"facebook": 5000, "google_ads": 3000},
        {"facebook": 3000, "google_ads": 5000}
    ]
    ```
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    if not scenarios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one scenario is required"
        )
    
    return get_scenario_analysis(db, user.account_id, from_date, to_date, scenarios)


@router.get("/mmm/diminishing-returns")
def diminishing_returns(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    channel: Optional[str] = Query(None, description="Filter to specific channel"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Analyze diminishing returns for each channel.
    
    Shows how efficiency changes at different spend levels:
    - Quartile analysis by spend level
    - Efficiency drop percentage
    - Optimal daily spend range estimates
    - Recommendations for scaling
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=90)  # Need more data for this analysis
    
    return get_diminishing_returns_analysis(db, user.account_id, from_date, to_date, channel)


# ================== Incrementality Testing Endpoints ==================

@router.get("/incrementality/analyze")
def incrementality_analyze(
    channel: str = Query(..., description="Channel to analyze"),
    from_date: Optional[date] = Query(None, alias="from", description="Test period start"),
    to_date: Optional[date] = Query(None, alias="to", description="Test period end"),
    control_start: Optional[date] = Query(None, description="Control period start"),
    control_end: Optional[date] = Query(None, description="Control period end"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Analyze incrementality for a channel by comparing test vs control periods.
    
    Returns:
    - Conversion lift percentage
    - Revenue lift percentage
    - Incremental ROAS (iROAS)
    - Statistical significance
    - Interpretation and recommendations
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=14)
    
    return analyze_incrementality(
        db, user.account_id, channel, from_date, to_date,
        control_period_start=control_start,
        control_period_end=control_end,
    )


@router.get("/incrementality/baseline")
def baseline_estimate(
    channel: str = Query(..., description="Channel to analyze"),
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Estimate baseline conversions that would occur without marketing.
    
    Uses historical patterns to estimate what portion of conversions
    are truly incremental vs. would have happened organically.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    return estimate_baseline_conversions(db, user.account_id, channel, from_date, to_date)


@router.get("/incrementality/test-design")
def test_design(
    channel: str = Query(..., description="Channel to test"),
    duration_days: int = Query(14, ge=7, le=90, description="Test duration in days"),
    holdout_percent: float = Query(20, ge=5, le=50, description="Percentage of budget to hold out"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Generate a holdout test design for measuring incrementality.
    
    Provides recommendations for test setup including:
    - Test and holdout group definitions
    - Recommended duration
    - Minimum sample size
    - Expected metrics
    - Risks and recommendations
    """
    return get_holdout_test_design(
        db, user.account_id, channel,
        test_duration_days=duration_days,
        holdout_percentage=holdout_percent,
    )


@router.get("/incrementality/conversion-lift")
def conversion_lift(
    channel: Optional[str] = Query(None, description="Channel to analyze"),
    campaign: Optional[str] = Query(None, description="Campaign name to analyze"),
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Analyze conversion lift for a channel or campaign.
    
    Estimates lift by comparing conversion rates of exposed
    vs. estimated non-exposed users.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    return get_conversion_lift_analysis(
        db, user.account_id,
        campaign_name=campaign,
        channel=channel,
        date_from=from_date,
        date_to=to_date,
    )
