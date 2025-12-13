"""
Product Profitability Service

Computes per-product profitability metrics using OrderItem data.
Ad spend is allocated proportionally by revenue.
"""
from datetime import date
from typing import List, Optional
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem
from app.models.order import Order
from app.models.ad_spend import AdSpend


def get_product_profitability(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    limit: int = 50,
    sort_by: str = "revenue",
    sort_order: str = "desc",
) -> dict:
    """
    Calculate per-product profitability metrics.
    
    Returns:
        - List of products with revenue, units, COGS, allocated ad spend, profit, margin
        - Summary totals
    
    Note: Ad spend is allocated proportionally by revenue share.
    This is a simplified approach - more sophisticated attribution would require
    product-level ad tracking which is not available in the current data model.
    """
    # Get total ad spend for the period (to allocate proportionally)
    total_spend_result = (
        db.query(func.coalesce(func.sum(AdSpend.cost), 0))
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.date.between(date_from, date_to),
        )
        .scalar()
    )
    total_ad_spend = float(total_spend_result or 0)
    
    # Get product-level aggregates
    # Join OrderItem with Order to filter by date
    product_metrics = (
        db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.total_price).label("revenue"),
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(
                func.coalesce(OrderItem.cost_per_unit, 0) * OrderItem.quantity
            ).label("total_cogs"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            OrderItem.account_id == account_id,
            Order.date_time.between(date_from, date_to),
        )
        .group_by(OrderItem.product_id, OrderItem.product_name)
        .all()
    )
    
    # Calculate total revenue for ad spend allocation
    total_revenue = sum(float(p.revenue or 0) for p in product_metrics)
    
    # Build product list with profitability calculations
    products = []
    for p in product_metrics:
        revenue = float(p.revenue or 0)
        units_sold = int(p.units_sold or 0)
        cogs = float(p.total_cogs or 0)
        
        # Allocate ad spend proportionally by revenue share
        # This is a simplification - real attribution would be more sophisticated
        revenue_share = revenue / total_revenue if total_revenue > 0 else 0
        allocated_ad_spend = total_ad_spend * revenue_share
        
        # Calculate gross profit and margin
        gross_profit = revenue - cogs - allocated_ad_spend
        profit_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
        
        products.append({
            "product_id": p.product_id,
            "product_name": p.product_name,
            "revenue": round(revenue, 2),
            "units_sold": units_sold,
            "avg_price": round(revenue / units_sold, 2) if units_sold > 0 else 0,
            "cogs": round(cogs, 2),
            "allocated_ad_spend": round(allocated_ad_spend, 2),
            "gross_profit": round(gross_profit, 2),
            "profit_margin": round(profit_margin, 1),
        })
    
    # Sort products
    sort_key = sort_by if sort_by in ["revenue", "units_sold", "gross_profit", "profit_margin"] else "revenue"
    reverse = sort_order.lower() != "asc"
    products.sort(key=lambda x: x.get(sort_key, 0), reverse=reverse)
    
    # Apply limit
    products = products[:limit]
    
    # Calculate totals
    total_revenue_sum = sum(p["revenue"] for p in products)
    total_units = sum(p["units_sold"] for p in products)
    total_cogs = sum(p["cogs"] for p in products)
    total_ad_spend_allocated = sum(p["allocated_ad_spend"] for p in products)
    total_gross_profit = sum(p["gross_profit"] for p in products)
    avg_margin = total_gross_profit / total_revenue_sum * 100 if total_revenue_sum > 0 else 0
    
    return {
        "date_from": str(date_from),
        "date_to": str(date_to),
        "products": products,
        "totals": {
            "product_count": len(products),
            "total_revenue": round(total_revenue_sum, 2),
            "total_units": total_units,
            "total_cogs": round(total_cogs, 2),
            "total_ad_spend": round(total_ad_spend_allocated, 2),
            "total_gross_profit": round(total_gross_profit, 2),
            "avg_profit_margin": round(avg_margin, 1),
        },
        "notes": {
            "ad_spend_allocation": "Ad spend allocated proportionally by revenue share",
            "cogs_note": "COGS from cost_per_unit field. Shows 0 if not available.",
        },
    }


def has_product_data(db: Session, account_id: str) -> bool:
    """Check if the account has any order item data."""
    count = (
        db.query(func.count(OrderItem.id))
        .filter(OrderItem.account_id == account_id)
        .scalar()
    )
    return count > 0
