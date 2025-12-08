from datetime import date
from typing import Tuple, Optional, List

from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


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
    
    return [
        {
            "rank": i + 1,
            "campaign_id": r.external_campaign_id,
            "campaign_name": r.campaign_name or "Untitled Campaign",
            "platform": r.platform,
            "spend": float(r.spend),
            "clicks": int(r.clicks),
            "conversions": int(r.conversions or 0),
        }
        for i, r in enumerate(rows)
    ]
