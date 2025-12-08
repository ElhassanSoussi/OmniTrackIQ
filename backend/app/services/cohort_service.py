"""
Cohort analysis service.
Analyzes customer behavior by grouping users based on their first purchase date.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
from enum import Enum

from sqlalchemy import func, and_, extract
from sqlalchemy.orm import Session

from app.models.order import Order


class CohortPeriod(str, Enum):
    """Time period for cohort grouping."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


def get_period_key(dt: datetime, period: CohortPeriod) -> str:
    """Get the period key for a datetime based on the cohort period."""
    if period == CohortPeriod.DAILY:
        return dt.strftime("%Y-%m-%d")
    elif period == CohortPeriod.WEEKLY:
        # ISO week
        return dt.strftime("%Y-W%W")
    else:  # MONTHLY
        return dt.strftime("%Y-%m")


def get_period_number(cohort_dt: datetime, order_dt: datetime, period: CohortPeriod) -> int:
    """Calculate the number of periods between cohort date and order date."""
    if period == CohortPeriod.DAILY:
        return (order_dt.date() - cohort_dt.date()).days
    elif period == CohortPeriod.WEEKLY:
        return (order_dt.date() - cohort_dt.date()).days // 7
    else:  # MONTHLY
        return (order_dt.year - cohort_dt.year) * 12 + (order_dt.month - cohort_dt.month)


def get_retention_cohorts(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    period: CohortPeriod = CohortPeriod.MONTHLY,
    max_periods: int = 12,
) -> Dict:
    """
    Generate retention cohort analysis.
    Groups customers by their first purchase date and tracks repeat purchases.
    
    Returns:
        - cohorts: List of cohort data with retention rates per period
        - summary: Overall retention statistics
    """
    # Get all orders in the analysis window (extended for tracking retention)
    extended_to = date_to + timedelta(days=365)  # Look ahead for retention
    
    orders = db.query(Order).filter(
        Order.account_id == account_id,
        Order.customer_email.isnot(None),
        Order.date_time.between(date_from, extended_to),
    ).order_by(Order.date_time).all()
    
    # Group orders by customer
    customer_orders = defaultdict(list)
    for order in orders:
        if order.customer_email:
            customer_orders[order.customer_email].append(order)
    
    # Find first purchase date for each customer
    customer_cohorts = {}
    for email, orders_list in customer_orders.items():
        first_order = min(orders_list, key=lambda o: o.date_time)
        # Only include customers whose first purchase is in the analysis range
        if date_from <= first_order.date_time.date() <= date_to:
            cohort_key = get_period_key(first_order.date_time, period)
            customer_cohorts[email] = {
                "cohort": cohort_key,
                "first_order_date": first_order.date_time,
                "orders": orders_list,
            }
    
    # Build cohort data
    cohort_data = defaultdict(lambda: {
        "cohort_size": 0,
        "periods": defaultdict(lambda: {"customers": set(), "revenue": 0, "orders": 0}),
    })
    
    for email, data in customer_cohorts.items():
        cohort_key = data["cohort"]
        first_order_date = data["first_order_date"]
        cohort_data[cohort_key]["cohort_size"] += 1
        
        for order in data["orders"]:
            period_num = get_period_number(first_order_date, order.date_time, period)
            if 0 <= period_num <= max_periods:
                cohort_data[cohort_key]["periods"][period_num]["customers"].add(email)
                cohort_data[cohort_key]["periods"][period_num]["revenue"] += float(order.total_amount or 0)
                cohort_data[cohort_key]["periods"][period_num]["orders"] += 1
    
    # Convert to output format
    cohorts = []
    for cohort_key in sorted(cohort_data.keys()):
        data = cohort_data[cohort_key]
        cohort_size = data["cohort_size"]
        
        periods = []
        for period_num in range(max_periods + 1):
            period_data = data["periods"][period_num]
            active_customers = len(period_data["customers"])
            retention_rate = (active_customers / cohort_size * 100) if cohort_size > 0 else 0
            
            periods.append({
                "period": period_num,
                "active_customers": active_customers,
                "retention_rate": round(retention_rate, 1),
                "revenue": round(period_data["revenue"], 2),
                "orders": period_data["orders"],
            })
        
        cohorts.append({
            "cohort": cohort_key,
            "cohort_size": cohort_size,
            "periods": periods,
        })
    
    # Calculate summary statistics
    total_customers = sum(c["cohort_size"] for c in cohorts)
    
    # Average retention by period
    avg_retention = []
    for period_num in range(max_periods + 1):
        total_rate = sum(
            c["periods"][period_num]["retention_rate"] * c["cohort_size"]
            for c in cohorts if len(c["periods"]) > period_num
        )
        total_size = sum(c["cohort_size"] for c in cohorts if len(c["periods"]) > period_num)
        avg_rate = total_rate / total_size if total_size > 0 else 0
        avg_retention.append({
            "period": period_num,
            "avg_retention_rate": round(avg_rate, 1),
        })
    
    return {
        "period_type": period.value,
        "date_from": str(date_from),
        "date_to": str(date_to),
        "total_customers": total_customers,
        "cohorts": cohorts,
        "avg_retention": avg_retention,
    }


def get_revenue_cohorts(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    period: CohortPeriod = CohortPeriod.MONTHLY,
    max_periods: int = 12,
) -> Dict:
    """
    Generate revenue-focused cohort analysis.
    Shows cumulative and period revenue for each cohort.
    """
    retention_data = get_retention_cohorts(db, account_id, date_from, date_to, period, max_periods)
    
    # Enhance with revenue metrics
    for cohort in retention_data["cohorts"]:
        cumulative_revenue = 0
        for period_data in cohort["periods"]:
            cumulative_revenue += period_data["revenue"]
            period_data["cumulative_revenue"] = round(cumulative_revenue, 2)
            
            # Revenue per customer
            if cohort["cohort_size"] > 0:
                period_data["revenue_per_customer"] = round(
                    cumulative_revenue / cohort["cohort_size"], 2
                )
            else:
                period_data["revenue_per_customer"] = 0
        
        # Calculate LTV estimate (cumulative revenue / cohort size)
        cohort["estimated_ltv"] = round(
            cumulative_revenue / cohort["cohort_size"], 2
        ) if cohort["cohort_size"] > 0 else 0
    
    # Add average LTV by period
    avg_ltv = []
    for period_num in range(max_periods + 1):
        total_ltv = sum(
            c["periods"][period_num].get("revenue_per_customer", 0) * c["cohort_size"]
            for c in retention_data["cohorts"] if len(c["periods"]) > period_num
        )
        total_size = sum(
            c["cohort_size"] 
            for c in retention_data["cohorts"] if len(c["periods"]) > period_num
        )
        avg = total_ltv / total_size if total_size > 0 else 0
        avg_ltv.append({
            "period": period_num,
            "avg_ltv": round(avg, 2),
        })
    
    retention_data["avg_ltv"] = avg_ltv
    retention_data["report_type"] = "revenue"
    
    return retention_data


def get_channel_cohorts(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    period: CohortPeriod = CohortPeriod.MONTHLY,
) -> Dict:
    """
    Cohort analysis segmented by acquisition channel.
    Shows how retention varies by the channel that acquired the customer.
    """
    # Get all orders
    orders = db.query(Order).filter(
        Order.account_id == account_id,
        Order.customer_email.isnot(None),
        Order.date_time >= date_from,
    ).order_by(Order.date_time).all()
    
    # Group by customer
    customer_orders = defaultdict(list)
    for order in orders:
        if order.customer_email:
            customer_orders[order.customer_email].append(order)
    
    # Determine acquisition channel for each customer (from first order)
    channel_cohorts = defaultdict(lambda: defaultdict(lambda: {
        "customers": set(),
        "returning_customers": set(),
        "total_revenue": 0,
        "total_orders": 0,
    }))
    
    for email, orders_list in customer_orders.items():
        first_order = min(orders_list, key=lambda o: o.date_time)
        
        # Skip if first order is outside our date range
        if not (date_from <= first_order.date_time.date() <= date_to):
            continue
        
        channel = first_order.utm_source or first_order.attributed_channel or "direct"
        cohort_key = get_period_key(first_order.date_time, period)
        
        channel_cohorts[channel][cohort_key]["customers"].add(email)
        
        for order in orders_list:
            channel_cohorts[channel][cohort_key]["total_revenue"] += float(order.total_amount or 0)
            channel_cohorts[channel][cohort_key]["total_orders"] += 1
            
            # Check if this is a repeat purchase
            if order != first_order:
                channel_cohorts[channel][cohort_key]["returning_customers"].add(email)
    
    # Format output
    channels = []
    for channel, cohorts in channel_cohorts.items():
        cohort_list = []
        for cohort_key in sorted(cohorts.keys()):
            data = cohorts[cohort_key]
            total_customers = len(data["customers"])
            returning = len(data["returning_customers"])
            
            cohort_list.append({
                "cohort": cohort_key,
                "total_customers": total_customers,
                "returning_customers": returning,
                "retention_rate": round(returning / total_customers * 100, 1) if total_customers > 0 else 0,
                "total_revenue": round(data["total_revenue"], 2),
                "avg_ltv": round(data["total_revenue"] / total_customers, 2) if total_customers > 0 else 0,
            })
        
        channels.append({
            "channel": channel,
            "cohorts": cohort_list,
            "total_customers": sum(c["total_customers"] for c in cohort_list),
            "avg_retention": round(
                sum(c["retention_rate"] * c["total_customers"] for c in cohort_list) / 
                sum(c["total_customers"] for c in cohort_list), 1
            ) if cohort_list else 0,
        })
    
    # Sort by total customers
    channels.sort(key=lambda x: x["total_customers"], reverse=True)
    
    return {
        "period_type": period.value,
        "date_from": str(date_from),
        "date_to": str(date_to),
        "channels": channels,
    }
