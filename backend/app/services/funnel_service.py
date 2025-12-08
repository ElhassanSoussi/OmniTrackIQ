"""
Funnel visualization and analysis service.
Tracks user journey through marketing funnel stages.
"""
from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


# Default funnel stages based on typical e-commerce journey
DEFAULT_FUNNEL_STAGES = [
    {"id": "impressions", "name": "Ad Impressions", "description": "Users who saw ads"},
    {"id": "clicks", "name": "Ad Clicks", "description": "Users who clicked ads"},
    {"id": "visits", "name": "Site Visits", "description": "Users who visited the site"},
    {"id": "add_to_cart", "name": "Add to Cart", "description": "Users who added items to cart"},
    {"id": "checkout", "name": "Checkout Started", "description": "Users who started checkout"},
    {"id": "purchase", "name": "Purchase", "description": "Users who completed purchase"},
]


def get_funnel_data(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    platform: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get funnel data for visualization.
    Uses available data to construct a marketing funnel.
    """
    # Query ad spend data for impressions, clicks, conversions
    ad_query = db.query(
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    )
    
    if platform:
        ad_query = ad_query.filter(AdSpend.platform == platform)
    
    ad_result = ad_query.first()
    
    # Query order data for purchases
    order_query = db.query(
        func.count(Order.id).label("purchases"),
        func.sum(Order.total_amount).label("revenue"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    )
    
    if platform:
        order_query = order_query.filter(Order.utm_source == platform)
    
    order_result = order_query.first()
    
    impressions = int(ad_result.impressions or 0)
    clicks = int(ad_result.clicks or 0)
    conversions = int(ad_result.conversions or 0)
    purchases = int(order_result.purchases or 0)
    revenue = float(order_result.revenue or 0)
    
    # Estimate intermediate funnel stages based on industry benchmarks
    # These would ideally come from actual tracking data
    site_visits = int(clicks * 0.85)  # ~85% of clicks result in page load
    add_to_cart = int(site_visits * 0.15)  # ~15% add to cart rate
    checkout_started = int(add_to_cart * 0.60)  # ~60% proceed to checkout
    
    # Use actual purchases if we have them, otherwise use conversions
    final_purchases = purchases if purchases > 0 else conversions
    
    # Build funnel stages with actual values
    stages = [
        {
            "id": "impressions",
            "name": "Ad Impressions",
            "value": impressions,
            "percentage": 100.0,
            "drop_off": 0,
            "drop_off_rate": 0,
        },
        {
            "id": "clicks",
            "name": "Ad Clicks",
            "value": clicks,
            "percentage": round((clicks / impressions * 100), 2) if impressions > 0 else 0,
            "drop_off": impressions - clicks,
            "drop_off_rate": round(((impressions - clicks) / impressions * 100), 2) if impressions > 0 else 0,
        },
        {
            "id": "site_visits",
            "name": "Site Visits",
            "value": site_visits,
            "percentage": round((site_visits / impressions * 100), 2) if impressions > 0 else 0,
            "drop_off": clicks - site_visits,
            "drop_off_rate": round(((clicks - site_visits) / clicks * 100), 2) if clicks > 0 else 0,
        },
        {
            "id": "add_to_cart",
            "name": "Add to Cart",
            "value": add_to_cart,
            "percentage": round((add_to_cart / impressions * 100), 2) if impressions > 0 else 0,
            "drop_off": site_visits - add_to_cart,
            "drop_off_rate": round(((site_visits - add_to_cart) / site_visits * 100), 2) if site_visits > 0 else 0,
        },
        {
            "id": "checkout",
            "name": "Checkout Started",
            "value": checkout_started,
            "percentage": round((checkout_started / impressions * 100), 2) if impressions > 0 else 0,
            "drop_off": add_to_cart - checkout_started,
            "drop_off_rate": round(((add_to_cart - checkout_started) / add_to_cart * 100), 2) if add_to_cart > 0 else 0,
        },
        {
            "id": "purchase",
            "name": "Purchase",
            "value": final_purchases,
            "percentage": round((final_purchases / impressions * 100), 2) if impressions > 0 else 0,
            "drop_off": checkout_started - final_purchases,
            "drop_off_rate": round(((checkout_started - final_purchases) / checkout_started * 100), 2) if checkout_started > 0 else 0,
        },
    ]
    
    # Calculate overall conversion rate
    overall_conversion_rate = round((final_purchases / impressions * 100), 4) if impressions > 0 else 0
    
    # Calculate average order value
    aov = round(revenue / final_purchases, 2) if final_purchases > 0 else 0
    
    return {
        "stages": stages,
        "summary": {
            "total_impressions": impressions,
            "total_clicks": clicks,
            "total_purchases": final_purchases,
            "total_revenue": revenue,
            "overall_conversion_rate": overall_conversion_rate,
            "click_through_rate": round((clicks / impressions * 100), 2) if impressions > 0 else 0,
            "average_order_value": aov,
        },
        "date_range": {
            "from": str(date_from),
            "to": str(date_to),
        },
    }


def get_funnel_comparison(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    compare_by: str = "platform",  # platform, campaign, time_period
) -> Dict[str, Any]:
    """
    Compare funnels across different segments.
    """
    if compare_by == "platform":
        return _compare_by_platform(db, account_id, date_from, date_to)
    elif compare_by == "time_period":
        return _compare_by_time_period(db, account_id, date_from, date_to)
    else:
        return _compare_by_platform(db, account_id, date_from, date_to)


def _compare_by_platform(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """Compare funnel performance across platforms."""
    # Get unique platforms
    platforms = db.query(AdSpend.platform).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    ).distinct().all()
    
    comparisons = []
    for (platform,) in platforms:
        funnel = get_funnel_data(db, account_id, date_from, date_to, platform=platform)
        comparisons.append({
            "segment": platform,
            "segment_label": _get_platform_label(platform),
            "stages": funnel["stages"],
            "summary": funnel["summary"],
        })
    
    # Sort by total purchases descending
    comparisons.sort(key=lambda x: x["summary"]["total_purchases"], reverse=True)
    
    return {
        "compare_by": "platform",
        "comparisons": comparisons,
        "date_range": {
            "from": str(date_from),
            "to": str(date_to),
        },
    }


def _compare_by_time_period(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """Compare current period funnel with previous period."""
    # Current period
    current_funnel = get_funnel_data(db, account_id, date_from, date_to)
    
    # Previous period (same duration)
    period_length = (date_to - date_from).days + 1
    prev_date_to = date_from - timedelta(days=1)
    prev_date_from = prev_date_to - timedelta(days=period_length - 1)
    previous_funnel = get_funnel_data(db, account_id, prev_date_from, prev_date_to)
    
    # Calculate changes
    current_summary = current_funnel["summary"]
    previous_summary = previous_funnel["summary"]
    
    changes = {}
    for key in current_summary:
        current_val = current_summary[key]
        previous_val = previous_summary[key]
        if isinstance(current_val, (int, float)) and previous_val > 0:
            change_pct = ((current_val - previous_val) / previous_val) * 100
            changes[key] = {
                "current": current_val,
                "previous": previous_val,
                "change": current_val - previous_val,
                "change_percentage": round(change_pct, 2),
            }
        else:
            changes[key] = {
                "current": current_val,
                "previous": previous_val,
                "change": current_val - previous_val if isinstance(current_val, (int, float)) else 0,
                "change_percentage": 0,
            }
    
    return {
        "compare_by": "time_period",
        "current_period": {
            "from": str(date_from),
            "to": str(date_to),
            "stages": current_funnel["stages"],
            "summary": current_summary,
        },
        "previous_period": {
            "from": str(prev_date_from),
            "to": str(prev_date_to),
            "stages": previous_funnel["stages"],
            "summary": previous_summary,
        },
        "changes": changes,
    }


def get_funnel_trends(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    granularity: str = "daily",  # daily, weekly
) -> Dict[str, Any]:
    """
    Get funnel metrics over time for trend analysis.
    """
    if granularity == "weekly":
        # Group by week
        date_expr = func.date_trunc('week', AdSpend.date)
    else:
        # Group by day
        date_expr = AdSpend.date
    
    # Query daily/weekly ad metrics
    ad_query = db.query(
        date_expr.label("period"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    ).group_by(date_expr).order_by(date_expr)
    
    ad_rows = ad_query.all()
    
    # Query daily/weekly order metrics
    if granularity == "weekly":
        order_date_expr = func.date_trunc('week', Order.date_time)
    else:
        order_date_expr = func.date(Order.date_time)
    
    order_query = db.query(
        order_date_expr.label("period"),
        func.count(Order.id).label("purchases"),
        func.sum(Order.total_amount).label("revenue"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    ).group_by(order_date_expr)
    
    order_by_period = {str(r.period): {"purchases": int(r.purchases), "revenue": float(r.revenue or 0)} for r in order_query.all()}
    
    trends = []
    for row in ad_rows:
        period_str = str(row.period)
        impressions = int(row.impressions or 0)
        clicks = int(row.clicks or 0)
        order_data = order_by_period.get(period_str, {"purchases": 0, "revenue": 0})
        
        trends.append({
            "period": period_str,
            "impressions": impressions,
            "clicks": clicks,
            "ctr": round((clicks / impressions * 100), 2) if impressions > 0 else 0,
            "purchases": order_data["purchases"],
            "revenue": order_data["revenue"],
            "conversion_rate": round((order_data["purchases"] / clicks * 100), 4) if clicks > 0 else 0,
        })
    
    return {
        "granularity": granularity,
        "trends": trends,
        "date_range": {
            "from": str(date_from),
            "to": str(date_to),
        },
    }


def _get_platform_label(platform: str) -> str:
    """Get display label for a platform."""
    labels = {
        "facebook": "Facebook Ads",
        "google_ads": "Google Ads",
        "tiktok": "TikTok Ads",
        "snapchat": "Snapchat Ads",
        "pinterest": "Pinterest",
        "linkedin": "LinkedIn Ads",
    }
    return labels.get(platform, platform.replace("_", " ").title())
