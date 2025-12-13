"""
Routes for product profitability analytics.
Available to Pro and Enterprise plans only.
"""
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.user import User
from app.models.account import AccountPlan
from app.services import product_profitability_service


router = APIRouter()


class ProductProfitabilityItem(BaseModel):
    product_id: str
    product_name: str
    revenue: float
    units_sold: int
    avg_price: float
    cogs: float
    allocated_ad_spend: float
    gross_profit: float
    profit_margin: float


class ProductProfitabilityTotals(BaseModel):
    product_count: int
    total_revenue: float
    total_units: int
    total_cogs: float
    total_ad_spend: float
    total_gross_profit: float
    avg_profit_margin: float


class ProductProfitabilityNotes(BaseModel):
    ad_spend_allocation: str
    cogs_note: str


class ProductProfitabilityResponse(BaseModel):
    date_from: str
    date_to: str
    products: list[ProductProfitabilityItem]
    totals: ProductProfitabilityTotals
    notes: ProductProfitabilityNotes


# Plans that have access to product profitability
ALLOWED_PLANS = {AccountPlan.PRO, AccountPlan.ENTERPRISE}


def check_plan_access(user: User) -> None:
    """Check if user's plan allows access to product profitability."""
    if user.account.plan not in ALLOWED_PLANS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "plan_required",
                "message": "Per-product profitability is available on Pro and Enterprise plans.",
                "current_plan": user.account.plan.value if user.account.plan else "free",
                "upgrade_url": "/pricing",
            },
        )


@router.get("", response_model=ProductProfitabilityResponse)
def get_product_profitability(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_account_user),
    from_date: Optional[str] = Query(None, alias="from", description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, alias="to", description="End date (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=200, description="Max products to return"),
    sort_by: str = Query("revenue", description="Sort field: revenue, units_sold, gross_profit, profit_margin"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
):
    """
    Get per-product profitability metrics.
    
    Calculates for each product:
    - Revenue
    - Units sold
    - COGS (cost of goods sold, if available)
    - Allocated ad spend (proportional by revenue)
    - Gross profit
    - Profit margin %
    
    Available on Pro and Enterprise plans only.
    """
    # Check plan access
    check_plan_access(user)
    
    # Parse dates (default to last 30 days)
    try:
        date_to = date.fromisoformat(to_date) if to_date else date.today()
        date_from = date.fromisoformat(from_date) if from_date else date_to - timedelta(days=30)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )
    
    # Get profitability data
    result = product_profitability_service.get_product_profitability(
        db=db,
        account_id=user.account_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    
    return result


@router.get("/available")
def check_product_data_available(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_account_user),
):
    """Check if the account has product-level data for profitability analysis."""
    # Check plan access first
    check_plan_access(user)
    
    has_data = product_profitability_service.has_product_data(db, user.account_id)
    
    return {
        "has_data": has_data,
        "message": "Product data available" if has_data else "No product data found. Generate sample data or connect a Shopify integration.",
    }
