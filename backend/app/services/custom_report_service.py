"""
Service for custom report management and execution.
"""
import json
from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple, Dict, Any
from collections import defaultdict

from sqlalchemy import func, desc, asc
from sqlalchemy.orm import Session

from app.models.custom_report import CustomReport, VisualizationType
from app.models.ad_spend import AdSpend
from app.models.order import Order
from app.schemas.custom_report import (
    CustomReportCreate, 
    CustomReportUpdate, 
    ReportConfig,
    ReportFilter,
    FilterOperator,
    METRICS_METADATA,
    DIMENSIONS_METADATA,
)


def get_date_range_from_string(date_range: str, custom_from: Optional[str] = None, custom_to: Optional[str] = None) -> Tuple[date, date]:
    """Convert date range string to actual dates."""
    today = date.today()
    
    if date_range == "custom" and custom_from and custom_to:
        return date.fromisoformat(custom_from), date.fromisoformat(custom_to)
    
    range_map = {
        "today": (today, today),
        "yesterday": (today - timedelta(days=1), today - timedelta(days=1)),
        "7d": (today - timedelta(days=7), today),
        "14d": (today - timedelta(days=14), today),
        "30d": (today - timedelta(days=30), today),
        "60d": (today - timedelta(days=60), today),
        "90d": (today - timedelta(days=90), today),
        "this_month": (today.replace(day=1), today),
        "last_month": (
            (today.replace(day=1) - timedelta(days=1)).replace(day=1),
            today.replace(day=1) - timedelta(days=1)
        ),
    }
    
    return range_map.get(date_range, (today - timedelta(days=30), today))


def get_custom_reports(
    db: Session,
    account_id: str,
    user_id: str,
    include_shared: bool = True,
    favorites_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[int, List[CustomReport]]:
    """Get all custom reports for an account."""
    query = db.query(CustomReport).filter(CustomReport.account_id == account_id)
    
    if include_shared:
        query = query.filter(
            (CustomReport.user_id == user_id) | (CustomReport.is_shared == True)
        )
    else:
        query = query.filter(CustomReport.user_id == user_id)
    
    if favorites_only:
        query = query.filter(CustomReport.is_favorite == True)
    
    total = query.count()
    items = query.order_by(CustomReport.updated_at.desc().nullsfirst(), CustomReport.created_at.desc()).offset(offset).limit(limit).all()
    
    return total, items


def get_custom_report(
    db: Session,
    report_id: str,
    account_id: str,
    user_id: str,
) -> Optional[CustomReport]:
    """Get a specific custom report."""
    report = db.query(CustomReport).filter(
        CustomReport.id == report_id,
        CustomReport.account_id == account_id,
    ).first()
    
    if not report:
        return None
    
    # Check access: owner or shared
    if report.user_id != user_id and not report.is_shared:
        return None
    
    return report


def create_custom_report(
    db: Session,
    account_id: str,
    user_id: str,
    data: CustomReportCreate,
) -> CustomReport:
    """Create a new custom report."""
    report = CustomReport(
        account_id=account_id,
        user_id=user_id,
        name=data.name,
        description=data.description,
        config_json=json.dumps(data.config.model_dump()),
        visualization_type=data.visualization_type,
        is_shared=data.is_shared,
        is_favorite=data.is_favorite,
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def update_custom_report(
    db: Session,
    report: CustomReport,
    user_id: str,
    data: CustomReportUpdate,
) -> Optional[CustomReport]:
    """Update a custom report. Only owner can update."""
    if report.user_id != user_id:
        return None
    
    if data.name is not None:
        report.name = data.name
    
    if data.description is not None:
        report.description = data.description
    
    if data.config is not None:
        report.config_json = json.dumps(data.config.model_dump())
    
    if data.visualization_type is not None:
        report.visualization_type = data.visualization_type
    
    if data.is_shared is not None:
        report.is_shared = data.is_shared
    
    if data.is_favorite is not None:
        report.is_favorite = data.is_favorite
    
    db.commit()
    db.refresh(report)
    return report


def delete_custom_report(
    db: Session,
    report: CustomReport,
    user_id: str,
) -> bool:
    """Delete a custom report. Only owner can delete."""
    if report.user_id != user_id:
        return False
    
    db.delete(report)
    db.commit()
    return True


def duplicate_custom_report(
    db: Session,
    report: CustomReport,
    user_id: str,
    new_name: Optional[str] = None,
) -> CustomReport:
    """Duplicate an existing report."""
    new_report = CustomReport(
        account_id=report.account_id,
        user_id=user_id,
        name=new_name or f"{report.name} (Copy)",
        description=report.description,
        config_json=report.config_json,
        visualization_type=report.visualization_type,
        is_shared=False,  # Duplicates start as private
        is_favorite=False,
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report


def execute_custom_report(
    db: Session,
    account_id: str,
    config: ReportConfig,
) -> Dict[str, Any]:
    """Execute a custom report and return the results."""
    date_from, date_to = get_date_range_from_string(
        config.date_range,
        config.custom_date_from,
        config.custom_date_to
    )
    
    # Determine which data sources we need
    needs_ad_data = any(m in ["spend", "impressions", "clicks", "conversions", "ctr", "cpc", "cpa", "roas", "profit"] for m in config.metrics)
    needs_order_data = any(m in ["revenue", "orders", "aov", "roas", "profit"] for m in config.metrics)
    needs_platform_dimension = "platform" in config.dimensions
    needs_campaign_dimension = "campaign" in config.dimensions
    
    # Build the query based on dimensions
    data = []
    summary = {}
    
    if "date" in config.dimensions:
        data = _execute_date_dimension_query(
            db, account_id, date_from, date_to, config,
            needs_ad_data, needs_order_data
        )
    elif needs_platform_dimension:
        data = _execute_platform_dimension_query(
            db, account_id, date_from, date_to, config
        )
    elif needs_campaign_dimension:
        data = _execute_campaign_dimension_query(
            db, account_id, date_from, date_to, config
        )
    else:
        # Single row summary
        data = [_execute_summary_query(db, account_id, date_from, date_to, config)]
    
    # Apply filters
    data = _apply_filters(data, config.filters)
    
    # Apply sorting
    if config.sort_by and data:
        reverse = config.sort_direction == "desc"
        try:
            data = sorted(data, key=lambda x: x.get(config.sort_by, 0) or 0, reverse=reverse)
        except (TypeError, KeyError):
            pass
    
    # Apply limit
    data = data[:config.limit]
    
    # Calculate summary
    summary = _calculate_summary(data, config.metrics)
    
    # Get comparison data if requested
    comparison_data = None
    comparison_summary = None
    
    if config.compare_previous_period:
        period_length = (date_to - date_from).days + 1
        prev_date_from = date_from - timedelta(days=period_length)
        prev_date_to = date_from - timedelta(days=1)
        
        prev_config = config.model_copy()
        prev_config.compare_previous_period = False
        
        if "date" in config.dimensions:
            comparison_data = _execute_date_dimension_query(
                db, account_id, prev_date_from, prev_date_to, prev_config,
                needs_ad_data, needs_order_data
            )
        elif needs_platform_dimension:
            comparison_data = _execute_platform_dimension_query(
                db, account_id, prev_date_from, prev_date_to, prev_config
            )
        elif needs_campaign_dimension:
            comparison_data = _execute_campaign_dimension_query(
                db, account_id, prev_date_from, prev_date_to, prev_config
            )
        else:
            comparison_data = [_execute_summary_query(db, account_id, prev_date_from, prev_date_to, prev_config)]
        
        comparison_summary = _calculate_summary(comparison_data, config.metrics)
    
    return {
        "data": data,
        "summary": summary,
        "total_rows": len(data),
        "comparison_data": comparison_data,
        "comparison_summary": comparison_summary,
    }


def _execute_date_dimension_query(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    config: ReportConfig,
    needs_ad_data: bool,
    needs_order_data: bool,
) -> List[Dict[str, Any]]:
    """Execute query grouped by date."""
    results_by_date = defaultdict(lambda: {"date": None})
    
    if needs_ad_data:
        ad_query = (
            db.query(
                AdSpend.date,
                func.sum(AdSpend.cost).label("spend"),
                func.sum(AdSpend.impressions).label("impressions"),
                func.sum(AdSpend.clicks).label("clicks"),
                func.sum(AdSpend.conversions).label("conversions"),
            )
            .filter(
                AdSpend.account_id == account_id,
                AdSpend.date.between(date_from, date_to)
            )
            .group_by(AdSpend.date)
            .order_by(AdSpend.date)
        )
        
        for row in ad_query.all():
            date_str = str(row.date)
            results_by_date[date_str]["date"] = date_str
            results_by_date[date_str]["spend"] = float(row.spend or 0)
            results_by_date[date_str]["impressions"] = int(row.impressions or 0)
            results_by_date[date_str]["clicks"] = int(row.clicks or 0)
            results_by_date[date_str]["conversions"] = int(row.conversions or 0)
    
    if needs_order_data:
        order_query = (
            db.query(
                func.date(Order.date_time).label("order_date"),
                func.sum(Order.total_amount).label("revenue"),
                func.count(Order.id).label("orders"),
            )
            .filter(
                Order.account_id == account_id,
                Order.date_time.between(date_from, date_to)
            )
            .group_by(func.date(Order.date_time))
        )
        
        for row in order_query.all():
            date_str = str(row.order_date)
            results_by_date[date_str]["date"] = date_str
            results_by_date[date_str]["revenue"] = float(row.revenue or 0)
            results_by_date[date_str]["orders"] = int(row.orders or 0)
    
    # Calculate derived metrics
    data = []
    for date_str, row in sorted(results_by_date.items()):
        result = {"date": date_str}
        
        spend = row.get("spend", 0)
        revenue = row.get("revenue", 0)
        impressions = row.get("impressions", 0)
        clicks = row.get("clicks", 0)
        conversions = row.get("conversions", 0)
        orders = row.get("orders", 0)
        
        for metric in config.metrics:
            if metric == "revenue":
                result["revenue"] = revenue
            elif metric == "spend":
                result["spend"] = spend
            elif metric == "profit":
                result["profit"] = revenue - spend
            elif metric == "roas":
                result["roas"] = round(revenue / spend, 2) if spend > 0 else 0
            elif metric == "impressions":
                result["impressions"] = impressions
            elif metric == "clicks":
                result["clicks"] = clicks
            elif metric == "conversions":
                result["conversions"] = conversions
            elif metric == "ctr":
                result["ctr"] = round((clicks / impressions * 100), 2) if impressions > 0 else 0
            elif metric == "cpc":
                result["cpc"] = round(spend / clicks, 2) if clicks > 0 else 0
            elif metric == "cpa":
                result["cpa"] = round(spend / conversions, 2) if conversions > 0 else 0
            elif metric == "aov":
                result["aov"] = round(revenue / orders, 2) if orders > 0 else 0
            elif metric == "orders":
                result["orders"] = orders
        
        data.append(result)
    
    return data


def _execute_platform_dimension_query(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    config: ReportConfig,
) -> List[Dict[str, Any]]:
    """Execute query grouped by platform."""
    ad_query = (
        db.query(
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.date.between(date_from, date_to)
        )
        .group_by(AdSpend.platform)
        .order_by(desc(func.sum(AdSpend.cost)))
    )
    
    # Get order revenue by utm_source (maps to platform)
    order_query = (
        db.query(
            Order.utm_source,
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(
            Order.account_id == account_id,
            Order.date_time.between(date_from, date_to)
        )
        .group_by(Order.utm_source)
    )
    
    revenue_by_source = {row.utm_source: {"revenue": float(row.revenue or 0), "orders": int(row.orders or 0)} for row in order_query.all()}
    
    data = []
    for row in ad_query.all():
        spend = float(row.spend or 0)
        impressions = int(row.impressions or 0)
        clicks = int(row.clicks or 0)
        conversions = int(row.conversions or 0)
        
        # Try to match platform to utm_source
        revenue_data = revenue_by_source.get(row.platform, {"revenue": 0, "orders": 0})
        revenue = revenue_data["revenue"]
        orders = revenue_data["orders"]
        
        result = {"platform": row.platform}
        
        for metric in config.metrics:
            if metric == "revenue":
                result["revenue"] = revenue
            elif metric == "spend":
                result["spend"] = spend
            elif metric == "profit":
                result["profit"] = revenue - spend
            elif metric == "roas":
                result["roas"] = round(revenue / spend, 2) if spend > 0 else 0
            elif metric == "impressions":
                result["impressions"] = impressions
            elif metric == "clicks":
                result["clicks"] = clicks
            elif metric == "conversions":
                result["conversions"] = conversions
            elif metric == "ctr":
                result["ctr"] = round((clicks / impressions * 100), 2) if impressions > 0 else 0
            elif metric == "cpc":
                result["cpc"] = round(spend / clicks, 2) if clicks > 0 else 0
            elif metric == "cpa":
                result["cpa"] = round(spend / conversions, 2) if conversions > 0 else 0
            elif metric == "aov":
                result["aov"] = round(revenue / orders, 2) if orders > 0 else 0
            elif metric == "orders":
                result["orders"] = orders
        
        data.append(result)
    
    return data


def _execute_campaign_dimension_query(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    config: ReportConfig,
) -> List[Dict[str, Any]]:
    """Execute query grouped by campaign."""
    ad_query = (
        db.query(
            AdSpend.campaign_name,
            AdSpend.platform,
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.date.between(date_from, date_to)
        )
        .group_by(AdSpend.campaign_name, AdSpend.platform)
        .order_by(desc(func.sum(AdSpend.cost)))
    )
    
    data = []
    for row in ad_query.all():
        spend = float(row.spend or 0)
        impressions = int(row.impressions or 0)
        clicks = int(row.clicks or 0)
        conversions = int(row.conversions or 0)
        
        result = {
            "campaign": row.campaign_name or "Unknown Campaign",
            "platform": row.platform,
        }
        
        for metric in config.metrics:
            if metric == "spend":
                result["spend"] = spend
            elif metric == "impressions":
                result["impressions"] = impressions
            elif metric == "clicks":
                result["clicks"] = clicks
            elif metric == "conversions":
                result["conversions"] = conversions
            elif metric == "ctr":
                result["ctr"] = round((clicks / impressions * 100), 2) if impressions > 0 else 0
            elif metric == "cpc":
                result["cpc"] = round(spend / clicks, 2) if clicks > 0 else 0
            elif metric == "cpa":
                result["cpa"] = round(spend / conversions, 2) if conversions > 0 else 0
            # Note: revenue/roas/profit require attribution model, showing 0 for now
            elif metric in ["revenue", "profit"]:
                result[metric] = 0
            elif metric == "roas":
                result["roas"] = 0
            elif metric == "aov":
                result["aov"] = 0
            elif metric == "orders":
                result["orders"] = 0
        
        data.append(result)
    
    return data


def _execute_summary_query(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    config: ReportConfig,
) -> Dict[str, Any]:
    """Execute summary query (no dimensions)."""
    # Ad spend totals
    ad_result = (
        db.query(
            func.sum(AdSpend.cost).label("spend"),
            func.sum(AdSpend.impressions).label("impressions"),
            func.sum(AdSpend.clicks).label("clicks"),
            func.sum(AdSpend.conversions).label("conversions"),
        )
        .filter(
            AdSpend.account_id == account_id,
            AdSpend.date.between(date_from, date_to)
        )
        .first()
    )
    
    # Order totals
    order_result = (
        db.query(
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .filter(
            Order.account_id == account_id,
            Order.date_time.between(date_from, date_to)
        )
        .first()
    )
    
    spend = float(ad_result.spend or 0)
    impressions = int(ad_result.impressions or 0)
    clicks = int(ad_result.clicks or 0)
    conversions = int(ad_result.conversions or 0)
    revenue = float(order_result.revenue or 0)
    orders = int(order_result.orders or 0)
    
    result = {}
    
    for metric in config.metrics:
        if metric == "revenue":
            result["revenue"] = revenue
        elif metric == "spend":
            result["spend"] = spend
        elif metric == "profit":
            result["profit"] = revenue - spend
        elif metric == "roas":
            result["roas"] = round(revenue / spend, 2) if spend > 0 else 0
        elif metric == "impressions":
            result["impressions"] = impressions
        elif metric == "clicks":
            result["clicks"] = clicks
        elif metric == "conversions":
            result["conversions"] = conversions
        elif metric == "ctr":
            result["ctr"] = round((clicks / impressions * 100), 2) if impressions > 0 else 0
        elif metric == "cpc":
            result["cpc"] = round(spend / clicks, 2) if clicks > 0 else 0
        elif metric == "cpa":
            result["cpa"] = round(spend / conversions, 2) if conversions > 0 else 0
        elif metric == "aov":
            result["aov"] = round(revenue / orders, 2) if orders > 0 else 0
        elif metric == "orders":
            result["orders"] = orders
    
    return result


def _apply_filters(data: List[Dict[str, Any]], filters: List[ReportFilter]) -> List[Dict[str, Any]]:
    """Apply filters to the data."""
    if not filters:
        return data
    
    filtered = []
    for row in data:
        passes_all = True
        for f in filters:
            value = row.get(f.field)
            if value is None:
                passes_all = False
                break
            
            if f.operator == FilterOperator.EQUALS:
                passes_all = value == f.value
            elif f.operator == FilterOperator.NOT_EQUALS:
                passes_all = value != f.value
            elif f.operator == FilterOperator.GREATER_THAN:
                passes_all = value > f.value
            elif f.operator == FilterOperator.GREATER_THAN_OR_EQUALS:
                passes_all = value >= f.value
            elif f.operator == FilterOperator.LESS_THAN:
                passes_all = value < f.value
            elif f.operator == FilterOperator.LESS_THAN_OR_EQUALS:
                passes_all = value <= f.value
            elif f.operator == FilterOperator.CONTAINS:
                passes_all = str(f.value).lower() in str(value).lower()
            elif f.operator == FilterOperator.IN:
                passes_all = value in f.value
            
            if not passes_all:
                break
        
        if passes_all:
            filtered.append(row)
    
    return filtered


def _calculate_summary(data: List[Dict[str, Any]], metrics: List[str]) -> Dict[str, Any]:
    """Calculate summary statistics for the data."""
    if not data:
        return {m: 0 for m in metrics}
    
    summary = {}
    
    for metric in metrics:
        values = [row.get(metric, 0) or 0 for row in data]
        
        if metric in ["ctr", "cpc", "cpa", "aov", "roas"]:
            # For rate/average metrics, calculate from totals
            if metric == "roas":
                total_revenue = sum(row.get("revenue", 0) or 0 for row in data)
                total_spend = sum(row.get("spend", 0) or 0 for row in data)
                summary[metric] = round(total_revenue / total_spend, 2) if total_spend > 0 else 0
            elif metric == "ctr":
                total_clicks = sum(row.get("clicks", 0) or 0 for row in data)
                total_impressions = sum(row.get("impressions", 0) or 0 for row in data)
                summary[metric] = round((total_clicks / total_impressions * 100), 2) if total_impressions > 0 else 0
            elif metric == "cpc":
                total_spend = sum(row.get("spend", 0) or 0 for row in data)
                total_clicks = sum(row.get("clicks", 0) or 0 for row in data)
                summary[metric] = round(total_spend / total_clicks, 2) if total_clicks > 0 else 0
            elif metric == "cpa":
                total_spend = sum(row.get("spend", 0) or 0 for row in data)
                total_conversions = sum(row.get("conversions", 0) or 0 for row in data)
                summary[metric] = round(total_spend / total_conversions, 2) if total_conversions > 0 else 0
            elif metric == "aov":
                total_revenue = sum(row.get("revenue", 0) or 0 for row in data)
                total_orders = sum(row.get("orders", 0) or 0 for row in data)
                summary[metric] = round(total_revenue / total_orders, 2) if total_orders > 0 else 0
        else:
            # For count/sum metrics, just sum
            summary[metric] = sum(values)
    
    return summary


def get_report_metadata():
    """Get available metrics and dimensions for report builder UI."""
    return {
        "metrics": METRICS_METADATA,
        "dimensions": DIMENSIONS_METADATA,
    }
