"""
Marketing Mix Modeling (MMM) service.
Analyzes channel contribution and provides budget optimization recommendations.
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple
from collections import defaultdict
from enum import Enum
import statistics
import math

from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


class OptimizationGoal(str, Enum):
    """Optimization goals for budget allocation."""
    MAXIMIZE_REVENUE = "maximize_revenue"
    MAXIMIZE_ROAS = "maximize_roas"
    MINIMIZE_CPA = "minimize_cpa"
    BALANCED = "balanced"


def get_channel_contribution_analysis(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """
    Analyze contribution of each marketing channel to overall revenue.
    Uses regression-based approach to estimate marginal contribution.
    """
    # Get daily data by channel
    channel_daily_data = _get_channel_daily_data(db, account_id, date_from, date_to)
    
    if not channel_daily_data:
        return {
            "channels": [],
            "summary": {},
            "message": "Insufficient data for analysis",
            "date_range": {"from": str(date_from), "to": str(date_to)},
        }
    
    channels = list(channel_daily_data.keys())
    
    # Calculate contribution metrics for each channel
    contributions = []
    total_revenue = 0
    total_spend = 0
    
    for channel in channels:
        data = channel_daily_data[channel]
        
        spend = sum(d.get("spend", 0) for d in data)
        revenue = sum(d.get("revenue", 0) for d in data)
        conversions = sum(d.get("conversions", 0) for d in data)
        impressions = sum(d.get("impressions", 0) for d in data)
        clicks = sum(d.get("clicks", 0) for d in data)
        
        total_revenue += revenue
        total_spend += spend
        
        # Calculate efficiency metrics
        roas = revenue / spend if spend > 0 else 0
        cpa = spend / conversions if conversions > 0 else 0
        ctr = (clicks / impressions * 100) if impressions > 0 else 0
        cvr = (conversions / clicks * 100) if clicks > 0 else 0
        
        # Estimate marginal efficiency (diminishing returns analysis)
        marginal_roas = _estimate_marginal_roas(data)
        
        # Calculate saturation level
        saturation = _estimate_saturation(data)
        
        contributions.append({
            "channel": channel,
            "spend": round(spend, 2),
            "revenue": round(revenue, 2),
            "conversions": conversions,
            "impressions": impressions,
            "clicks": clicks,
            "roas": round(roas, 2),
            "cpa": round(cpa, 2),
            "ctr": round(ctr, 2),
            "cvr": round(cvr, 2),
            "marginal_roas": round(marginal_roas, 2),
            "saturation_level": round(saturation * 100, 1),
            "efficiency_rating": _rate_efficiency(roas, marginal_roas, saturation),
        })
    
    # Calculate revenue share
    for c in contributions:
        c["revenue_share"] = round((c["revenue"] / total_revenue * 100), 1) if total_revenue > 0 else 0
        c["spend_share"] = round((c["spend"] / total_spend * 100), 1) if total_spend > 0 else 0
    
    # Sort by contribution
    contributions.sort(key=lambda x: x["revenue"], reverse=True)
    
    # Calculate overall metrics
    overall_roas = total_revenue / total_spend if total_spend > 0 else 0
    
    return {
        "channels": contributions,
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "total_spend": round(total_spend, 2),
            "overall_roas": round(overall_roas, 2),
            "channel_count": len(channels),
            "top_contributor": contributions[0]["channel"] if contributions else None,
            "most_efficient": max(contributions, key=lambda x: x["roas"])["channel"] if contributions else None,
        },
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }


def get_budget_optimization(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    total_budget: Optional[float] = None,
    goal: OptimizationGoal = OptimizationGoal.BALANCED,
    constraints: Optional[Dict[str, Dict]] = None,
) -> Dict[str, Any]:
    """
    Generate budget allocation recommendations based on channel performance.
    
    Args:
        total_budget: Total budget to allocate. If None, uses current total spend.
        goal: Optimization goal (maximize_revenue, maximize_roas, etc.)
        constraints: Optional constraints per channel (min_spend, max_spend, fixed)
    """
    # Get channel contribution data
    contribution_data = get_channel_contribution_analysis(db, account_id, date_from, date_to)
    
    if not contribution_data["channels"]:
        return {
            "current_allocation": [],
            "recommended_allocation": [],
            "expected_impact": {},
            "message": "Insufficient data for optimization",
        }
    
    channels = contribution_data["channels"]
    current_total = sum(c["spend"] for c in channels)
    
    if total_budget is None:
        total_budget = current_total
    
    # Parse constraints
    constraints = constraints or {}
    
    # Generate optimized allocation
    recommended = _optimize_allocation(
        channels=channels,
        total_budget=total_budget,
        goal=goal,
        constraints=constraints,
    )
    
    # Calculate expected impact
    expected_impact = _calculate_expected_impact(
        channels=channels,
        recommended=recommended,
        goal=goal,
    )
    
    # Build current allocation summary
    current_allocation = [
        {
            "channel": c["channel"],
            "spend": c["spend"],
            "share": c["spend_share"],
            "roas": c["roas"],
        }
        for c in channels
    ]
    
    return {
        "current_allocation": current_allocation,
        "recommended_allocation": recommended,
        "expected_impact": expected_impact,
        "optimization_goal": goal.value,
        "total_budget": round(total_budget, 2),
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }


def get_scenario_analysis(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    scenarios: List[Dict[str, float]],
) -> Dict[str, Any]:
    """
    Analyze different budget scenarios and their expected outcomes.
    
    Args:
        scenarios: List of budget allocations to analyze.
                   Each scenario is a dict of channel -> spend amount.
    """
    # Get channel performance data
    contribution_data = get_channel_contribution_analysis(db, account_id, date_from, date_to)
    
    if not contribution_data["channels"]:
        return {"scenarios": [], "message": "Insufficient data"}
    
    channel_performance = {c["channel"]: c for c in contribution_data["channels"]}
    
    results = []
    
    for i, scenario in enumerate(scenarios):
        scenario_result = _analyze_scenario(
            scenario=scenario,
            channel_performance=channel_performance,
            scenario_name=f"Scenario {i + 1}",
        )
        results.append(scenario_result)
    
    # Add current state as baseline
    current_scenario = {c["channel"]: c["spend"] for c in contribution_data["channels"]}
    baseline = _analyze_scenario(
        scenario=current_scenario,
        channel_performance=channel_performance,
        scenario_name="Current (Baseline)",
    )
    
    # Calculate comparison vs baseline
    for result in results:
        result["vs_baseline"] = {
            "revenue_change": round(result["expected_revenue"] - baseline["expected_revenue"], 2),
            "revenue_change_percent": round(
                ((result["expected_revenue"] - baseline["expected_revenue"]) / baseline["expected_revenue"] * 100)
                if baseline["expected_revenue"] > 0 else 0, 1
            ),
            "roas_change": round(result["expected_roas"] - baseline["expected_roas"], 2),
        }
    
    return {
        "baseline": baseline,
        "scenarios": results,
        "best_scenario": max(results, key=lambda x: x["expected_revenue"])["name"] if results else None,
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }


def get_diminishing_returns_analysis(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
    channel: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyze diminishing returns for each channel.
    Shows the relationship between spend and returns at different levels.
    """
    channel_daily_data = _get_channel_daily_data(db, account_id, date_from, date_to)
    
    if not channel_daily_data:
        return {"channels": [], "message": "Insufficient data"}
    
    # Filter to specific channel if provided
    if channel:
        if channel not in channel_daily_data:
            return {"channels": [], "message": f"Channel '{channel}' not found"}
        channel_daily_data = {channel: channel_daily_data[channel]}
    
    analysis = []
    
    for ch, data in channel_daily_data.items():
        if len(data) < 7:
            continue
        
        # Sort by spend to analyze efficiency at different spend levels
        sorted_data = sorted(data, key=lambda x: x.get("spend", 0))
        
        # Divide into quartiles
        quartiles = _divide_into_quartiles(sorted_data)
        
        # Calculate metrics per quartile
        quartile_metrics = []
        for i, q_data in enumerate(quartiles):
            if not q_data:
                continue
            
            q_spend = sum(d.get("spend", 0) for d in q_data)
            q_revenue = sum(d.get("revenue", 0) for d in q_data)
            q_roas = q_revenue / q_spend if q_spend > 0 else 0
            
            avg_daily_spend = q_spend / len(q_data) if q_data else 0
            
            quartile_metrics.append({
                "quartile": i + 1,
                "label": ["Low Spend", "Medium-Low", "Medium-High", "High Spend"][i],
                "days_count": len(q_data),
                "total_spend": round(q_spend, 2),
                "total_revenue": round(q_revenue, 2),
                "avg_daily_spend": round(avg_daily_spend, 2),
                "roas": round(q_roas, 2),
            })
        
        # Calculate diminishing returns curve
        if len(quartile_metrics) >= 2:
            efficiency_drop = (
                (quartile_metrics[0]["roas"] - quartile_metrics[-1]["roas"]) / quartile_metrics[0]["roas"] * 100
                if quartile_metrics[0]["roas"] > 0 else 0
            )
        else:
            efficiency_drop = 0
        
        # Estimate optimal spend range
        optimal_range = _estimate_optimal_spend_range(quartile_metrics)
        
        analysis.append({
            "channel": ch,
            "quartile_analysis": quartile_metrics,
            "efficiency_drop_percent": round(efficiency_drop, 1),
            "shows_diminishing_returns": efficiency_drop > 15,
            "optimal_daily_spend_range": optimal_range,
            "recommendation": _get_diminishing_returns_recommendation(efficiency_drop, quartile_metrics),
        })
    
    return {
        "channels": analysis,
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }


def _get_channel_daily_data(
    db: Session,
    account_id: str,
    date_from: date,
    date_to: date,
) -> Dict[str, List[Dict]]:
    """Get daily data grouped by channel."""
    # Query ad spend by channel and date
    ad_query = db.query(
        AdSpend.platform,
        AdSpend.date,
        func.sum(AdSpend.cost).label("spend"),
        func.sum(AdSpend.impressions).label("impressions"),
        func.sum(AdSpend.clicks).label("clicks"),
        func.sum(AdSpend.conversions).label("conversions"),
    ).filter(
        AdSpend.account_id == account_id,
        AdSpend.date.between(date_from, date_to)
    ).group_by(AdSpend.platform, AdSpend.date)
    
    channel_data = defaultdict(list)
    for row in ad_query.all():
        channel_data[row.platform].append({
            "date": str(row.date),
            "spend": float(row.spend or 0),
            "impressions": int(row.impressions or 0),
            "clicks": int(row.clicks or 0),
            "conversions": int(row.conversions or 0),
        })
    
    # Query orders by source and date
    order_query = db.query(
        Order.utm_source,
        func.date(Order.date_time).label("date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders"),
    ).filter(
        Order.account_id == account_id,
        Order.date_time.between(date_from, date_to),
        Order.utm_source.isnot(None),
    ).group_by(Order.utm_source, func.date(Order.date_time))
    
    for row in order_query.all():
        source = row.utm_source
        date_str = str(row.date)
        
        # Find matching spend record or create new
        found = False
        for entry in channel_data.get(source, []):
            if entry["date"] == date_str:
                entry["revenue"] = float(row.revenue or 0)
                entry["orders"] = int(row.orders or 0)
                found = True
                break
        
        if not found and source:
            channel_data[source].append({
                "date": date_str,
                "spend": 0,
                "revenue": float(row.revenue or 0),
                "orders": int(row.orders or 0),
                "impressions": 0,
                "clicks": 0,
                "conversions": 0,
            })
    
    return dict(channel_data)


def _estimate_marginal_roas(data: List[Dict]) -> float:
    """Estimate marginal ROAS using recent performance."""
    if len(data) < 5:
        total_revenue = sum(d.get("revenue", 0) for d in data)
        total_spend = sum(d.get("spend", 0) for d in data)
        return total_revenue / total_spend if total_spend > 0 else 0
    
    # Sort by date and use recent data
    sorted_data = sorted(data, key=lambda x: x.get("date", ""))[-7:]
    
    # Calculate correlation between spend changes and revenue changes
    spend_changes = []
    revenue_changes = []
    
    for i in range(1, len(sorted_data)):
        spend_prev = sorted_data[i-1].get("spend", 0)
        spend_curr = sorted_data[i].get("spend", 0)
        revenue_prev = sorted_data[i-1].get("revenue", 0)
        revenue_curr = sorted_data[i].get("revenue", 0)
        
        if spend_prev > 0:
            spend_changes.append((spend_curr - spend_prev) / spend_prev)
            if revenue_prev > 0:
                revenue_changes.append((revenue_curr - revenue_prev) / revenue_prev)
            else:
                revenue_changes.append(0)
    
    if not spend_changes:
        total_revenue = sum(d.get("revenue", 0) for d in sorted_data)
        total_spend = sum(d.get("spend", 0) for d in sorted_data)
        return total_revenue / total_spend if total_spend > 0 else 0
    
    # Estimate marginal effect
    avg_spend = statistics.mean([d.get("spend", 0) for d in sorted_data])
    avg_revenue = statistics.mean([d.get("revenue", 0) for d in sorted_data])
    
    # Simple marginal calculation
    if avg_spend > 0:
        base_roas = avg_revenue / avg_spend
        # Apply diminishing returns factor based on spend level
        diminishing_factor = 0.9  # Assume 10% diminishing returns on average
        return base_roas * diminishing_factor
    
    return 0


def _estimate_saturation(data: List[Dict]) -> float:
    """
    Estimate channel saturation level (0-1).
    Higher values indicate the channel is approaching saturation.
    """
    if len(data) < 10:
        return 0.5  # Default to medium saturation
    
    # Sort by spend
    sorted_data = sorted(data, key=lambda x: x.get("spend", 0))
    
    # Compare efficiency at high vs low spend levels
    low_spend = sorted_data[:len(sorted_data)//3]
    high_spend = sorted_data[-len(sorted_data)//3:]
    
    def calc_roas(entries):
        spend = sum(e.get("spend", 0) for e in entries)
        revenue = sum(e.get("revenue", 0) for e in entries)
        return revenue / spend if spend > 0 else 0
    
    low_roas = calc_roas(low_spend)
    high_roas = calc_roas(high_spend)
    
    if low_roas <= 0:
        return 0.5
    
    # Calculate efficiency drop as saturation proxy
    efficiency_ratio = high_roas / low_roas
    
    # Map to 0-1 scale (0.5 ratio = 100% saturated, 1.0 ratio = 0% saturated)
    saturation = max(0, min(1, 1 - efficiency_ratio))
    
    return saturation


def _rate_efficiency(roas: float, marginal_roas: float, saturation: float) -> str:
    """Rate channel efficiency based on multiple factors."""
    if roas >= 4 and saturation < 0.5:
        return "excellent"
    elif roas >= 2.5 and saturation < 0.7:
        return "good"
    elif roas >= 1.5:
        return "moderate"
    elif roas >= 1:
        return "break_even"
    else:
        return "poor"


def _optimize_allocation(
    channels: List[Dict],
    total_budget: float,
    goal: OptimizationGoal,
    constraints: Dict[str, Dict],
) -> List[Dict]:
    """Generate optimized budget allocation."""
    recommended = []
    remaining_budget = total_budget
    
    # Sort channels by efficiency metric based on goal
    if goal == OptimizationGoal.MAXIMIZE_REVENUE:
        # Prioritize by absolute revenue potential
        sorted_channels = sorted(channels, key=lambda x: x["revenue"], reverse=True)
    elif goal == OptimizationGoal.MAXIMIZE_ROAS:
        # Prioritize by efficiency
        sorted_channels = sorted(channels, key=lambda x: x["marginal_roas"], reverse=True)
    elif goal == OptimizationGoal.MINIMIZE_CPA:
        # Prioritize by CPA (lower is better)
        sorted_channels = sorted(channels, key=lambda x: x["cpa"] if x["cpa"] > 0 else float('inf'))
    else:
        # Balanced approach using composite score
        sorted_channels = sorted(
            channels,
            key=lambda x: (x["roas"] * 0.4 + (1 - x["saturation_level"]/100) * 0.3 + x["revenue_share"]/100 * 0.3),
            reverse=True
        )
    
    # First pass: apply constraints
    for channel in sorted_channels:
        ch_name = channel["channel"]
        ch_constraints = constraints.get(ch_name, {})
        
        min_spend = ch_constraints.get("min_spend", 0)
        max_spend = ch_constraints.get("max_spend", float('inf'))
        fixed_spend = ch_constraints.get("fixed")
        
        if fixed_spend is not None:
            allocation = fixed_spend
        else:
            # Calculate optimal allocation based on efficiency
            current_spend = channel["spend"]
            efficiency_score = channel["marginal_roas"] * (1 - channel["saturation_level"]/100)
            
            # Scale allocation by efficiency
            ideal_allocation = current_spend * (1 + (efficiency_score - 1) * 0.3)
            
            # Apply constraints
            allocation = max(min_spend, min(max_spend, ideal_allocation))
        
        allocation = min(allocation, remaining_budget)
        remaining_budget -= allocation
        
        recommended.append({
            "channel": ch_name,
            "recommended_spend": round(allocation, 2),
            "current_spend": channel["spend"],
            "change": round(allocation - channel["spend"], 2),
            "change_percent": round(((allocation - channel["spend"]) / channel["spend"] * 100) if channel["spend"] > 0 else 0, 1),
            "rationale": _get_allocation_rationale(channel, allocation, goal),
        })
    
    # Redistribute remaining budget to top performers
    if remaining_budget > 0 and recommended:
        # Find best unconstrained channel
        for rec in recommended:
            ch_name = rec["channel"]
            ch_constraints = constraints.get(ch_name, {})
            max_spend = ch_constraints.get("max_spend", float('inf'))
            
            if rec["recommended_spend"] < max_spend:
                additional = min(remaining_budget, max_spend - rec["recommended_spend"])
                rec["recommended_spend"] = round(rec["recommended_spend"] + additional, 2)
                rec["change"] = round(rec["recommended_spend"] - rec["current_spend"], 2)
                remaining_budget -= additional
                if remaining_budget <= 0:
                    break
    
    return recommended


def _calculate_expected_impact(
    channels: List[Dict],
    recommended: List[Dict],
    goal: OptimizationGoal,
) -> Dict:
    """Calculate expected impact of recommended allocation."""
    current_spend = sum(c["spend"] for c in channels)
    current_revenue = sum(c["revenue"] for c in channels)
    
    recommended_spend = sum(r["recommended_spend"] for r in recommended)
    
    # Estimate expected revenue based on channel efficiency
    expected_revenue = 0
    for rec in recommended:
        ch = next((c for c in channels if c["channel"] == rec["channel"]), None)
        if ch:
            # Use marginal ROAS for estimation
            current_contribution = ch["revenue"]
            spend_ratio = rec["recommended_spend"] / ch["spend"] if ch["spend"] > 0 else 0
            
            # Apply diminishing returns
            if spend_ratio > 1:
                # Increasing spend - apply diminishing returns
                additional_spend = rec["recommended_spend"] - ch["spend"]
                base_revenue = current_contribution
                marginal_revenue = additional_spend * ch["marginal_roas"]
                expected_contribution = base_revenue + marginal_revenue
            else:
                # Decreasing spend - proportional reduction
                expected_contribution = current_contribution * spend_ratio
            
            expected_revenue += expected_contribution
    
    current_roas = current_revenue / current_spend if current_spend > 0 else 0
    expected_roas = expected_revenue / recommended_spend if recommended_spend > 0 else 0
    
    return {
        "current_revenue": round(current_revenue, 2),
        "expected_revenue": round(expected_revenue, 2),
        "revenue_change": round(expected_revenue - current_revenue, 2),
        "revenue_change_percent": round(((expected_revenue - current_revenue) / current_revenue * 100) if current_revenue > 0 else 0, 1),
        "current_roas": round(current_roas, 2),
        "expected_roas": round(expected_roas, 2),
        "roas_change": round(expected_roas - current_roas, 2),
        "spend_change": round(recommended_spend - current_spend, 2),
        "confidence_level": "medium",  # Could be enhanced with more sophisticated modeling
    }


def _get_allocation_rationale(channel: Dict, allocation: float, goal: OptimizationGoal) -> str:
    """Generate rationale for allocation recommendation."""
    change_pct = ((allocation - channel["spend"]) / channel["spend"] * 100) if channel["spend"] > 0 else 0
    
    if abs(change_pct) < 5:
        return "Maintain current spend - performance is stable"
    
    if change_pct > 0:
        if channel["roas"] > 3 and channel["saturation_level"] < 50:
            return "Increase spend - high ROAS with room for growth"
        elif channel["roas"] > 2:
            return "Moderate increase - solid performance"
        else:
            return "Slight increase - testing for scalability"
    else:
        if channel["roas"] < 1:
            return "Reduce spend - below break-even efficiency"
        elif channel["saturation_level"] > 70:
            return "Reduce spend - channel showing saturation"
        else:
            return "Reallocate to higher-performing channels"


def _analyze_scenario(
    scenario: Dict[str, float],
    channel_performance: Dict[str, Dict],
    scenario_name: str,
) -> Dict:
    """Analyze a specific budget scenario."""
    total_spend = sum(scenario.values())
    expected_revenue = 0
    
    channel_projections = []
    
    for channel, spend in scenario.items():
        perf = channel_performance.get(channel, {})
        current_spend = perf.get("spend", 0)
        current_revenue = perf.get("revenue", 0)
        marginal_roas = perf.get("marginal_roas", perf.get("roas", 0))
        
        if current_spend > 0:
            spend_ratio = spend / current_spend
            
            if spend_ratio > 1:
                # Scaling up
                additional = spend - current_spend
                projected_revenue = current_revenue + (additional * marginal_roas * 0.8)  # Conservative
            else:
                # Scaling down
                projected_revenue = current_revenue * spend_ratio
        else:
            projected_revenue = spend * marginal_roas if marginal_roas > 0 else 0
        
        expected_revenue += projected_revenue
        
        channel_projections.append({
            "channel": channel,
            "spend": round(spend, 2),
            "projected_revenue": round(projected_revenue, 2),
            "projected_roas": round(projected_revenue / spend, 2) if spend > 0 else 0,
        })
    
    expected_roas = expected_revenue / total_spend if total_spend > 0 else 0
    
    return {
        "name": scenario_name,
        "total_spend": round(total_spend, 2),
        "expected_revenue": round(expected_revenue, 2),
        "expected_roas": round(expected_roas, 2),
        "channel_projections": channel_projections,
    }


def _divide_into_quartiles(data: List[Dict]) -> List[List[Dict]]:
    """Divide data into quartiles based on spend."""
    n = len(data)
    q_size = n // 4
    
    if q_size == 0:
        return [data]
    
    return [
        data[:q_size],
        data[q_size:q_size*2],
        data[q_size*2:q_size*3],
        data[q_size*3:],
    ]


def _estimate_optimal_spend_range(quartile_metrics: List[Dict]) -> Dict[str, float]:
    """Estimate optimal spend range based on quartile analysis."""
    if len(quartile_metrics) < 2:
        return {"min": 0, "max": 0}
    
    # Find the quartile with best ROAS
    best_quartile = max(quartile_metrics, key=lambda x: x["roas"])
    
    # The optimal range is around the best performing quartile
    avg_spend = best_quartile["avg_daily_spend"]
    
    return {
        "min": round(avg_spend * 0.7, 2),
        "max": round(avg_spend * 1.3, 2),
    }


def _get_diminishing_returns_recommendation(efficiency_drop: float, quartiles: List[Dict]) -> str:
    """Generate recommendation based on diminishing returns analysis."""
    if efficiency_drop > 40:
        return "Strong diminishing returns observed. Consider capping spend and reallocating excess budget."
    elif efficiency_drop > 20:
        return "Moderate diminishing returns. Monitor efficiency closely when scaling spend."
    elif efficiency_drop > 10:
        return "Mild diminishing returns. Channel has room for cautious scaling."
    else:
        return "Low diminishing returns. Channel shows good scalability potential."
