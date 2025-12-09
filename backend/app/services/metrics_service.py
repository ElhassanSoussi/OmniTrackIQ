from datetime import date
from typing import Tuple, Optional, List
from collections import defaultdict

from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order

# Platform display names
PLATFORM_LABELS = {
    "facebook": "Facebook Ads",
    "google_ads": "Google Ads",
    "tiktok": "TikTok Ads",
    "snapchat": "Snapchat Ads",
    "pinterest": "Pinterest",
    "linkedin": "LinkedIn Ads",
    "shopify": "Shopify",
    "ga4": "GA4",
}


def get_platform_label(platform: str) -> str:
    """Get display label for a platform."""
    return PLATFORM_LABELS.get(platform, platform.replace("_", " ").title())


def get_summary(
    db: Session, 
    account_id: str, 
    date_from: date, 
    date_to: date,
    platform: Optional[str] = None,
):
    """Get summary metrics for the dashboard."""
    # Revenue and orders from Orders table
    revenue_q = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0), func.count(Order.id))
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
    )
    if platform:
        revenue_q = revenue_q.filter(Order.utm_source == platform)
    revenue_result = revenue_q.first()
    revenue = revenue_result[0]
    orders_count = revenue_result[1]

    # Spend and ad metrics from AdSpend table
    spend_q = (
        db.query(
            func.coalesce(func.sum(AdSpend.cost), 0),
            func.coalesce(func.sum(AdSpend.impressions), 0),
            func.coalesce(func.sum(AdSpend.clicks), 0),
            func.coalesce(func.sum(AdSpend.conversions), 0),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
    )
    if platform:
        spend_q = spend_q.filter(AdSpend.platform == platform)
    spend_result = spend_q.first()
    spend = spend_result[0]
    impressions = spend_result[1]
    clicks = spend_result[2]
    conversions = spend_result[3]

    roas = float(revenue) / float(spend) if float(spend) > 0 else 0.0
    profit = float(revenue) - float(spend)
    ctr = (float(clicks) / float(impressions) * 100) if float(impressions) > 0 else 0.0
    cpc = float(spend) / float(clicks) if float(clicks) > 0 else 0.0
    cpa = float(spend) / float(conversions) if float(conversions) > 0 else 0.0
    aov = float(revenue) / float(orders_count) if orders_count > 0 else 0.0

    # Daily breakdown for charts
    daily_q = (
        db.query(
            AdSpend.date,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
    )
    if platform:
        daily_q = daily_q.filter(AdSpend.platform == platform)
    daily_rows = daily_q.group_by(AdSpend.date).order_by(AdSpend.date).all()
    
    daily = [
        {
            "date": str(row.date),
            "spend": float(row.spend),
            "clicks": int(row.clicks),
            "impressions": int(row.impressions),
            "conversions": int(row.conversions or 0),
        }
        for row in daily_rows
    ]

    return {
        "revenue": float(revenue),
        "spend": float(spend),
        "profit": float(profit),
        "roas": round(float(roas), 2),
        "impressions": int(impressions),
        "clicks": int(clicks),
        "conversions": int(conversions),
        "orders": int(orders_count),
        "ctr": round(ctr, 2),
        "cpc": round(cpc, 2),
        "cpa": round(cpa, 2),
        "aov": round(aov, 2),
        "daily": daily,
    }


def get_campaigns(
    db: Session, 
    account_id: str, 
    date_from: date, 
    date_to: date,
    platform: Optional[str] = None,
    sort_by: str = "spend",
    limit: int = 50,
):
    """Get campaign performance data."""
    query = (
        db.query(
            AdSpend.external_campaign_id,
            AdSpend.campaign_name,
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
    )
    
    if platform:
        query = query.filter(AdSpend.platform == platform)
    
    query = query.group_by(AdSpend.external_campaign_id, AdSpend.campaign_name, AdSpend.platform)
    
    # Sort by specified metric
    sort_column = {
        "spend": desc(func.sum(AdSpend.cost)),
        "clicks": desc(func.sum(AdSpend.clicks)),
        "conversions": desc(func.sum(AdSpend.conversions)),
        "impressions": desc(func.sum(AdSpend.impressions)),
    }.get(sort_by, desc(func.sum(AdSpend.cost)))
    
    rows = query.order_by(sort_column).limit(limit).all()

    results = []
    for r in rows:
        spend = float(r.spend)
        clicks = int(r.clicks)
        impressions = int(r.impressions)
        conversions = int(r.conversions or 0)
        
        ctr = (clicks / impressions * 100) if impressions > 0 else 0
        cpc = spend / clicks if clicks > 0 else 0
        cpa = spend / conversions if conversions > 0 else 0
        
        results.append({
            "campaign_id": r.external_campaign_id,
            "campaign_name": r.campaign_name or "Untitled Campaign",
            "platform": r.platform,
            "spend": spend,
            "revenue": 0.0,  # Will be calculated when attribution is implemented
            "roas": 0.0,
            "impressions": impressions,
            "clicks": clicks,
            "conversions": conversions,
            "ctr": round(ctr, 2),
            "cpc": round(cpc, 2),
            "cpa": round(cpa, 2),
        })
    return results


def get_orders(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    limit: int = 50,
    offset: int = 0,
    utm_source: Optional[str] = None,
) -> Tuple[int, list]:
    """Get orders with pagination and filtering."""
    query = db.query(Order).filter(
        Order.account_id == account_id, 
        Order.date_time.between(date_from, date_to)
    )
    
    if utm_source:
        query = query.filter(Order.utm_source == utm_source)
    
    total = query.count()
    rows = query.order_by(Order.date_time.desc()).offset(offset).limit(limit).all()
    
    items = [
        {
            "id": o.id,
            "external_order_id": o.external_order_id,
            "date_time": o.date_time.isoformat(),
            "total_amount": float(o.total_amount),
            "currency": o.currency,
            "utm_source": o.utm_source,
            "utm_campaign": o.utm_campaign,
            "source_platform": o.source_platform,
        }
        for o in rows
    ]
    
    return total, items


def get_platform_breakdown(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
):
    """Get spend and performance breakdown by platform."""
    rows = (
        db.query(
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
        .group_by(AdSpend.platform)
        .order_by(desc(func.sum(AdSpend.cost)))
        .all()
    )
    
    total_spend = sum(float(r.spend) for r in rows) or 1
    
    return [
        {
            "platform": r.platform,
            "spend": float(r.spend),
            "spend_percentage": round(float(r.spend) / total_spend * 100, 1),
            "impressions": int(r.impressions),
            "clicks": int(r.clicks),
            "conversions": int(r.conversions or 0),
            "ctr": round((int(r.clicks) / int(r.impressions) * 100) if r.impressions else 0, 2),
            "cpc": round(float(r.spend) / int(r.clicks) if r.clicks else 0, 2),
        }
        for r in rows
    ]


def get_daily_performance(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    platform: Optional[str] = None,
    metrics: List[str] = ["spend", "revenue", "roas"],
):
    """Get daily performance data for charts."""
    # Get daily ad spend
    spend_q = (
        db.query(
            AdSpend.date,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
    )
    if platform:
        spend_q = spend_q.filter(AdSpend.platform == platform)
    spend_rows = spend_q.group_by(AdSpend.date).order_by(AdSpend.date).all()
    
    # Get daily revenue
    revenue_q = (
        db.query(
            func.date(Order.date_time).label("date"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
    )
    revenue_rows = revenue_q.group_by(func.date(Order.date_time)).all()
    
    # Combine into date-keyed dict
    revenue_by_date = {str(r.date): {"revenue": float(r.revenue), "orders": int(r.orders)} for r in revenue_rows}
    
    result = []
    for r in spend_rows:
        date_str = str(r.date)
        rev_data = revenue_by_date.get(date_str, {"revenue": 0, "orders": 0})
        spend = float(r.spend)
        revenue = rev_data["revenue"]
        roas = revenue / spend if spend > 0 else 0
        
        data_point = {"date": date_str}
        if "spend" in metrics:
            data_point["spend"] = spend
        if "revenue" in metrics:
            data_point["revenue"] = revenue
        if "roas" in metrics:
            data_point["roas"] = round(roas, 2)
        if "clicks" in metrics:
            data_point["clicks"] = int(r.clicks)
        if "impressions" in metrics:
            data_point["impressions"] = int(r.impressions)
        if "conversions" in metrics:
            data_point["conversions"] = int(r.conversions or 0)
        if "orders" in metrics:
            data_point["orders"] = rev_data["orders"]
        
        result.append(data_point)
    
    return result


def get_top_performers(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    metric: str = "roas",
    limit: int = 5,
):
    """Get top performing campaigns by a specific metric."""
    query = (
        db.query(
            AdSpend.external_campaign_id,
            AdSpend.campaign_name,
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id, 
            AdSpend.date.between(date_from, date_to),
            AdSpend.cost > 0,  # Only campaigns with spend
        )
        .group_by(AdSpend.external_campaign_id, AdSpend.campaign_name, AdSpend.platform)
    )
    
    # Sort by metric
    if metric == "spend":
        query = query.order_by(desc(func.sum(AdSpend.cost)))
    elif metric == "clicks":
        query = query.order_by(desc(func.sum(AdSpend.clicks)))
    elif metric == "conversions":
        query = query.order_by(desc(func.sum(AdSpend.conversions)))
    else:  # Default to spend for now since we don't have revenue attribution
        query = query.order_by(desc(func.sum(AdSpend.cost)))
    
    rows = query.limit(limit).all()
    
    results = []
    for i, r in enumerate(rows):
        spend = float(r.spend)
        clicks = int(r.clicks)
        conversions = int(r.conversions or 0)
        
        results.append({
            "rank": i + 1,
            "campaign_id": r.external_campaign_id,
            "campaign_name": r.campaign_name or "Untitled Campaign",
            "platform": r.platform,
            "platform_label": get_platform_label(r.platform),
            "spend": spend,
            "clicks": clicks,
            "conversions": conversions,
            "cpc": round(spend / clicks, 2) if clicks > 0 else 0,
            "cpa": round(spend / conversions, 2) if conversions > 0 else 0,
        })
    
    return results


def get_timeseries(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    platform: Optional[str] = None,
    group_by_channel: bool = False,
    metrics: List[str] = ["spend", "revenue", "roas"],
):
    """
    Get timeseries data with optional channel breakdown.
    
    Returns aggregated daily metrics, optionally grouped by platform.
    """
    # Get daily ad spend data
    spend_q = db.query(
        AdSpend.date,
        AdSpend.platform,
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    )
    
    if platform:
        spend_q = spend_q.filter(AdSpend.platform == platform)
    
    spend_q = spend_q.group_by(AdSpend.date, AdSpend.platform).order_by(AdSpend.date)
    spend_rows = spend_q.all()
    
    # Get daily revenue data
    revenue_q = db.query(
        func.date(Order.date_time).label("date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    ).group_by(func.date(Order.date_time))
    revenue_rows = revenue_q.all()
    
    # Build revenue lookup by date
    revenue_by_date = {
        str(r.date): {"revenue": float(r.revenue), "orders": int(r.orders)}
        for r in revenue_rows
    }
    
    # Aggregate data
    if group_by_channel:
        # Group by platform
        by_channel: dict[str, dict[str, dict]] = defaultdict(dict)
        
        for r in spend_rows:
            date_str = str(r.date)
            platform_key = r.platform
            
            rev_data = revenue_by_date.get(date_str, {"revenue": 0, "orders": 0})
            spend = float(r.spend)
            revenue = rev_data["revenue"]
            
            data_point = {"date": date_str}
            if "spend" in metrics:
                data_point["spend"] = spend
            if "revenue" in metrics:
                data_point["revenue"] = revenue
            if "roas" in metrics:
                data_point["roas"] = round(revenue / spend, 2) if spend > 0 else 0
            if "clicks" in metrics:
                data_point["clicks"] = int(r.clicks)
            if "impressions" in metrics:
                data_point["impressions"] = int(r.impressions)
            if "conversions" in metrics:
                data_point["conversions"] = int(r.conversions or 0)
            if "orders" in metrics:
                data_point["orders"] = rev_data["orders"]
            
            by_channel[platform_key][date_str] = data_point
        
        # Convert to list format
        channel_data = {
            p: list(dates.values())
            for p, dates in by_channel.items()
        }
        
        # Also compute aggregate timeseries
        agg_by_date: dict[str, dict] = defaultdict(lambda: {
            "spend": 0, "revenue": 0, "clicks": 0, "impressions": 0, "conversions": 0, "orders": 0
        })
        
        for r in spend_rows:
            date_str = str(r.date)
            agg_by_date[date_str]["spend"] += float(r.spend)
            agg_by_date[date_str]["clicks"] += int(r.clicks)
            agg_by_date[date_str]["impressions"] += int(r.impressions)
            agg_by_date[date_str]["conversions"] += int(r.conversions or 0)
        
        for date_str, rev_data in revenue_by_date.items():
            agg_by_date[date_str]["revenue"] += rev_data["revenue"]
            agg_by_date[date_str]["orders"] += rev_data["orders"]
        
        aggregate = []
        for date_str in sorted(agg_by_date.keys()):
            d = agg_by_date[date_str]
            data_point = {"date": date_str}
            if "spend" in metrics:
                data_point["spend"] = d["spend"]
            if "revenue" in metrics:
                data_point["revenue"] = d["revenue"]
            if "roas" in metrics:
                data_point["roas"] = round(d["revenue"] / d["spend"], 2) if d["spend"] > 0 else 0
            if "clicks" in metrics:
                data_point["clicks"] = d["clicks"]
            if "impressions" in metrics:
                data_point["impressions"] = d["impressions"]
            if "conversions" in metrics:
                data_point["conversions"] = d["conversions"]
            if "orders" in metrics:
                data_point["orders"] = d["orders"]
            aggregate.append(data_point)
        
        return {"data": aggregate, "by_channel": channel_data}
    
    else:
        # Simple aggregate
        agg_by_date: dict[str, dict] = defaultdict(lambda: {
            "spend": 0, "clicks": 0, "impressions": 0, "conversions": 0
        })
        
        for r in spend_rows:
            date_str = str(r.date)
            agg_by_date[date_str]["spend"] += float(r.spend)
            agg_by_date[date_str]["clicks"] += int(r.clicks)
            agg_by_date[date_str]["impressions"] += int(r.impressions)
            agg_by_date[date_str]["conversions"] += int(r.conversions or 0)
        
        result = []
        for date_str in sorted(agg_by_date.keys()):
            d = agg_by_date[date_str]
            rev_data = revenue_by_date.get(date_str, {"revenue": 0, "orders": 0})
            
            data_point = {"date": date_str}
            if "spend" in metrics:
                data_point["spend"] = d["spend"]
            if "revenue" in metrics:
                data_point["revenue"] = rev_data["revenue"]
            if "roas" in metrics:
                data_point["roas"] = round(rev_data["revenue"] / d["spend"], 2) if d["spend"] > 0 else 0
            if "clicks" in metrics:
                data_point["clicks"] = d["clicks"]
            if "impressions" in metrics:
                data_point["impressions"] = d["impressions"]
            if "conversions" in metrics:
                data_point["conversions"] = d["conversions"]
            if "orders" in metrics:
                data_point["orders"] = rev_data["orders"]
            result.append(data_point)
        
        return {"data": result, "by_channel": None}


def get_channel_breakdown(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
):
    """
    Get comprehensive metrics breakdown by channel.
    
    Includes spend, revenue attribution, and computed metrics.
    """
    # Get spend by platform
    spend_rows = (
        db.query(
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
        .group_by(AdSpend.platform)
        .all()
    )
    
    # Get orders by utm_source for attribution
    orders_by_source = (
        db.query(
            Order.utm_source,
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .group_by(Order.utm_source)
        .all()
    )
    
    # Map utm_source to platform
    source_to_platform = {
        "facebook": "facebook",
        "fb": "facebook",
        "meta": "facebook",
        "google": "google_ads",
        "google_ads": "google_ads",
        "adwords": "google_ads",
        "tiktok": "tiktok",
        "shopify": "shopify",
        "direct": "direct",
        "organic": "organic",
    }
    
    revenue_by_platform: dict[str, dict] = defaultdict(lambda: {"revenue": 0, "orders": 0})
    for row in orders_by_source:
        source = (row.utm_source or "direct").lower()
        platform = source_to_platform.get(source, "other")
        revenue_by_platform[platform]["revenue"] += float(row.revenue)
        revenue_by_platform[platform]["orders"] += int(row.orders)
    
    # Calculate totals
    total_spend = sum(float(r.spend) for r in spend_rows) or 1
    total_revenue = sum(d["revenue"] for d in revenue_by_platform.values())
    
    # Build channel metrics
    channels = []
    for r in spend_rows:
        platform = r.platform
        spend = float(r.spend)
        impressions = int(r.impressions)
        clicks = int(r.clicks)
        conversions = int(r.conversions or 0)
        
        rev_data = revenue_by_platform.get(platform, {"revenue": 0, "orders": 0})
        revenue = rev_data["revenue"]
        orders = rev_data["orders"]
        
        channels.append({
            "platform": platform,
            "platform_label": get_platform_label(platform),
            "spend": spend,
            "spend_percentage": round(spend / total_spend * 100, 1),
            "revenue": revenue,
            "roas": round(revenue / spend, 2) if spend > 0 else 0,
            "impressions": impressions,
            "clicks": clicks,
            "conversions": conversions,
            "orders": orders,
            "ctr": round((clicks / impressions * 100) if impressions > 0 else 0, 2),
            "cpc": round(spend / clicks if clicks > 0 else 0, 2),
            "cpa": round(spend / conversions if conversions > 0 else 0, 2),
        })
    
    # Sort by spend descending
    channels.sort(key=lambda x: x["spend"], reverse=True)
    
    return {
        "channels": channels,
        "total_spend": total_spend,
        "total_revenue": total_revenue,
    }


def get_campaign_detail(
    db: Session,
    account_id: str,
    campaign_id: str,
    date_from: date,
    date_to: date,
):
    """
    Get detailed metrics for a single campaign including daily breakdown.
    """
    # Get campaign summary
    summary_row = (
        db.query(
            AdSpend.external_campaign_id,
            AdSpend.campaign_name,
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.external_campaign_id == campaign_id,
            AdSpend.date.between(date_from, date_to),
        )
        .group_by(AdSpend.external_campaign_id, AdSpend.campaign_name, AdSpend.platform)
        .first()
    )
    
    if not summary_row:
        return None
    
    spend = float(summary_row.spend)
    clicks = int(summary_row.clicks)
    impressions = int(summary_row.impressions)
    conversions = int(summary_row.conversions or 0)
    
    summary = {
        "campaign_id": campaign_id,
        "campaign_name": summary_row.campaign_name or "Untitled Campaign",
        "platform": summary_row.platform,
        "platform_label": get_platform_label(summary_row.platform),
        "spend": spend,
        "revenue": 0,  # TODO: Attribution
        "roas": 0,
        "impressions": impressions,
        "clicks": clicks,
        "conversions": conversions,
        "ctr": round((clicks / impressions * 100) if impressions > 0 else 0, 2),
        "cpc": round(spend / clicks if clicks > 0 else 0, 2),
        "cpa": round(spend / conversions if conversions > 0 else 0, 2),
        "status": "active",
    }
    
    # Get daily breakdown
    daily_rows = (
        db.query(
            AdSpend.date,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.external_campaign_id == campaign_id,
            AdSpend.date.between(date_from, date_to),
        )
        .group_by(AdSpend.date)
        .order_by(AdSpend.date)
        .all()
    )
    
    daily = [
        {
            "date": str(r.date),
            "spend": float(r.spend),
            "impressions": int(r.impressions),
            "clicks": int(r.clicks),
            "conversions": int(r.conversions or 0),
        }
        for r in daily_rows
    ]
    
    return {
        "campaign_id": campaign_id,
        "campaign_name": summary_row.campaign_name or "Untitled Campaign",
        "platform": summary_row.platform,
        "summary": summary,
        "daily": daily,
    }


def get_orders_summary(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
):
    """
    Get orders summary with attribution breakdown.
    """
    # Overall stats
    total_row = (
        db.query(
            func.count(Order.id).label("total_orders"),
            func.sum(Order.total_amount).label("total_revenue"),
        )
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .first()
    )
    
    total_orders = int(total_row.total_orders) if total_row.total_orders else 0
    total_revenue = float(total_row.total_revenue) if total_row.total_revenue else 0
    aov = round(total_revenue / total_orders, 2) if total_orders > 0 else 0
    
    # By source
    source_rows = (
        db.query(
            Order.utm_source,
            func.count(Order.id).label("orders"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .group_by(Order.utm_source)
        .all()
    )
    
    orders_by_source = {(r.utm_source or "direct"): int(r.orders) for r in source_rows}
    revenue_by_source = {(r.utm_source or "direct"): float(r.revenue) for r in source_rows}
    
    # Daily timeseries for chart
    daily_rows = (
        db.query(
            func.date(Order.date_time).label("date"),
            func.count(Order.id).label("orders"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .group_by(func.date(Order.date_time))
        .order_by(func.date(Order.date_time))
        .all()
    )
    
    daily = [
        {
            "date": str(r.date),
            "orders": int(r.orders),
            "revenue": float(r.revenue),
        }
        for r in daily_rows
    ]
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "aov": aov,
        "orders_by_source": orders_by_source,
        "revenue_by_source": revenue_by_source,
        "daily": daily,
    }


def get_campaign_timeseries(
    db: Session,
    account_id: str,
    campaign_id: str,
    date_from: date,
    date_to: date,
):
    """
    Get daily timeseries data for a specific campaign.
    
    Returns daily metrics including spend, clicks, impressions, and conversions.
    """
    daily_rows = (
        db.query(
            AdSpend.date,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.external_campaign_id == campaign_id,
            AdSpend.date.between(date_from, date_to),
        )
        .group_by(AdSpend.date)
        .order_by(AdSpend.date)
        .all()
    )
    
    data = []
    for r in daily_rows:
        spend = float(r.spend)
        clicks = int(r.clicks)
        impressions = int(r.impressions)
        conversions = int(r.conversions or 0)
        
        data.append({
            "date": str(r.date),
            "spend": spend,
            "revenue": 0,  # TODO: Campaign-level revenue attribution
            "roas": 0,
            "clicks": clicks,
            "impressions": impressions,
            "conversions": conversions,
            "orders": 0,
        })
    
    return {"data": data}


def get_campaign_summary_single(
    db: Session,
    account_id: str,
    campaign_id: str,
    date_from: date,
    date_to: date,
):
    """
    Get summary metrics for a single campaign.
    
    Returns aggregated metrics for the campaign over the date range.
    """
    summary_row = (
        db.query(
            AdSpend.external_campaign_id,
            AdSpend.campaign_name,
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.external_campaign_id == campaign_id,
            AdSpend.date.between(date_from, date_to),
        )
        .group_by(AdSpend.external_campaign_id, AdSpend.campaign_name, AdSpend.platform)
        .first()
    )
    
    if not summary_row:
        return None
    
    spend = float(summary_row.spend)
    clicks = int(summary_row.clicks)
    impressions = int(summary_row.impressions)
    conversions = int(summary_row.conversions or 0)
    
    # Calculate derived metrics safely
    ctr = round((clicks / impressions * 100) if impressions > 0 else 0, 2)
    cpc = round(spend / clicks if clicks > 0 else 0, 2)
    cpa = round(spend / conversions if conversions > 0 else 0, 2)
    
    return {
        "campaign_id": campaign_id,
        "campaign_name": summary_row.campaign_name or "Untitled Campaign",
        "platform": summary_row.platform,
        "platform_label": get_platform_label(summary_row.platform),
        "spend": spend,
        "revenue": 0,  # TODO: Campaign revenue attribution
        "roas": 0,
        "profit": -spend,  # Without revenue, profit is negative spend
        "impressions": impressions,
        "clicks": clicks,
        "conversions": conversions,
        "orders": 0,
        "ctr": ctr,
        "cpc": cpc,
        "cpa": cpa,
        "aov": 0,
    }


def get_orders_list(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    channel: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    """
    Get paginated orders list with filtering and search.
    
    Supports filtering by channel (utm_source) and search by order ID or customer.
    """
    query = db.query(Order).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to)
    )
    
    # Filter by channel/utm_source
    if channel:
        query = query.filter(Order.utm_source == channel)
    
    # Search by order ID or external order ID
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Order.external_order_id.ilike(search_term)) |
            (Order.id.ilike(search_term))
        )
    
    # Get total count
    total_count = query.count()
    
    # Paginate
    offset = (page - 1) * page_size
    rows = query.order_by(Order.date_time.desc()).offset(offset).limit(page_size).all()
    
    items = [
        {
            "id": o.id,
            "external_order_id": o.external_order_id,
            "date_time": o.date_time.isoformat(),
            "total_amount": float(o.total_amount),
            "currency": o.currency,
            "utm_source": o.utm_source,
            "utm_campaign": o.utm_campaign,
            "source_platform": o.source_platform,
            "attributed_channel": o.utm_source or "direct",
            "attributed_campaign": o.utm_campaign,
        }
        for o in rows
    ]
    
    return {
        "items": items,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
    }
