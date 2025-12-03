from datetime import date, timedelta
from typing import Dict

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


def _safe_float(value) -> float:
    try:
        numeric = float(value or 0)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, numeric)


def _safe_int(value) -> int:
    try:
        numeric = int(value or 0)
    except (TypeError, ValueError):
        return 0
    return max(0, numeric)


def _build_daily_range(date_from: date, date_to: date) -> list[date]:
    days: list[date] = []
    current = date_from
    while current <= date_to:
        days.append(current)
        current += timedelta(days=1)
    return days


def get_summary(db: Session, account_id: str, date_from: date, date_to: date):
    revenue_q = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0), func.count(Order.id))
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .first()
    )
    revenue = _safe_float(revenue_q[0])
    orders_count = _safe_int(revenue_q[1])

    spend_q = (
        db.query(
            func.coalesce(func.sum(AdSpend.cost), 0),
            func.coalesce(func.sum(AdSpend.impressions), 0),
            func.coalesce(func.sum(AdSpend.clicks), 0),
            func.coalesce(func.sum(AdSpend.conversions), 0),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
        .first()
    )
    spend = _safe_float(spend_q[0])
    impressions = _safe_int(spend_q[1])
    clicks = _safe_int(spend_q[2])
    conversions = _safe_int(spend_q[3])

    roas = float(revenue) / float(spend) if float(spend) > 0 else 0.0
    profit = float(revenue) - float(spend)

    spend_daily_rows = (
        db.query(
            AdSpend.date,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.impressions).label("impressions"),
        )
        .filter(AdSpend.account_id == account_id, AdSpend.date.between(date_from, date_to))
        .group_by(AdSpend.date)
        .order_by(AdSpend.date)
        .all()
    )

    revenue_daily_rows = (
        db.query(
            func.date(Order.date_time).label("date"),
            func.sum(Order.total_amount).label("revenue"),
        )
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .group_by(func.date(Order.date_time))
        .order_by(func.date(Order.date_time))
        .all()
    )

    spend_by_date: Dict[date, dict] = {}
    for row in spend_daily_rows:
        spend_by_date[row.date] = {
            "spend": _safe_float(row.spend),
            "clicks": _safe_int(row.clicks),
            "impressions": _safe_int(row.impressions),
        }

    revenue_by_date: Dict[date, float] = {}
    for row in revenue_daily_rows:
        revenue_by_date[row.date] = _safe_float(row.revenue)

    daily = []
    for day in _build_daily_range(date_from, date_to):
        spend_entry = spend_by_date.get(day, {})
        daily.append(
            {
                "date": str(day),
                "spend": _safe_float(spend_entry.get("spend")),
                "clicks": _safe_int(spend_entry.get("clicks")),
                "impressions": _safe_int(spend_entry.get("impressions")),
                "revenue": revenue_by_date.get(day, 0.0),
            }
        )

    return {
        "revenue": float(revenue),
        "spend": float(spend),
        "profit": float(profit),
        "roas": float(roas),
        "impressions": int(impressions),
        "clicks": int(clicks),
        "conversions": int(conversions),
        "orders": int(orders_count),
        "daily": daily,
    }


def get_campaigns(db: Session, account_id: str, date_from: date, date_to: date):
    rows = (
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
        .group_by(AdSpend.external_campaign_id, AdSpend.campaign_name, AdSpend.platform)
        .all()
    )

    results = []
    for r in rows:
        results.append(
            {
                "campaign_id": r.external_campaign_id,
                "campaign_name": r.campaign_name,
                "platform": r.platform,
                "spend": _safe_float(r.spend),
                "revenue": 0.0,  # revenue mapping handled in later versions
                "roas": 0.0,
                "impressions": _safe_int(r.impressions),
                "clicks": _safe_int(r.clicks),
                "conversions": _safe_int(r.conversions),
            }
        )
    return results


def get_orders(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    limit: int = 50,
    offset: int = 0,
) -> tuple[int, list[Order]]:
    q = db.query(Order).filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
    total = q.count()
    rows = q.order_by(Order.date_time.desc()).offset(offset).limit(limit).all()
    return total, rows
