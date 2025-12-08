"""
Multi-touch attribution service.
Implements various attribution models for analyzing marketing channel effectiveness.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
from enum import Enum

from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.ad_spend import AdSpend


class AttributionModel(str, Enum):
    """Available attribution models."""
    FIRST_TOUCH = "first_touch"      # 100% credit to first touchpoint
    LAST_TOUCH = "last_touch"        # 100% credit to last touchpoint
    LINEAR = "linear"                # Equal credit to all touchpoints
    TIME_DECAY = "time_decay"        # More credit to recent touchpoints
    POSITION_BASED = "position_based"  # 40% first, 40% last, 20% middle
    DATA_DRIVEN = "data_driven"      # ML-based (placeholder)


def get_customer_touchpoints(
    db: Session,
    account_id: str,
    customer_email: str,
    order_date: datetime,
    lookback_days: int = 30,
) -> List[Dict]:
    """
    Get all touchpoints for a customer leading up to a conversion.
    Returns list of touchpoints ordered by timestamp.
    """
    lookback_start = order_date - timedelta(days=lookback_days)
    
    # Get all orders/interactions for this customer in the lookback window
    # In a full implementation, this would also include page visits, ad clicks, etc.
    touchpoints = []
    
    # Get orders as touchpoints (simplified - in production would use event tracking)
    orders = db.query(Order).filter(
        Order.account_id == account_id,
        Order.customer_email == customer_email,
        Order.date_time.between(lookback_start, order_date),
    ).order_by(Order.date_time).all()
    
    for order in orders:
        if order.utm_source or order.attributed_channel:
            touchpoints.append({
                "channel": order.utm_source or order.attributed_channel or "direct",
                "campaign": order.utm_campaign,
                "timestamp": order.date_time,
                "source": "order",
            })
    
    return touchpoints


def calculate_attribution(
    touchpoints: List[Dict],
    conversion_value: float,
    model: AttributionModel = AttributionModel.LINEAR,
) -> Dict[str, float]:
    """
    Calculate attribution credit for each channel based on touchpoints.
    Returns dict of channel -> credited revenue.
    """
    if not touchpoints:
        return {"direct": conversion_value}
    
    credits = defaultdict(float)
    n = len(touchpoints)
    
    if model == AttributionModel.FIRST_TOUCH:
        # 100% to first touchpoint
        credits[touchpoints[0]["channel"]] = conversion_value
        
    elif model == AttributionModel.LAST_TOUCH:
        # 100% to last touchpoint
        credits[touchpoints[-1]["channel"]] = conversion_value
        
    elif model == AttributionModel.LINEAR:
        # Equal credit to all touchpoints
        credit_per_touch = conversion_value / n
        for tp in touchpoints:
            credits[tp["channel"]] += credit_per_touch
            
    elif model == AttributionModel.TIME_DECAY:
        # More credit to recent touchpoints (exponential decay)
        # Weight increases for more recent touchpoints
        total_weight = sum(2 ** i for i in range(n))
        for i, tp in enumerate(touchpoints):
            weight = 2 ** i / total_weight
            credits[tp["channel"]] += conversion_value * weight
            
    elif model == AttributionModel.POSITION_BASED:
        # 40% first, 40% last, 20% distributed among middle
        if n == 1:
            credits[touchpoints[0]["channel"]] = conversion_value
        elif n == 2:
            credits[touchpoints[0]["channel"]] = conversion_value * 0.5
            credits[touchpoints[-1]["channel"]] += conversion_value * 0.5
        else:
            # First touch gets 40%
            credits[touchpoints[0]["channel"]] = conversion_value * 0.4
            # Last touch gets 40%
            credits[touchpoints[-1]["channel"]] += conversion_value * 0.4
            # Middle touches share 20%
            middle_credit = (conversion_value * 0.2) / (n - 2)
            for tp in touchpoints[1:-1]:
                credits[tp["channel"]] += middle_credit
                
    elif model == AttributionModel.DATA_DRIVEN:
        # Placeholder for ML-based attribution
        # Falls back to linear for now
        credit_per_touch = conversion_value / n
        for tp in touchpoints:
            credits[tp["channel"]] += credit_per_touch
    
    return dict(credits)


def get_attribution_report(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    model: AttributionModel = AttributionModel.LINEAR,
    lookback_days: int = 30,
) -> Dict:
    """
    Generate a full attribution report for the given date range.
    Analyzes all conversions and attributes them according to the selected model.
    """
    # Get all orders in the date range
    orders = db.query(Order).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to),
    ).all()
    
    channel_attribution = defaultdict(lambda: {
        "attributed_revenue": 0.0,
        "attributed_conversions": 0,
        "avg_order_value": 0.0,
    })
    
    total_revenue = 0.0
    total_conversions = 0
    
    for order in orders:
        order_value = float(order.total_amount or 0)
        total_revenue += order_value
        total_conversions += 1
        
        # Get touchpoints for this customer
        touchpoints = get_customer_touchpoints(
            db,
            account_id,
            order.customer_email,
            order.date_time,
            lookback_days,
        )
        
        # If no touchpoints, attribute to last known source or direct
        if not touchpoints:
            channel = order.utm_source or order.attributed_channel or "direct"
            touchpoints = [{"channel": channel, "timestamp": order.date_time}]
        
        # Calculate attribution
        attribution = calculate_attribution(touchpoints, order_value, model)
        
        # Aggregate by channel
        for channel, revenue in attribution.items():
            channel_attribution[channel]["attributed_revenue"] += revenue
            # Fractional conversion credit
            channel_attribution[channel]["attributed_conversions"] += revenue / order_value if order_value > 0 else 0
    
    # Calculate average order value per channel
    for channel, data in channel_attribution.items():
        if data["attributed_conversions"] > 0:
            data["avg_order_value"] = data["attributed_revenue"] / data["attributed_conversions"]
    
    # Get spend data by channel
    spend_by_channel = {}
    spend_rows = db.query(
        AdSpend.platform,
        func.sum(AdSpend.cost).label("spend"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to),
    ).group_by(AdSpend.platform).all()
    
    for row in spend_rows:
        spend_by_channel[row.platform] = float(row.spend or 0)
    
    # Build final report
    channels = []
    all_channels = set(channel_attribution.keys()) | set(spend_by_channel.keys())
    
    for channel in sorted(all_channels):
        data = channel_attribution.get(channel, {"attributed_revenue": 0, "attributed_conversions": 0, "avg_order_value": 0})
        spend = spend_by_channel.get(channel, 0)
        
        roas = data["attributed_revenue"] / spend if spend > 0 else 0
        cpa = spend / data["attributed_conversions"] if data["attributed_conversions"] > 0 else 0
        
        channels.append({
            "channel": channel,
            "attributed_revenue": round(data["attributed_revenue"], 2),
            "attributed_conversions": round(data["attributed_conversions"], 2),
            "avg_order_value": round(data["avg_order_value"], 2),
            "spend": round(spend, 2),
            "roas": round(roas, 2),
            "cpa": round(cpa, 2),
            "revenue_share": round((data["attributed_revenue"] / total_revenue * 100) if total_revenue > 0 else 0, 1),
        })
    
    # Sort by attributed revenue descending
    channels.sort(key=lambda x: x["attributed_revenue"], reverse=True)
    
    return {
        "model": model.value,
        "date_from": str(date_from),
        "date_to": str(date_to),
        "lookback_days": lookback_days,
        "total_revenue": round(total_revenue, 2),
        "total_conversions": total_conversions,
        "channels": channels,
    }


def compare_attribution_models(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> Dict:
    """
    Compare results across different attribution models.
    Useful for understanding how different models affect channel credit.
    """
    models_to_compare = [
        AttributionModel.FIRST_TOUCH,
        AttributionModel.LAST_TOUCH,
        AttributionModel.LINEAR,
        AttributionModel.TIME_DECAY,
        AttributionModel.POSITION_BASED,
    ]
    
    comparison = {}
    
    for model in models_to_compare:
        report = get_attribution_report(db, account_id, date_from, date_to, model)
        
        # Summarize by channel
        comparison[model.value] = {
            channel["channel"]: {
                "revenue": channel["attributed_revenue"],
                "conversions": channel["attributed_conversions"],
                "roas": channel["roas"],
            }
            for channel in report["channels"]
        }
    
    return {
        "date_from": str(date_from),
        "date_to": str(date_to),
        "models": comparison,
    }


def get_conversion_paths(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    limit: int = 20,
) -> List[Dict]:
    """
    Analyze common conversion paths (sequences of touchpoints).
    Returns most common paths and their conversion rates.
    """
    # Get all orders with their touchpoints
    orders = db.query(Order).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to),
    ).all()
    
    path_counts = defaultdict(lambda: {"count": 0, "revenue": 0.0})
    
    for order in orders:
        touchpoints = get_customer_touchpoints(
            db,
            account_id,
            order.customer_email,
            order.date_time,
            lookback_days=30,
        )
        
        # Create path string
        if touchpoints:
            path = " → ".join([tp["channel"] for tp in touchpoints])
        else:
            path = order.utm_source or order.attributed_channel or "direct"
        
        path_counts[path]["count"] += 1
        path_counts[path]["revenue"] += float(order.total_amount or 0)
    
    # Sort by count and take top paths
    sorted_paths = sorted(
        path_counts.items(),
        key=lambda x: x[1]["count"],
        reverse=True,
    )[:limit]
    
    total_conversions = sum(p[1]["count"] for p in sorted_paths)
    
    return [
        {
            "path": path,
            "conversions": data["count"],
            "revenue": round(data["revenue"], 2),
            "share": round(data["count"] / total_conversions * 100, 1) if total_conversions > 0 else 0,
        }
        for path, data in sorted_paths
    ]
