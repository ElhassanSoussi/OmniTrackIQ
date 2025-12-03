from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.services.metrics_service import get_campaigns, get_orders, get_summary

router = APIRouter()


@router.get("/summary")
def summary(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_summary(db, user.account_id, from_date, to_date)


@router.get("/campaigns")
def campaigns(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_campaigns(db, user.account_id, from_date, to_date)


@router.get("/orders")
def orders(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)

    total, rows = get_orders(db, user.account_id, from_date, to_date, limit, offset)
    return {
        "total": total,
        "items": [
            {
                "id": r.id,
                "date_time": r.date_time.isoformat(),
                "total_amount": float(r.total_amount),
                "currency": r.currency,
                "source_platform": r.source_platform,
                "utm_source": r.utm_source,
                "utm_campaign": r.utm_campaign,
            }
            for r in rows
        ],
    }
