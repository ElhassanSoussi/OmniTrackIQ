"""
Anomaly detection service for marketing metrics.
Uses statistical methods to identify unusual patterns and alert users.
"""
from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from enum import Enum
import statistics

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


class AnomalyType(str, Enum):
    """Types of anomalies."""
    SPIKE = "spike"           # Unusually high value
    DROP = "drop"             # Unusually low value  
    TREND_CHANGE = "trend_change"  # Significant trend reversal
    ZERO_VALUE = "zero_value"      # Unexpected zero/missing data


class AnomalySeverity(str, Enum):
    """Severity levels for anomalies."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class MetricCategory(str, Enum):
    """Categories of metrics to monitor."""
    SPEND = "spend"
    REVENUE = "revenue"
    ROAS = "roas"
    CTR = "ctr"
    CPC = "cpc"
    CONVERSIONS = "conversions"
    IMPRESSIONS = "impressions"
    CLICKS = "clicks"


# Thresholds for anomaly detection (number of standard deviations)
ANOMALY_THRESHOLDS = {
    "low": 1.5,
    "medium": 2.0,
    "high": 2.5,
    "critical": 3.0,
}

# Metric-specific configuration
METRIC_CONFIG = {
    "spend": {
        "label": "Ad Spend",
        "format": "currency",
        "higher_is_worse": True,  # Spike in spend might be concerning
    },
    "revenue": {
        "label": "Revenue",
        "format": "currency",
        "higher_is_worse": False,  # Drop in revenue is concerning
    },
    "roas": {
        "label": "ROAS",
        "format": "number",
        "higher_is_worse": False,  # Drop in ROAS is concerning
    },
    "ctr": {
        "label": "CTR",
        "format": "percent",
        "higher_is_worse": False,  # Drop in CTR is concerning
    },
    "cpc": {
        "label": "CPC",
        "format": "currency",
        "higher_is_worse": True,  # Spike in CPC is concerning
    },
    "conversions": {
        "label": "Conversions",
        "format": "number",
        "higher_is_worse": False,  # Drop in conversions is concerning
    },
    "impressions": {
        "label": "Impressions",
        "format": "number",
        "higher_is_worse": False,
    },
    "clicks": {
        "label": "Clicks",
        "format": "number",
        "higher_is_worse": False,
    },
}


def detect_anomalies(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    metrics: Optional[List[str]] = None,
    platform: Optional[str] = None,
    sensitivity: str = "medium",  # low, medium, high
) -> Dict[str, Any]:
    """
    Detect anomalies in marketing metrics.
    
    Uses Z-score based detection comparing recent values to historical baseline.
    """
    # Default to all metrics if none specified
    if metrics is None:
        metrics = ["spend", "revenue", "roas", "ctr", "cpc", "conversions"]
    
    # Get threshold based on sensitivity
    sensitivity_map = {"low": "high", "medium": "medium", "high": "low"}
    threshold_key = sensitivity_map.get(sensitivity, "medium")
    z_threshold = ANOMALY_THRESHOLDS[threshold_key]
    
    # Get daily metrics for the period
    daily_data = _get_daily_metrics(db, account_id, date_from, date_to, platform)
    
    if len(daily_data) < 7:
        return {
            "anomalies": [],
            "summary": {
                "total_anomalies": 0,
                "by_severity": {},
                "by_metric": {},
            },
            "message": "Insufficient data for anomaly detection (need at least 7 days)",
            "date_range": {"from": str(date_from), "to": str(date_to)},
        }
    
    # Detect anomalies for each metric
    anomalies = []
    
    for metric in metrics:
        if metric not in METRIC_CONFIG:
            continue
            
        values = [d.get(metric, 0) for d in daily_data]
        dates = [d["date"] for d in daily_data]
        
        metric_anomalies = _detect_metric_anomalies(
            metric=metric,
            values=values,
            dates=dates,
            z_threshold=z_threshold,
        )
        anomalies.extend(metric_anomalies)
    
    # Sort by severity and date
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    anomalies.sort(key=lambda x: (severity_order.get(x["severity"], 4), x["date"]), reverse=True)
    
    # Build summary
    summary = _build_anomaly_summary(anomalies)
    
    return {
        "anomalies": anomalies,
        "summary": summary,
        "date_range": {"from": str(date_from), "to": str(date_to)},
        "sensitivity": sensitivity,
        "metrics_analyzed": metrics,
    }


def _get_daily_metrics(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    platform: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get daily aggregated metrics for the date range."""
    # Query ad spend metrics
    ad_query = db.query(
        AdSpend.date,
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    )
    
    if platform:
        ad_query = ad_query.filter(AdSpend.platform == platform)
    
    ad_data = {
        str(row.date): {
            "spend": float(row.spend or 0),
            "impressions": int(row.impressions or 0),
            "clicks": int(row.clicks or 0),
            "conversions": int(row.conversions or 0),
        }
        for row in ad_query.group_by(AdSpend.date).all()
    }
    
    # Query order metrics
    order_query = db.query(
        func.date(Order.date_time).label("date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    )
    
    if platform:
        order_query = order_query.filter(Order.utm_source == platform)
    
    order_data = {
        str(row.date): {
            "revenue": float(row.revenue or 0),
            "orders": int(row.orders or 0),
        }
        for row in order_query.group_by(func.date(Order.date_time)).all()
    }
    
    # Combine data for each date
    all_dates = sorted(set(list(ad_data.keys()) + list(order_data.keys())))
    
    daily_metrics = []
    for d in all_dates:
        ad = ad_data.get(d, {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0})
        order = order_data.get(d, {"revenue": 0, "orders": 0})
        
        spend = ad["spend"]
        revenue = order["revenue"]
        impressions = ad["impressions"]
        clicks = ad["clicks"]
        conversions = ad["conversions"]
        
        # Calculate derived metrics
        roas = revenue / spend if spend > 0 else 0
        ctr = (clicks / impressions * 100) if impressions > 0 else 0
        cpc = spend / clicks if clicks > 0 else 0
        
        daily_metrics.append({
            "date": d,
            "spend": spend,
            "revenue": revenue,
            "roas": roas,
            "ctr": ctr,
            "cpc": cpc,
            "conversions": conversions,
            "impressions": impressions,
            "clicks": clicks,
        })
    
    return daily_metrics


def _detect_metric_anomalies(
    metric: str,
    values: List[float],
    dates: List[str],
    z_threshold: float,
) -> List[Dict[str, Any]]:
    """Detect anomalies for a single metric using Z-score analysis."""
    if len(values) < 7:
        return []
    
    anomalies = []
    config = METRIC_CONFIG.get(metric, {})
    
    # Use rolling window for baseline (exclude last few days)
    window_size = min(21, len(values) - 3)  # 3-week baseline
    
    for i in range(window_size, len(values)):
        # Calculate baseline from previous days
        baseline_values = [v for v in values[max(0, i-window_size):i] if v > 0]
        
        if len(baseline_values) < 5:
            continue
        
        current_value = values[i]
        current_date = dates[i]
        
        # Skip if value is 0 or too small
        if current_value <= 0:
            # Check for unexpected zero
            if statistics.mean(baseline_values) > 10:
                anomalies.append({
                    "date": current_date,
                    "metric": metric,
                    "metric_label": config.get("label", metric),
                    "type": AnomalyType.ZERO_VALUE.value,
                    "severity": AnomalySeverity.HIGH.value,
                    "value": current_value,
                    "expected_value": round(statistics.mean(baseline_values), 2),
                    "deviation_percent": -100,
                    "description": f"Unexpected zero/missing {config.get('label', metric)}",
                })
            continue
        
        # Calculate Z-score
        mean = statistics.mean(baseline_values)
        if len(baseline_values) > 1:
            stdev = statistics.stdev(baseline_values)
        else:
            stdev = mean * 0.1  # Fallback
        
        if stdev == 0:
            stdev = mean * 0.1  # Avoid division by zero
        
        z_score = (current_value - mean) / stdev
        deviation_percent = ((current_value - mean) / mean * 100) if mean > 0 else 0
        
        # Determine if anomaly
        abs_z = abs(z_score)
        if abs_z >= z_threshold:
            # Determine type and severity
            is_spike = z_score > 0
            anomaly_type = AnomalyType.SPIKE if is_spike else AnomalyType.DROP
            
            # Determine severity based on Z-score
            if abs_z >= ANOMALY_THRESHOLDS["critical"]:
                severity = AnomalySeverity.CRITICAL
            elif abs_z >= ANOMALY_THRESHOLDS["high"]:
                severity = AnomalySeverity.HIGH
            elif abs_z >= ANOMALY_THRESHOLDS["medium"]:
                severity = AnomalySeverity.MEDIUM
            else:
                severity = AnomalySeverity.LOW
            
            # Adjust severity based on whether this is good or bad
            higher_is_worse = config.get("higher_is_worse", False)
            is_concerning = (is_spike and higher_is_worse) or (not is_spike and not higher_is_worse)
            
            # Build description
            direction = "increased" if is_spike else "decreased"
            description = f"{config.get('label', metric)} {direction} by {abs(deviation_percent):.1f}%"
            if is_concerning:
                description += " ⚠️"
            
            anomalies.append({
                "date": current_date,
                "metric": metric,
                "metric_label": config.get("label", metric),
                "type": anomaly_type.value,
                "severity": severity.value,
                "value": round(current_value, 2),
                "expected_value": round(mean, 2),
                "z_score": round(z_score, 2),
                "deviation_percent": round(deviation_percent, 1),
                "is_concerning": is_concerning,
                "description": description,
            })
    
    return anomalies


def _build_anomaly_summary(anomalies: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Build summary statistics for anomalies."""
    by_severity = {}
    by_metric = {}
    by_type = {}
    concerning_count = 0
    
    for a in anomalies:
        # By severity
        sev = a["severity"]
        by_severity[sev] = by_severity.get(sev, 0) + 1
        
        # By metric
        met = a["metric"]
        by_metric[met] = by_metric.get(met, 0) + 1
        
        # By type
        typ = a["type"]
        by_type[typ] = by_type.get(typ, 0) + 1
        
        # Concerning
        if a.get("is_concerning", False):
            concerning_count += 1
    
    return {
        "total_anomalies": len(anomalies),
        "concerning_anomalies": concerning_count,
        "by_severity": by_severity,
        "by_metric": by_metric,
        "by_type": by_type,
    }


def get_anomaly_trends(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    platform: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get historical anomaly trends - how anomalies have evolved over time.
    """
    # Get anomalies for the full period
    result = detect_anomalies(
        db=db,
        account_id=account_id,
        date_from=date_from,
        date_to=date_to,
        platform=platform,
        sensitivity="medium",
    )
    
    anomalies = result.get("anomalies", [])
    
    # Group by date
    by_date = {}
    for a in anomalies:
        d = a["date"]
        if d not in by_date:
            by_date[d] = {"date": d, "count": 0, "concerning": 0, "anomalies": []}
        by_date[d]["count"] += 1
        if a.get("is_concerning"):
            by_date[d]["concerning"] += 1
        by_date[d]["anomalies"].append({
            "metric": a["metric"],
            "type": a["type"],
            "severity": a["severity"],
        })
    
    # Sort by date
    timeline = sorted(by_date.values(), key=lambda x: x["date"])
    
    return {
        "timeline": timeline,
        "total_days_with_anomalies": len(timeline),
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }


def get_metric_health(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    platform: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get overall health status of each metric.
    """
    daily_data = _get_daily_metrics(db, account_id, date_from, date_to, platform)
    
    if len(daily_data) < 7:
        return {
            "metrics": [],
            "overall_health": "unknown",
            "message": "Insufficient data",
        }
    
    metrics_health = []
    
    for metric in ["spend", "revenue", "roas", "ctr", "cpc", "conversions"]:
        config = METRIC_CONFIG.get(metric, {})
        values = [d.get(metric, 0) for d in daily_data if d.get(metric, 0) > 0]
        
        if len(values) < 3:
            continue
        
        # Calculate recent vs historical
        recent = values[-7:] if len(values) >= 7 else values
        historical = values[:-7] if len(values) > 7 else values
        
        recent_avg = statistics.mean(recent) if recent else 0
        historical_avg = statistics.mean(historical) if historical else recent_avg
        
        # Calculate trend
        if historical_avg > 0:
            change_percent = ((recent_avg - historical_avg) / historical_avg) * 100
        else:
            change_percent = 0
        
        # Determine health status
        higher_is_worse = config.get("higher_is_worse", False)
        
        if abs(change_percent) < 10:
            status = "stable"
            status_color = "green"
        elif (change_percent > 0 and not higher_is_worse) or (change_percent < 0 and higher_is_worse):
            status = "improving"
            status_color = "green"
        else:
            if abs(change_percent) > 30:
                status = "critical"
                status_color = "red"
            else:
                status = "declining"
                status_color = "yellow"
        
        metrics_health.append({
            "metric": metric,
            "label": config.get("label", metric),
            "current_value": round(recent_avg, 2),
            "previous_value": round(historical_avg, 2),
            "change_percent": round(change_percent, 1),
            "status": status,
            "status_color": status_color,
            "trend": "up" if change_percent > 0 else "down" if change_percent < 0 else "flat",
        })
    
    # Determine overall health
    statuses = [m["status"] for m in metrics_health]
    if "critical" in statuses:
        overall = "critical"
    elif statuses.count("declining") >= 2:
        overall = "warning"
    elif all(s in ["stable", "improving"] for s in statuses):
        overall = "healthy"
    else:
        overall = "mixed"
    
    return {
        "metrics": metrics_health,
        "overall_health": overall,
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }
