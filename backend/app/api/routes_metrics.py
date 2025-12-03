from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.services.metrics_service import get_campaigns, get_orders, get_summary
from app.schemas.metrics import CampaignPerformance, MetricsSummary, OrdersResponse

router = APIRouter()


def _resolve_dates(from_date: date | None, to_date: date | None) -> tuple[date, date]:
    today = date.today()
    to_date = to_date or today
    from_date = from_date or (to_date - timedelta(days=7))

    if from_date > to_date:
        raise HTTPException(status_code=400, detail="'from' date cannot be after 'to' date")
    return from_date, to_date


@router.get("/summary", response_model=MetricsSummary)
def summary(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    resolved_from, resolved_to = _resolve_dates(from_date, to_date)
    return get_summary(db, user.account_id, resolved_from, resolved_to)


@router.get("/campaigns", response_model=list[CampaignPerformance])
def campaigns(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    resolved_from, resolved_to = _resolve_dates(from_date, to_date)
    return get_campaigns(db, user.account_id, resolved_from, resolved_to)


@router.get("/orders", response_model=OrdersResponse)
def orders(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    resolved_from, resolved_to = _resolve_dates(from_date, to_date)

    total, rows = get_orders(db, user.account_id, resolved_from, resolved_to, limit, offset)
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
