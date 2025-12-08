"""
Plan gating utilities for feature access control.
"""
from typing import List, Optional, Callable
from functools import wraps

from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.account import Account, AccountPlan
from app.models.subscription import Subscription
from app.routers.deps import get_current_user, get_db


# Feature access by plan
PLAN_FEATURES = {
    AccountPlan.FREE: {
        "max_integrations": 2,
        "max_team_members": 1,
        "data_retention_days": 30,
        "features": [
            "basic_dashboard",
            "single_integration",
        ],
    },
    AccountPlan.STARTER: {
        "max_integrations": 5,
        "max_team_members": 3,
        "data_retention_days": 90,
        "features": [
            "basic_dashboard",
            "single_integration",
            "email_reports",
            "custom_date_range",
        ],
    },
    AccountPlan.PRO: {
        "max_integrations": 15,
        "max_team_members": 10,
        "data_retention_days": 365,
        "features": [
            "basic_dashboard",
            "single_integration",
            "email_reports",
            "custom_date_range",
            "api_access",
            "advanced_analytics",
            "custom_reports",
            "priority_support",
        ],
    },
    AccountPlan.AGENCY: {
        "max_integrations": -1,  # Unlimited
        "max_team_members": -1,  # Unlimited
        "data_retention_days": -1,  # Unlimited
        "features": [
            "basic_dashboard",
            "single_integration",
            "email_reports",
            "custom_date_range",
            "api_access",
            "advanced_analytics",
            "custom_reports",
            "priority_support",
            "white_label",
            "multi_workspace",
            "dedicated_support",
            "custom_onboarding",
        ],
    },
}


def get_plan_config(plan: AccountPlan) -> dict:
    """Get configuration for a plan."""
    return PLAN_FEATURES.get(plan, PLAN_FEATURES[AccountPlan.FREE])


def get_plan_limit(plan: AccountPlan, limit_key: str) -> int:
    """Get a specific limit for a plan."""
    config = get_plan_config(plan)
    return config.get(limit_key, 0)


def has_feature(plan: AccountPlan, feature: str) -> bool:
    """Check if a plan has access to a feature."""
    config = get_plan_config(plan)
    return feature in config.get("features", [])


def check_feature_access(
    db: Session,
    account_id: str,
    feature: str,
) -> bool:
    """Check if an account has access to a feature based on their plan."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return False
    return has_feature(account.plan, feature)


def check_limit(
    db: Session,
    account_id: str,
    limit_key: str,
    current_count: int,
) -> bool:
    """Check if an account is within their plan limit."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return False
    
    limit = get_plan_limit(account.plan, limit_key)
    if limit == -1:  # Unlimited
        return True
    return current_count < limit


def require_feature(feature: str):
    """
    Dependency that requires a specific feature for access.
    
    Usage:
        @router.get("/api-endpoint", dependencies=[Depends(require_feature("api_access"))])
        def api_endpoint():
            ...
    """
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        account = db.query(Account).filter(Account.id == current_user.account_id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account not found",
            )
        
        if not has_feature(account.plan, feature):
            plan_name = account.plan.value.capitalize()
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"This feature requires a higher plan. Your current plan: {plan_name}. Upgrade to access this feature.",
            )
        return current_user
    return dependency


def require_plan(*plans: AccountPlan):
    """
    Dependency that requires one of the specified plans.
    
    Usage:
        @router.get("/premium", dependencies=[Depends(require_plan(AccountPlan.PRO, AccountPlan.AGENCY))])
        def premium_endpoint():
            ...
    """
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        account = db.query(Account).filter(Account.id == current_user.account_id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account not found",
            )
        
        if account.plan not in plans:
            required = ", ".join(p.value.capitalize() for p in plans)
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"This feature requires one of these plans: {required}. Upgrade to continue.",
            )
        return current_user
    return dependency


def check_integration_limit(
    db: Session,
    account_id: str,
) -> tuple[bool, int, int]:
    """
    Check if account can add more integrations.
    Returns: (can_add, current_count, max_allowed)
    """
    from app.models.integration import Integration
    
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return False, 0, 0
    
    current = db.query(Integration).filter(
        Integration.account_id == account_id,
        Integration.status == "connected",
    ).count()
    
    max_allowed = get_plan_limit(account.plan, "max_integrations")
    
    if max_allowed == -1:  # Unlimited
        return True, current, -1
    
    return current < max_allowed, current, max_allowed


def check_team_limit(
    db: Session,
    account_id: str,
) -> tuple[bool, int, int]:
    """
    Check if account can add more team members.
    Returns: (can_add, current_count, max_allowed)
    """
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return False, 0, 0
    
    current = db.query(User).filter(User.account_id == account_id).count()
    max_allowed = get_plan_limit(account.plan, "max_team_members")
    
    if max_allowed == -1:  # Unlimited
        return True, current, -1
    
    return current < max_allowed, current, max_allowed


# Helper for returning upgrade-required responses
def upgrade_required_response(
    feature: str,
    current_plan: str,
    required_plans: List[str],
) -> dict:
    """Generate a standard upgrade-required response."""
    return {
        "error": "upgrade_required",
        "message": f"This feature ({feature}) requires a higher plan.",
        "current_plan": current_plan,
        "required_plans": required_plans,
        "upgrade_url": "/billing",
    }
