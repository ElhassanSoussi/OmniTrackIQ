from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.services.metrics_service import get_campaigns, get_orders, get_summary

router = APIRouter()


@router.get("/summary")
def summary(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_summary(db, user.account_id, from_date, to_date)


@router.get("/campaigns")
def campaigns(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_campaigns(db, user.account_id, from_date, to_date)


@router.get("/orders")
def orders(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=7)
    return get_orders(db, user.account_id, from_date, to_date)
