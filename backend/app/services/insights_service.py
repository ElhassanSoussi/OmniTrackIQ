"""
AI-powered insights service.
Provides anomaly explanations, predictive alerts, and intelligent recommendations.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
from collections import defaultdict
from enum import Enum
import statistics
import math

from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


class InsightType(str, Enum):
    """Types of AI-generated insights."""
    ANOMALY_EXPLANATION = "anomaly_explanation"
    TREND_ANALYSIS = "trend_analysis"
    PERFORMANCE_ALERT = "performance_alert"
    OPTIMIZATION_SUGGESTION = "optimization_suggestion"
    FORECAST = "forecast"
    CORRELATION = "correlation"
    BUDGET_RECOMMENDATION = "budget_recommendation"


class InsightPriority(str, Enum):
    """Priority levels for insights."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class InsightCategory(str, Enum):
    """Categories of insights."""
    REVENUE = "revenue"
    SPEND = "spend"
    EFFICIENCY = "efficiency"
    GROWTH = "growth"
    RISK = "risk"


def generate_insights(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    include_forecasts: bool = True,
    include_recommendations: bool = True,
) -> Dict[str, Any]:
    """
    Generate AI-powered insights for the account.
    Analyzes trends, detects patterns, and provides actionable recommendations.
    """
    insights = []
    
    # Get historical data for analysis
    daily_data = _get_daily_data(db, account_id, date_from, date_to)
    channel_data = _get_channel_performance(db, account_id, date_from, date_to)
    
    if len(daily_data) < 7:
        return {
            "insights": [],
            "summary": {
                "total_insights": 0,
                "by_priority": {},
                "by_category": {},
            },
            "message": "Insufficient data for insights generation (need at least 7 days)",
            "date_range": {"from": str(date_from), "to": str(date_to)},
        }
    
    # Generate trend insights
    trend_insights = _analyze_trends(daily_data)
    insights.extend(trend_insights)
    
    # Generate channel performance insights
    channel_insights = _analyze_channel_performance(channel_data)
    insights.extend(channel_insights)
    
    # Generate efficiency insights
    efficiency_insights = _analyze_efficiency(daily_data, channel_data)
    insights.extend(efficiency_insights)
    
    # Generate correlation insights
    correlation_insights = _find_correlations(daily_data)
    insights.extend(correlation_insights)
    
    # Generate forecasts
    if include_forecasts:
        forecast_insights = _generate_forecasts(daily_data)
        insights.extend(forecast_insights)
    
    # Generate recommendations
    if include_recommendations:
        recommendation_insights = _generate_recommendations(channel_data, daily_data)
        insights.extend(recommendation_insights)
    
    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    insights.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 4))
    
    # Build summary
    summary = _build_insights_summary(insights)
    
    return {
        "insights": insights,
        "summary": summary,
        "date_range": {"from": str(date_from), "to": str(date_to)},
        "generated_at": datetime.utcnow().isoformat(),
    }


def explain_anomaly(
    db: Session,
    account_id: str,
    anomaly_date: date,
    metric: str,
    anomaly_type: str,  # spike or drop
) -> Dict[str, Any]:
    """
    Generate an AI explanation for a specific anomaly.
    Analyzes potential causes and provides context.
    """
    # Get data around the anomaly date
    context_start = anomaly_date - timedelta(days=14)
    context_end = anomaly_date + timedelta(days=3)
    
    daily_data = _get_daily_data(db, account_id, context_start, context_end)
    channel_data = _get_channel_performance(db, account_id, context_start, context_end)
    
    # Find the anomaly day data
    anomaly_day = next((d for d in daily_data if d["date"] == str(anomaly_date)), None)
    
    if not anomaly_day:
        return {
            "explanation": "Unable to find data for the specified date",
            "possible_causes": [],
            "recommendations": [],
        }
    
    # Analyze potential causes
    possible_causes = []
    recommendations = []
    confidence = 0.5
    
    # Get baseline (previous 7 days excluding anomaly)
    baseline_days = [d for d in daily_data if d["date"] < str(anomaly_date)][-7:]
    
    if not baseline_days:
        return {
            "explanation": "Insufficient baseline data for explanation",
            "possible_causes": [],
            "recommendations": [],
        }
    
    # Calculate baseline averages
    baseline_avg = {
        key: statistics.mean([d.get(key, 0) for d in baseline_days])
        for key in ["spend", "revenue", "impressions", "clicks", "conversions"]
    }
    
    # Analyze spend changes
    spend_change = _calculate_change(anomaly_day.get("spend", 0), baseline_avg.get("spend", 0))
    if metric in ["revenue", "conversions", "roas"]:
        if anomaly_type == "drop" and spend_change < -20:
            possible_causes.append({
                "cause": "Significant decrease in ad spend",
                "evidence": f"Ad spend decreased by {abs(spend_change):.1f}% compared to baseline",
                "confidence": 0.85,
            })
            recommendations.append("Review budget allocation and consider restoring spend to previous levels")
            confidence = max(confidence, 0.85)
        elif anomaly_type == "spike" and spend_change > 30:
            possible_causes.append({
                "cause": "Increased ad spend driving higher performance",
                "evidence": f"Ad spend increased by {spend_change:.1f}% compared to baseline",
                "confidence": 0.8,
            })
            recommendations.append("Monitor efficiency metrics (ROAS, CPA) to ensure spend increase is profitable")
            confidence = max(confidence, 0.8)
    
    # Analyze channel shifts
    channel_analysis = _analyze_channel_shifts(db, account_id, anomaly_date)
    if channel_analysis:
        possible_causes.extend(channel_analysis["causes"])
        recommendations.extend(channel_analysis["recommendations"])
        confidence = max(confidence, channel_analysis.get("confidence", 0.5))
    
    # Analyze day-of-week patterns
    dow_analysis = _analyze_day_of_week(daily_data, anomaly_date)
    if dow_analysis:
        possible_causes.append(dow_analysis)
        confidence = max(confidence, dow_analysis.get("confidence", 0.5))
    
    # Analyze external factors (seasonal, etc.)
    external_analysis = _check_external_factors(anomaly_date, metric, anomaly_type)
    if external_analysis:
        possible_causes.append(external_analysis)
    
    # Generate explanation summary
    explanation = _generate_explanation_text(
        metric, anomaly_type, anomaly_day, baseline_avg, possible_causes
    )
    
    return {
        "metric": metric,
        "date": str(anomaly_date),
        "anomaly_type": anomaly_type,
        "explanation": explanation,
        "possible_causes": possible_causes[:5],  # Top 5 causes
        "recommendations": recommendations[:3],  # Top 3 recommendations
        "confidence_score": round(confidence, 2),
        "context": {
            "anomaly_value": anomaly_day.get(metric, 0),
            "baseline_average": round(baseline_avg.get(metric, 0), 2),
            "change_percent": round(_calculate_change(
                anomaly_day.get(metric, 0), baseline_avg.get(metric, 0)
            ), 1),
        },
    }


def get_predictive_alerts(
    db: Session,
    account_id: str,
    days_ahead: int = 7,
) -> List[Dict[str, Any]]:
    """
    Generate predictive alerts based on trend analysis.
    Warns about potential issues before they become critical.
    """
    # Get historical data for trend analysis
    today = date.today()
    historical_start = today - timedelta(days=60)
    
    daily_data = _get_daily_data(db, account_id, historical_start, today)
    
    if len(daily_data) < 14:
        return []
    
    alerts = []
    
    # Analyze each key metric for concerning trends
    metrics_to_analyze = ["revenue", "roas", "conversions", "spend"]
    
    for metric in metrics_to_analyze:
        values = [d.get(metric, 0) for d in daily_data]
        
        # Calculate trend
        trend = _calculate_trend(values[-14:])  # Last 2 weeks
        recent_trend = _calculate_trend(values[-7:])  # Last week
        
        # Get forecast
        forecast = _simple_forecast(values, days_ahead)
        
        # Check for concerning patterns
        alert = _evaluate_metric_risk(metric, values, trend, recent_trend, forecast)
        if alert:
            alerts.append(alert)
    
    # Sort by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    alerts.sort(key=lambda x: severity_order.get(x.get("severity", "low"), 4))
    
    return alerts


def _get_daily_data(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> List[Dict[str, Any]]:
    """Get daily aggregated data for analysis."""
    # Query ad spend
    ad_query = db.query(
        AdSpend.date,
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    ).group_by(AdSpend.date)
    
    ad_data = {
        str(row.date): {
            "spend": float(row.spend or 0),
            "impressions": int(row.impressions or 0),
            "clicks": int(row.clicks or 0),
            "conversions": int(row.conversions or 0),
        }
        for row in ad_query.all()
    }
    
    # Query orders
    order_query = db.query(
        func.date(Order.date_time).label("date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    ).group_by(func.date(Order.date_time))
    
    order_data = {
        str(row.date): {
            "revenue": float(row.revenue or 0),
            "orders": int(row.orders or 0),
        }
        for row in order_query.all()
    }
    
    # Combine data
    all_dates = sorted(set(list(ad_data.keys()) + list(order_data.keys())))
    
    daily_metrics = []
    for d in all_dates:
        ad = ad_data.get(d, {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0})
        order = order_data.get(d, {"revenue": 0, "orders": 0})
        
        spend = ad["spend"]
        revenue = order["revenue"]
        
        daily_metrics.append({
            "date": d,
            "spend": spend,
            "revenue": revenue,
            "roas": revenue / spend if spend > 0 else 0,
            "impressions": ad["impressions"],
            "clicks": ad["clicks"],
            "conversions": ad["conversions"],
            "orders": order["orders"],
            "ctr": (ad["clicks"] / ad["impressions"] * 100) if ad["impressions"] > 0 else 0,
            "cpc": spend / ad["clicks"] if ad["clicks"] > 0 else 0,
            "cpa": spend / ad["conversions"] if ad["conversions"] > 0 else 0,
        })
    
    return daily_metrics


def _get_channel_performance(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> List[Dict[str, Any]]:
    """Get performance data by channel."""
    # Ad spend by platform
    ad_query = db.query(
        AdSpend.platform,
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    ).group_by(AdSpend.platform)
    
    channels = {}
    for row in ad_query.all():
        channels[row.platform] = {
            "channel": row.platform,
            "spend": float(row.spend or 0),
            "impressions": int(row.impressions or 0),
            "clicks": int(row.clicks or 0),
            "conversions": int(row.conversions or 0),
        }
    
    # Orders by source
    order_query = db.query(
        Order.utm_source,
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to),
        Order.utm_source.isnot(None),
    ).group_by(Order.utm_source)
    
    for row in order_query.all():
        source = row.utm_source or "direct"
        if source in channels:
            channels[source]["revenue"] = float(row.revenue or 0)
            channels[source]["orders"] = int(row.orders or 0)
        else:
            channels[source] = {
                "channel": source,
                "spend": 0,
                "revenue": float(row.revenue or 0),
                "orders": int(row.orders or 0),
                "impressions": 0,
                "clicks": 0,
                "conversions": 0,
            }
    
    # Calculate derived metrics
    for channel, data in channels.items():
        spend = data.get("spend", 0)
        revenue = data.get("revenue", 0)
        clicks = data.get("clicks", 0)
        impressions = data.get("impressions", 0)
        conversions = data.get("conversions", 0)
        
        data["roas"] = revenue / spend if spend > 0 else 0
        data["ctr"] = (clicks / impressions * 100) if impressions > 0 else 0
        data["cpc"] = spend / clicks if clicks > 0 else 0
        data["cpa"] = spend / conversions if conversions > 0 else 0
    
    return list(channels.values())


def _analyze_trends(daily_data: List[Dict]) -> List[Dict]:
    """Analyze trends in the data and generate insights."""
    insights = []
    
    if len(daily_data) < 7:
        return insights
    
    # Revenue trend analysis
    revenue_values = [d.get("revenue", 0) for d in daily_data]
    revenue_trend = _calculate_trend(revenue_values[-7:])
    
    if revenue_trend > 10:
        insights.append({
            "type": InsightType.TREND_ANALYSIS.value,
            "category": InsightCategory.GROWTH.value,
            "priority": InsightPriority.MEDIUM.value,
            "title": "Revenue Uptrend",
            "description": f"Revenue is trending upward with a {revenue_trend:.1f}% weekly growth rate",
            "metric": "revenue",
            "value": revenue_trend,
            "action": "Consider scaling successful campaigns to capitalize on momentum",
        })
    elif revenue_trend < -10:
        insights.append({
            "type": InsightType.TREND_ANALYSIS.value,
            "category": InsightCategory.RISK.value,
            "priority": InsightPriority.HIGH.value,
            "title": "Revenue Decline",
            "description": f"Revenue is declining at {abs(revenue_trend):.1f}% weekly rate",
            "metric": "revenue",
            "value": revenue_trend,
            "action": "Review campaign performance and investigate causes of decline",
        })
    
    # ROAS trend
    roas_values = [d.get("roas", 0) for d in daily_data]
    roas_trend = _calculate_trend(roas_values[-7:])
    
    if roas_trend < -15:
        insights.append({
            "type": InsightType.PERFORMANCE_ALERT.value,
            "category": InsightCategory.EFFICIENCY.value,
            "priority": InsightPriority.HIGH.value,
            "title": "ROAS Declining",
            "description": f"Return on ad spend is declining at {abs(roas_trend):.1f}% weekly rate",
            "metric": "roas",
            "value": roas_trend,
            "action": "Review ad creatives, targeting, and landing pages for optimization opportunities",
        })
    
    # Spend efficiency
    spend_values = [d.get("spend", 0) for d in daily_data]
    spend_trend = _calculate_trend(spend_values[-7:])
    
    if spend_trend > 20 and roas_trend < -5:
        insights.append({
            "type": InsightType.PERFORMANCE_ALERT.value,
            "category": InsightCategory.RISK.value,
            "priority": InsightPriority.CRITICAL.value,
            "title": "Spend Increasing, Efficiency Decreasing",
            "description": f"Ad spend is up {spend_trend:.1f}% but ROAS is down {abs(roas_trend):.1f}%",
            "metric": "efficiency",
            "value": {"spend_trend": spend_trend, "roas_trend": roas_trend},
            "action": "Immediately review campaign budgets and pause underperforming campaigns",
        })
    
    return insights


def _analyze_channel_performance(channel_data: List[Dict]) -> List[Dict]:
    """Analyze channel performance and generate insights."""
    insights = []
    
    if not channel_data:
        return insights
    
    # Find best and worst performing channels by ROAS
    channels_with_spend = [c for c in channel_data if c.get("spend", 0) > 0]
    
    if len(channels_with_spend) >= 2:
        sorted_by_roas = sorted(channels_with_spend, key=lambda x: x.get("roas", 0), reverse=True)
        
        best = sorted_by_roas[0]
        worst = sorted_by_roas[-1]
        
        if best["roas"] > 3 and worst["roas"] < 1:
            insights.append({
                "type": InsightType.OPTIMIZATION_SUGGESTION.value,
                "category": InsightCategory.EFFICIENCY.value,
                "priority": InsightPriority.HIGH.value,
                "title": "Channel Efficiency Gap",
                "description": f"{best['channel'].title()} has {best['roas']:.1f}x ROAS vs {worst['channel'].title()} at {worst['roas']:.1f}x",
                "metric": "roas",
                "value": {"best": best["channel"], "worst": worst["channel"]},
                "action": f"Consider reallocating budget from {worst['channel'].title()} to {best['channel'].title()}",
            })
        
        # Check for underperforming channels
        avg_roas = statistics.mean([c.get("roas", 0) for c in channels_with_spend])
        for channel in channels_with_spend:
            if channel["roas"] < avg_roas * 0.5 and channel["spend"] > 100:
                insights.append({
                    "type": InsightType.PERFORMANCE_ALERT.value,
                    "category": InsightCategory.RISK.value,
                    "priority": InsightPriority.MEDIUM.value,
                    "title": f"{channel['channel'].title()} Underperforming",
                    "description": f"{channel['channel'].title()} ROAS ({channel['roas']:.1f}x) is significantly below average ({avg_roas:.1f}x)",
                    "metric": "roas",
                    "value": {"channel": channel["channel"], "roas": channel["roas"]},
                    "action": f"Review {channel['channel'].title()} campaigns for optimization or budget reduction",
                })
    
    return insights


def _analyze_efficiency(daily_data: List[Dict], channel_data: List[Dict]) -> List[Dict]:
    """Analyze overall efficiency metrics."""
    insights = []
    
    if len(daily_data) < 7:
        return insights
    
    # Calculate recent averages
    recent_data = daily_data[-7:]
    
    avg_cpa = statistics.mean([d.get("cpa", 0) for d in recent_data if d.get("cpa", 0) > 0] or [0])
    avg_roas = statistics.mean([d.get("roas", 0) for d in recent_data if d.get("roas", 0) > 0] or [0])
    avg_ctr = statistics.mean([d.get("ctr", 0) for d in recent_data if d.get("ctr", 0) > 0] or [0])
    
    # CTR analysis
    if avg_ctr < 0.5:
        insights.append({
            "type": InsightType.OPTIMIZATION_SUGGESTION.value,
            "category": InsightCategory.EFFICIENCY.value,
            "priority": InsightPriority.MEDIUM.value,
            "title": "Low Click-Through Rate",
            "description": f"Average CTR of {avg_ctr:.2f}% is below industry benchmark (1-2%)",
            "metric": "ctr",
            "value": avg_ctr,
            "action": "Test new ad creatives, improve ad copy, and refine targeting",
        })
    
    # CPA analysis
    if avg_roas > 0:
        # Compare recent vs historical
        if len(daily_data) >= 14:
            historical_roas = statistics.mean([d.get("roas", 0) for d in daily_data[-14:-7] if d.get("roas", 0) > 0] or [0])
            if historical_roas > 0 and avg_roas < historical_roas * 0.8:
                insights.append({
                    "type": InsightType.PERFORMANCE_ALERT.value,
                    "category": InsightCategory.EFFICIENCY.value,
                    "priority": InsightPriority.HIGH.value,
                    "title": "Efficiency Decline vs Previous Week",
                    "description": f"ROAS dropped from {historical_roas:.1f}x to {avg_roas:.1f}x week-over-week",
                    "metric": "roas",
                    "value": {"current": avg_roas, "previous": historical_roas},
                    "action": "Investigate campaign changes, audience fatigue, or competitive pressure",
                })
    
    return insights


def _find_correlations(daily_data: List[Dict]) -> List[Dict]:
    """Find correlations between metrics."""
    insights = []
    
    if len(daily_data) < 14:
        return insights
    
    # Analyze spend vs revenue correlation
    spend_values = [d.get("spend", 0) for d in daily_data]
    revenue_values = [d.get("revenue", 0) for d in daily_data]
    
    if len(spend_values) > 7 and max(spend_values) > 0:
        correlation = _calculate_correlation(spend_values, revenue_values)
        
        if correlation < 0.3 and sum(spend_values) > 0:
            insights.append({
                "type": InsightType.CORRELATION.value,
                "category": InsightCategory.EFFICIENCY.value,
                "priority": InsightPriority.MEDIUM.value,
                "title": "Weak Spend-Revenue Correlation",
                "description": f"Ad spend and revenue have low correlation ({correlation:.2f}). Spend increases may not drive proportional revenue.",
                "metric": "correlation",
                "value": correlation,
                "action": "Review targeting and campaign effectiveness before scaling spend",
            })
    
    return insights


def _generate_forecasts(daily_data: List[Dict]) -> List[Dict]:
    """Generate forecasts for key metrics."""
    insights = []
    
    if len(daily_data) < 14:
        return insights
    
    # Forecast revenue
    revenue_values = [d.get("revenue", 0) for d in daily_data]
    forecast_7d = _simple_forecast(revenue_values, 7)
    
    recent_avg = statistics.mean(revenue_values[-7:]) if revenue_values else 0
    
    if recent_avg > 0:
        forecast_change = ((forecast_7d - recent_avg) / recent_avg) * 100
        
        if forecast_change < -15:
            insights.append({
                "type": InsightType.FORECAST.value,
                "category": InsightCategory.RISK.value,
                "priority": InsightPriority.HIGH.value,
                "title": "Revenue Forecast: Declining",
                "description": f"Based on current trends, revenue may decrease by {abs(forecast_change):.1f}% over the next week",
                "metric": "revenue",
                "value": {"forecast": forecast_7d, "current_avg": recent_avg, "change_percent": forecast_change},
                "action": "Proactively review campaigns and consider optimization before decline materializes",
            })
        elif forecast_change > 20:
            insights.append({
                "type": InsightType.FORECAST.value,
                "category": InsightCategory.GROWTH.value,
                "priority": InsightPriority.MEDIUM.value,
                "title": "Revenue Forecast: Growing",
                "description": f"Based on current trends, revenue may increase by {forecast_change:.1f}% over the next week",
                "metric": "revenue",
                "value": {"forecast": forecast_7d, "current_avg": recent_avg, "change_percent": forecast_change},
                "action": "Ensure inventory and support are ready for increased demand",
            })
    
    return insights


def _generate_recommendations(channel_data: List[Dict], daily_data: List[Dict]) -> List[Dict]:
    """Generate budget and optimization recommendations."""
    insights = []
    
    if not channel_data:
        return insights
    
    total_spend = sum(c.get("spend", 0) for c in channel_data)
    
    if total_spend == 0:
        return insights
    
    # Identify budget reallocation opportunities
    channels_with_spend = [c for c in channel_data if c.get("spend", 0) > 0 and c.get("roas", 0) > 0]
    
    if len(channels_with_spend) >= 2:
        avg_roas = statistics.mean([c["roas"] for c in channels_with_spend])
        
        # Find channels to scale up
        scale_up = [c for c in channels_with_spend if c["roas"] > avg_roas * 1.5]
        # Find channels to scale down
        scale_down = [c for c in channels_with_spend if c["roas"] < avg_roas * 0.5]
        
        if scale_up and scale_down:
            scale_up_names = ", ".join([c["channel"].title() for c in scale_up])
            scale_down_names = ", ".join([c["channel"].title() for c in scale_down])
            
            potential_improvement = sum(c["spend"] for c in scale_down) * (avg_roas - statistics.mean([c["roas"] for c in scale_down]))
            
            insights.append({
                "type": InsightType.BUDGET_RECOMMENDATION.value,
                "category": InsightCategory.EFFICIENCY.value,
                "priority": InsightPriority.HIGH.value,
                "title": "Budget Reallocation Opportunity",
                "description": f"Shifting budget from {scale_down_names} to {scale_up_names} could improve overall ROAS",
                "metric": "budget",
                "value": {
                    "scale_up": [c["channel"] for c in scale_up],
                    "scale_down": [c["channel"] for c in scale_down],
                    "potential_improvement": round(potential_improvement, 2),
                },
                "action": f"Reallocate budget from underperforming channels to high-ROAS channels",
            })
    
    return insights


def _calculate_trend(values: List[float]) -> float:
    """Calculate trend percentage using simple linear regression."""
    if len(values) < 2:
        return 0
    
    n = len(values)
    sum_x = sum(range(n))
    sum_y = sum(values)
    sum_xy = sum(i * v for i, v in enumerate(values))
    sum_x2 = sum(i * i for i in range(n))
    
    denominator = n * sum_x2 - sum_x * sum_x
    if denominator == 0:
        return 0
    
    slope = (n * sum_xy - sum_x * sum_y) / denominator
    
    # Convert to percentage
    avg = sum_y / n if n > 0 else 1
    if avg == 0:
        return 0
    
    return (slope / avg) * 100 * n


def _simple_forecast(values: List[float], days_ahead: int) -> float:
    """Generate a simple forecast based on recent trends."""
    if len(values) < 7:
        return statistics.mean(values) if values else 0
    
    # Use weighted moving average with trend adjustment
    recent = values[-7:]
    weights = [1, 1, 2, 2, 3, 3, 4]  # More weight on recent days
    weighted_avg = sum(v * w for v, w in zip(recent, weights)) / sum(weights)
    
    # Calculate trend
    trend = _calculate_trend(recent)
    
    # Apply trend to forecast
    daily_trend = trend / 100 / 7
    forecast = weighted_avg * (1 + daily_trend * days_ahead)
    
    return max(0, forecast)


def _calculate_change(current: float, baseline: float) -> float:
    """Calculate percentage change from baseline."""
    if baseline == 0:
        return 100 if current > 0 else 0
    return ((current - baseline) / baseline) * 100


def _calculate_correlation(x: List[float], y: List[float]) -> float:
    """Calculate Pearson correlation coefficient."""
    if len(x) != len(y) or len(x) < 2:
        return 0
    
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    numerator = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    
    std_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    std_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))
    
    if std_x == 0 or std_y == 0:
        return 0
    
    return numerator / (std_x * std_y)


def _analyze_channel_shifts(
    db: Session,
    account_id: str,
    anomaly_date: date,
) -> Optional[Dict]:
    """Analyze if there were significant channel mix shifts."""
    # Compare anomaly day vs previous days
    prev_start = anomaly_date - timedelta(days=7)
    prev_end = anomaly_date - timedelta(days=1)
    
    prev_data = _get_channel_performance(db, account_id, prev_start, prev_end)
    curr_data = _get_channel_performance(db, account_id, anomaly_date, anomaly_date)
    
    causes = []
    recommendations = []
    
    prev_by_channel = {c["channel"]: c for c in prev_data}
    curr_by_channel = {c["channel"]: c for c in curr_data}
    
    for channel, curr in curr_by_channel.items():
        prev = prev_by_channel.get(channel, {})
        prev_spend = prev.get("spend", 0) / 7  # Daily average
        curr_spend = curr.get("spend", 0)
        
        if prev_spend > 0:
            change = ((curr_spend - prev_spend) / prev_spend) * 100
            if abs(change) > 50:
                direction = "increased" if change > 0 else "decreased"
                causes.append({
                    "cause": f"{channel.title()} spend {direction} significantly",
                    "evidence": f"Spend changed by {change:.1f}% compared to 7-day average",
                    "confidence": 0.7,
                })
    
    return {
        "causes": causes,
        "recommendations": recommendations,
        "confidence": 0.7 if causes else 0.3,
    } if causes else None


def _analyze_day_of_week(daily_data: List[Dict], anomaly_date: date) -> Optional[Dict]:
    """Check if the anomaly aligns with day-of-week patterns."""
    dow = anomaly_date.weekday()
    dow_name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dow]
    
    # Filter data to same day of week
    same_dow_data = [
        d for d in daily_data 
        if datetime.strptime(d["date"], "%Y-%m-%d").weekday() == dow
    ]
    
    if len(same_dow_data) < 3:
        return None
    
    # This day of week typically shows different patterns
    if dow in [5, 6]:  # Weekend
        return {
            "cause": f"Weekend effect ({dow_name})",
            "evidence": "Weekends often show different performance patterns",
            "confidence": 0.5,
        }
    
    return None


def _check_external_factors(anomaly_date: date, metric: str, anomaly_type: str) -> Optional[Dict]:
    """Check for known external factors that might explain the anomaly."""
    month = anomaly_date.month
    day = anomaly_date.day
    
    # Check for major shopping events
    shopping_events = {
        (11, 24): "Black Friday",
        (11, 25): "Black Friday Weekend",
        (11, 26): "Black Friday Weekend",
        (11, 27): "Cyber Monday",
        (12, 24): "Christmas Eve",
        (12, 25): "Christmas Day",
        (12, 26): "Boxing Day",
        (1, 1): "New Year's Day",
    }
    
    event = shopping_events.get((month, day))
    if event:
        return {
            "cause": f"Holiday/Event: {event}",
            "evidence": f"{event} typically causes unusual shopping patterns",
            "confidence": 0.9,
        }
    
    return None


def _generate_explanation_text(
    metric: str,
    anomaly_type: str,
    anomaly_day: Dict,
    baseline_avg: Dict,
    possible_causes: List[Dict],
) -> str:
    """Generate a human-readable explanation."""
    metric_labels = {
        "revenue": "Revenue",
        "spend": "Ad spend",
        "roas": "ROAS",
        "conversions": "Conversions",
        "ctr": "Click-through rate",
        "cpc": "Cost per click",
    }
    
    metric_label = metric_labels.get(metric, metric)
    direction = "increased" if anomaly_type == "spike" else "decreased"
    
    change = _calculate_change(anomaly_day.get(metric, 0), baseline_avg.get(metric, 0))
    
    explanation = f"{metric_label} {direction} by {abs(change):.1f}% compared to the baseline average. "
    
    if possible_causes:
        top_cause = possible_causes[0]
        explanation += f"The most likely cause is: {top_cause['cause'].lower()}. "
    else:
        explanation += "No clear single cause was identified; this may be due to multiple factors. "
    
    return explanation


def _evaluate_metric_risk(
    metric: str,
    values: List[float],
    trend: float,
    recent_trend: float,
    forecast: float,
) -> Optional[Dict]:
    """Evaluate if a metric shows concerning risk patterns."""
    recent_avg = statistics.mean(values[-7:]) if len(values) >= 7 else 0
    
    if recent_avg == 0:
        return None
    
    risk_configs = {
        "revenue": {"threshold": -15, "direction": "down", "severity": "high"},
        "roas": {"threshold": -20, "direction": "down", "severity": "high"},
        "conversions": {"threshold": -15, "direction": "down", "severity": "medium"},
        "spend": {"threshold": 30, "direction": "up", "severity": "medium"},  # Unexpected spend increase
    }
    
    config = risk_configs.get(metric)
    if not config:
        return None
    
    # Check if trend exceeds threshold
    is_concerning = (
        (config["direction"] == "down" and trend < config["threshold"]) or
        (config["direction"] == "up" and trend > config["threshold"])
    )
    
    if not is_concerning:
        return None
    
    # Check if trend is accelerating
    is_accelerating = (
        (config["direction"] == "down" and recent_trend < trend) or
        (config["direction"] == "up" and recent_trend > trend)
    )
    
    severity = config["severity"]
    if is_accelerating:
        severity = "critical" if severity == "high" else "high"
    
    forecast_change = ((forecast - recent_avg) / recent_avg) * 100
    
    return {
        "metric": metric,
        "severity": severity,
        "title": f"Predictive Alert: {metric.title()} {'Declining' if config['direction'] == 'down' else 'Increasing'}",
        "description": f"{metric.title()} is trending {'down' if config['direction'] == 'down' else 'up'} at {abs(trend):.1f}% rate",
        "current_value": round(recent_avg, 2),
        "trend_percent": round(trend, 1),
        "forecast_7d": round(forecast, 2),
        "forecast_change_percent": round(forecast_change, 1),
        "is_accelerating": is_accelerating,
        "action": _get_metric_action(metric, config["direction"]),
    }


def _get_metric_action(metric: str, direction: str) -> str:
    """Get recommended action for a metric alert."""
    actions = {
        ("revenue", "down"): "Review campaign performance, check for technical issues, and analyze competitive landscape",
        ("roas", "down"): "Audit ad creatives, review targeting settings, and check for audience fatigue",
        ("conversions", "down"): "Check landing page performance, review conversion tracking, and analyze user journey",
        ("spend", "up"): "Review budget settings, check for runaway campaigns, and verify bid strategies",
    }
    return actions.get((metric, direction), "Review and monitor the situation")


def _build_insights_summary(insights: List[Dict]) -> Dict:
    """Build summary statistics for insights."""
    summary = {
        "total_insights": len(insights),
        "by_priority": {},
        "by_category": {},
        "by_type": {},
    }
    
    for insight in insights:
        priority = insight.get("priority", "low")
        category = insight.get("category", "other")
        insight_type = insight.get("type", "other")
        
        summary["by_priority"][priority] = summary["by_priority"].get(priority, 0) + 1
        summary["by_category"][category] = summary["by_category"].get(category, 0) + 1
        summary["by_type"][insight_type] = summary["by_type"].get(insight_type, 0) + 1
    
    return summary
