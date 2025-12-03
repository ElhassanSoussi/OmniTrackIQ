from datetime import date
from typing import Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


def get_summary(db: Session, account_id: str, date_from: date, date_to: date):
    revenue_q = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0), func.count(Order.id))
        .filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
        .first()
    )
    revenue = revenue_q[0]
    orders_count = revenue_q[1]

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
    spend = spend_q[0]
    impressions = spend_q[1]
    clicks = spend_q[2]
    conversions = spend_q[3]

    roas = float(revenue) / float(spend) if float(spend) > 0 else 0.0
    profit = float(revenue) - float(spend)

    daily_rows = (
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
    daily = [
        {
            "date": str(row.date),
            "spend": float(row.spend),
            "clicks": int(row.clicks),
            "impressions": int(row.impressions),
        }
        for row in daily_rows
    ]

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
                "spend": float(r.spend),
                "revenue": 0.0,  # revenue mapping handled in later versions
                "roas": 0.0,
                "impressions": int(r.impressions),
                "clicks": int(r.clicks),
                "conversions": int(r.conversions),
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
) -> Tuple[int, list[Order]]:
    q = db.query(Order).filter(Order.account_id == account_id, Order.date_time.between(date_from, date_to))
    total = q.count()
    rows = q.order_by(Order.date_time.desc()).offset(offset).limit(limit).all()
    return total, rows
