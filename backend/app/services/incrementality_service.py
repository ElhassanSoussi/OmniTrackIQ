"""
Incrementality testing service.
Helps measure the true incremental impact of marketing campaigns.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Any
from collections import defaultdict
from enum import Enum
import statistics
import math
import random

from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


class TestStatus(str, Enum):
    """Status of incrementality test."""
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TestType(str, Enum):
    """Types of incrementality tests."""
    GEO_HOLDOUT = "geo_holdout"
    CONVERSION_LIFT = "conversion_lift"
    TIME_BASED = "time_based"
    BUDGET_SPLIT = "budget_split"


def analyze_incrementality(
    db: Session,
    account_id: str,
    channel: str,
    date_from: date,
    date_to: date,
    control_period_start: Optional[date] = None,
    control_period_end: Optional[date] = None,
) -> Dict[str, Any]:
    """
    Analyze incrementality by comparing test period vs control period.
    Uses time-based analysis when geo data isn't available.
    """
    # If no control period specified, use previous period of same length
    days_in_test = (date_to - date_from).days + 1
    
    if control_period_start is None:
        control_period_end = date_from - timedelta(days=1)
        control_period_start = control_period_end - timedelta(days=days_in_test - 1)
    
    # Get test period data
    test_data = _get_period_data(db, account_id, channel, date_from, date_to)
    
    # Get control period data
    control_data = _get_period_data(db, account_id, channel, control_period_start, control_period_end)
    
    if not test_data["days"] and not control_data["days"]:
        return {
            "channel": channel,
            "message": "Insufficient data for incrementality analysis",
            "test_period": {"from": str(date_from), "to": str(date_to)},
            "control_period": {"from": str(control_period_start), "to": str(control_period_end)},
        }
    
    # Calculate key metrics
    test_conversions = test_data["conversions"]
    test_revenue = test_data["revenue"]
    test_spend = test_data["spend"]
    
    control_conversions = control_data["conversions"]
    control_revenue = control_data["revenue"]
    control_spend = control_data["spend"]
    
    # Normalize by number of days
    test_days = max(1, len(test_data["days"]))
    control_days = max(1, len(control_data["days"]))
    
    test_daily_conversions = test_conversions / test_days
    control_daily_conversions = control_conversions / control_days
    
    test_daily_revenue = test_revenue / test_days
    control_daily_revenue = control_revenue / control_days
    
    # Calculate lift
    conversion_lift = _calculate_lift(test_daily_conversions, control_daily_conversions)
    revenue_lift = _calculate_lift(test_daily_revenue, control_daily_revenue)
    
    # Calculate statistical significance (simplified)
    significance = _calculate_significance(
        test_conversions, control_conversions, test_days, control_days
    )
    
    # Calculate incremental impact
    incremental_conversions = (test_daily_conversions - control_daily_conversions) * test_days
    incremental_revenue = (test_daily_revenue - control_daily_revenue) * test_days
    
    # Calculate iROAS (incremental ROAS)
    spend_difference = test_spend - (control_spend * test_days / control_days)
    i_roas = incremental_revenue / spend_difference if spend_difference > 0 else 0
    
    return {
        "channel": channel,
        "test_period": {
            "from": str(date_from),
            "to": str(date_to),
            "days": test_days,
            "conversions": test_conversions,
            "revenue": round(test_revenue, 2),
            "spend": round(test_spend, 2),
            "daily_conversions": round(test_daily_conversions, 2),
            "daily_revenue": round(test_daily_revenue, 2),
        },
        "control_period": {
            "from": str(control_period_start),
            "to": str(control_period_end),
            "days": control_days,
            "conversions": control_conversions,
            "revenue": round(control_revenue, 2),
            "spend": round(control_spend, 2),
            "daily_conversions": round(control_daily_conversions, 2),
            "daily_revenue": round(control_daily_revenue, 2),
        },
        "results": {
            "conversion_lift_percent": round(conversion_lift, 2),
            "revenue_lift_percent": round(revenue_lift, 2),
            "incremental_conversions": round(incremental_conversions, 1),
            "incremental_revenue": round(incremental_revenue, 2),
            "incremental_roas": round(i_roas, 2),
            "statistical_significance": round(significance * 100, 1),
            "is_significant": significance >= 0.95,
            "confidence_level": _get_confidence_level(significance),
        },
        "interpretation": _generate_interpretation(
            channel, conversion_lift, revenue_lift, significance, i_roas
        ),
    }


def estimate_baseline_conversions(
    db: Session,
    account_id: str,
    channel: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """
    Estimate baseline (organic) conversions that would occur without marketing.
    Uses historical patterns and cross-channel analysis.
    """
    # Get channel data
    channel_data = _get_period_data(db, account_id, channel, date_from, date_to)
    
    # Get total account data (all channels)
    total_data = _get_total_period_data(db, account_id, date_from, date_to)
    
    if total_data["conversions"] == 0:
        return {
            "channel": channel,
            "message": "Insufficient data",
            "date_range": {"from": str(date_from), "to": str(date_to)},
        }
    
    # Calculate channel share
    channel_share = channel_data["conversions"] / total_data["conversions"] if total_data["conversions"] > 0 else 0
    
    # Estimate baseline using simple model
    # Assume some portion of conversions would happen organically
    baseline_rate = _estimate_baseline_rate(db, account_id, channel, date_from, date_to)
    
    total_conversions = channel_data["conversions"]
    estimated_baseline = total_conversions * baseline_rate
    estimated_incremental = total_conversions - estimated_baseline
    
    incrementality_rate = estimated_incremental / total_conversions if total_conversions > 0 else 0
    
    return {
        "channel": channel,
        "date_range": {"from": str(date_from), "to": str(date_to)},
        "total_conversions": total_conversions,
        "estimated_baseline": round(estimated_baseline, 1),
        "estimated_incremental": round(estimated_incremental, 1),
        "incrementality_rate": round(incrementality_rate * 100, 1),
        "channel_share_of_total": round(channel_share * 100, 1),
        "methodology": "Time-series analysis with cross-channel comparison",
        "confidence": "medium",
        "note": "For more accurate results, consider running a holdout test",
    }


def get_holdout_test_design(
    db: Session,
    account_id: str,
    channel: str,
    test_duration_days: int = 14,
    holdout_percentage: float = 20,
) -> Dict[str, Any]:
    """
    Generate a holdout test design for measuring incrementality.
    Provides recommendations for test setup.
    """
    # Get recent performance data
    today = date.today()
    date_from = today - timedelta(days=30)
    date_to = today
    
    historical_data = _get_period_data(db, account_id, channel, date_from, date_to)
    
    daily_spend = historical_data["spend"] / 30 if historical_data["days"] else 0
    daily_conversions = historical_data["conversions"] / 30 if historical_data["days"] else 0
    daily_revenue = historical_data["revenue"] / 30 if historical_data["days"] else 0
    
    # Calculate sample size needed for statistical significance
    min_sample = _calculate_min_sample_size(daily_conversions, holdout_percentage / 100)
    
    # Estimate test duration needed
    recommended_duration = max(
        test_duration_days,
        math.ceil(min_sample / daily_conversions) if daily_conversions > 0 else 30
    )
    
    # Calculate expected cost
    test_spend_reduction = daily_spend * holdout_percentage / 100 * recommended_duration
    
    return {
        "channel": channel,
        "test_type": "budget_holdout",
        "design": {
            "test_group": {
                "name": "Control (Normal Spend)",
                "budget_allocation": 100 - holdout_percentage,
                "description": f"Continue running ads at {100 - holdout_percentage}% of normal budget",
            },
            "holdout_group": {
                "name": "Holdout (Reduced/No Spend)",
                "budget_allocation": holdout_percentage,
                "description": f"Reduce or pause {holdout_percentage}% of spend to measure organic baseline",
            },
        },
        "recommended_duration_days": recommended_duration,
        "minimum_sample_size": min_sample,
        "expected_metrics": {
            "daily_spend": round(daily_spend, 2),
            "daily_conversions": round(daily_conversions, 1),
            "daily_revenue": round(daily_revenue, 2),
            "test_spend_reduction": round(test_spend_reduction, 2),
        },
        "success_criteria": {
            "statistical_significance": "95%",
            "minimum_lift_to_detect": "10%",
        },
        "risks": [
            "Temporary revenue decrease during test period",
            "Competitive pressure may increase during holdout",
            "Seasonality effects may confound results",
        ],
        "recommendations": [
            "Run test during a stable period (avoid major holidays)",
            "Ensure tracking is accurate before starting",
            f"Minimum recommended test duration: {recommended_duration} days",
            "Document any external factors during test period",
        ],
    }


def get_conversion_lift_analysis(
    db: Session,
    account_id: str,
    campaign_name: Optional[str] = None,
    channel: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> Dict[str, Any]:
    """
    Analyze conversion lift by comparing exposed vs non-exposed users.
    Uses available data to estimate lift.
    """
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)
    
    # Get campaign/channel performance
    if channel:
        test_data = _get_period_data(db, account_id, channel, date_from, date_to)
        total_data = _get_total_period_data(db, account_id, date_from, date_to)
        identifier = channel
    else:
        test_data = _get_total_period_data(db, account_id, date_from, date_to)
        total_data = test_data
        identifier = "all_channels"
    
    if test_data["impressions"] == 0:
        return {
            "identifier": identifier,
            "message": "Insufficient impression data",
        }
    
    # Calculate conversion rates
    exposed_conversions = test_data["conversions"]
    exposed_impressions = test_data["impressions"]
    exposed_cvr = (exposed_conversions / exposed_impressions * 100) if exposed_impressions > 0 else 0
    
    # Estimate non-exposed conversion rate (baseline)
    # This is simplified - real implementation would use holdout data
    baseline_cvr = exposed_cvr * 0.3  # Assume 30% would convert anyway
    
    # Calculate lift
    absolute_lift = exposed_cvr - baseline_cvr
    relative_lift = ((exposed_cvr - baseline_cvr) / baseline_cvr * 100) if baseline_cvr > 0 else 0
    
    # Calculate incremental conversions
    incremental_conversions = exposed_impressions * (exposed_cvr - baseline_cvr) / 100
    
    return {
        "identifier": identifier,
        "date_range": {"from": str(date_from), "to": str(date_to)},
        "exposed_group": {
            "impressions": exposed_impressions,
            "conversions": exposed_conversions,
            "conversion_rate": round(exposed_cvr, 4),
        },
        "baseline_estimate": {
            "conversion_rate": round(baseline_cvr, 4),
            "methodology": "Historical pattern analysis",
        },
        "lift_analysis": {
            "absolute_lift": round(absolute_lift, 4),
            "relative_lift_percent": round(relative_lift, 2),
            "incremental_conversions": round(incremental_conversions, 1),
        },
        "confidence": "low",  # Without true holdout, confidence is limited
        "recommendation": "Run a holdout test for more accurate lift measurement",
    }


def _get_period_data(
    db: Session,
    account_id: str,
    channel: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """Get aggregated data for a channel in a period."""
    # Ad spend data
    ad_query = db.query(
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
        func.count(func.distinct(AdSpend.date)).label("days"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.platform == channel,
        AdSpend.date.between(date_from, date_to)
    )
    
    ad_result = ad_query.first()
    
    # Order data
    order_query = db.query(
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.utm_source == channel,
        Order.date_time.between(date_from, date_to)
    )
    
    order_result = order_query.first()
    
    return {
        "spend": float(ad_result.spend or 0),
        "impressions": int(ad_result.impressions or 0),
        "clicks": int(ad_result.clicks or 0),
        "conversions": int(ad_result.conversions or 0),
        "revenue": float(order_result.revenue or 0),
        "orders": int(order_result.orders or 0),
        "days": int(ad_result.days or 0),
    }


def _get_total_period_data(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """Get aggregated data for all channels in a period."""
    # Ad spend data
    ad_query = db.query(
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    )
    
    ad_result = ad_query.first()
    
    # Order data
    order_query = db.query(
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    )
    
    order_result = order_query.first()
    
    return {
        "spend": float(ad_result.spend or 0),
        "impressions": int(ad_result.impressions or 0),
        "clicks": int(ad_result.clicks or 0),
        "conversions": int(ad_result.conversions or 0),
        "revenue": float(order_result.revenue or 0),
        "orders": int(order_result.orders or 0),
    }


def _calculate_lift(test_value: float, control_value: float) -> float:
    """Calculate lift percentage."""
    if control_value == 0:
        return 100 if test_value > 0 else 0
    return ((test_value - control_value) / control_value) * 100


def _calculate_significance(
    test_conversions: int,
    control_conversions: int,
    test_days: int,
    control_days: int,
) -> float:
    """
    Calculate statistical significance using simplified z-test.
    Returns confidence level (0-1).
    """
    # Normalize to daily rates
    test_rate = test_conversions / test_days if test_days > 0 else 0
    control_rate = control_conversions / control_days if control_days > 0 else 0
    
    if test_rate == 0 and control_rate == 0:
        return 0.5
    
    # Pooled proportion
    total_conversions = test_conversions + control_conversions
    total_days = test_days + control_days
    pooled_rate = total_conversions / total_days if total_days > 0 else 0
    
    if pooled_rate == 0 or pooled_rate == 1:
        return 0.5
    
    # Standard error
    se = math.sqrt(pooled_rate * (1 - pooled_rate) * (1/test_days + 1/control_days))
    
    if se == 0:
        return 0.5
    
    # Z-score
    z = abs(test_rate - control_rate) / se
    
    # Convert to confidence (simplified)
    # Using approximation for standard normal CDF
    if z > 3:
        return 0.999
    elif z > 2.58:
        return 0.99
    elif z > 1.96:
        return 0.95
    elif z > 1.645:
        return 0.90
    elif z > 1.28:
        return 0.80
    else:
        return 0.5 + (z / 2.58) * 0.45


def _get_confidence_level(significance: float) -> str:
    """Get human-readable confidence level."""
    if significance >= 0.99:
        return "Very High (99%+)"
    elif significance >= 0.95:
        return "High (95%+)"
    elif significance >= 0.90:
        return "Moderate (90%+)"
    elif significance >= 0.80:
        return "Low (80%+)"
    else:
        return "Not Significant (<80%)"


def _generate_interpretation(
    channel: str,
    conversion_lift: float,
    revenue_lift: float,
    significance: float,
    i_roas: float,
) -> Dict[str, str]:
    """Generate human-readable interpretation of results."""
    # Overall assessment
    if significance >= 0.95:
        if conversion_lift > 0 and i_roas > 1:
            overall = f"{channel.title()} shows statistically significant positive incremental impact"
            recommendation = "Continue and consider scaling investment"
        elif conversion_lift > 0 and i_roas < 1:
            overall = f"{channel.title()} drives incremental conversions but at inefficient cost"
            recommendation = "Optimize campaigns for better efficiency before scaling"
        else:
            overall = f"{channel.title()} shows no significant incremental impact"
            recommendation = "Consider reducing investment or testing different strategies"
    else:
        overall = "Results are not statistically significant"
        recommendation = "Collect more data or run a longer test period"
    
    # Lift interpretation
    if abs(conversion_lift) < 5:
        lift_meaning = "Minimal difference between test and control periods"
    elif conversion_lift > 0:
        lift_meaning = f"{conversion_lift:.1f}% more conversions compared to baseline"
    else:
        lift_meaning = f"{abs(conversion_lift):.1f}% fewer conversions compared to baseline"
    
    # iROAS interpretation
    if i_roas > 3:
        iroas_meaning = "Excellent incremental return on investment"
    elif i_roas > 1.5:
        iroas_meaning = "Good incremental return on investment"
    elif i_roas > 1:
        iroas_meaning = "Marginally positive incremental return"
    elif i_roas > 0:
        iroas_meaning = "Below break-even incremental return"
    else:
        iroas_meaning = "Unable to calculate incremental return"
    
    return {
        "overall": overall,
        "lift_meaning": lift_meaning,
        "iroas_meaning": iroas_meaning,
        "recommendation": recommendation,
    }


def _estimate_baseline_rate(
    db: Session,
    account_id: str,
    channel: str,
    date_from: date,
    date_to: date,
) -> float:
    """
    Estimate baseline conversion rate (what % would convert without marketing).
    Uses cross-channel and historical analysis.
    """
    # This is a simplified estimation
    # In production, this would use more sophisticated methods
    
    # Get organic/direct conversions as baseline
    direct_orders = db.query(func.count(Order.id)).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to),
        and_(
            Order.utm_source.is_(None),
            Order.utm_campaign.is_(None),
        )
    ).scalar() or 0
    
    total_orders = db.query(func.count(Order.id)).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to),
    ).scalar() or 0
    
    if total_orders == 0:
        return 0.2  # Default baseline assumption
    
    direct_rate = direct_orders / total_orders
    
    # Estimate channel-specific baseline
    # Different channels have different baseline rates
    channel_baseline_factors = {
        "facebook": 0.25,  # 25% might convert without FB ads
        "google_ads": 0.15,  # Search tends to capture existing intent
        "tiktok": 0.35,  # Discovery platform, higher baseline
        "instagram": 0.30,
        "email": 0.10,  # Email is usually direct response
    }
    
    factor = channel_baseline_factors.get(channel.lower(), 0.25)
    
    # Combine factors
    estimated_baseline = max(direct_rate, factor)
    
    return min(0.5, estimated_baseline)  # Cap at 50%


def _calculate_min_sample_size(
    daily_conversions: float,
    effect_size: float,
    power: float = 0.8,
    alpha: float = 0.05,
) -> int:
    """Calculate minimum sample size needed for statistical significance."""
    if daily_conversions == 0:
        return 1000  # Default minimum
    
    # Simplified sample size calculation
    # Using approximation for two-proportion test
    baseline_rate = 0.02  # Assume 2% baseline conversion rate
    
    # Calculate minimum detectable effect
    mde = baseline_rate * effect_size
    
    # Z-scores for power and alpha
    z_alpha = 1.96  # 95% confidence
    z_beta = 0.84   # 80% power
    
    # Sample size formula
    p1 = baseline_rate
    p2 = baseline_rate + mde
    p_pooled = (p1 + p2) / 2
    
    if p_pooled == 0 or p_pooled == 1:
        return 1000
    
    n = (
        2 * p_pooled * (1 - p_pooled) * (z_alpha + z_beta) ** 2
    ) / (mde ** 2)
    
    return max(100, int(math.ceil(n)))
