"""
Role-Based Access Control (RBAC) utilities.
"""
from functools import wraps
from typing import List, Callable

from fastapi import HTTPException, status, Depends

from app.models.user import User, UserRole
from app.routers.deps import get_current_user


# Role hierarchy - higher roles include permissions of lower roles
ROLE_HIERARCHY = {
    UserRole.OWNER: [UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
    UserRole.ADMIN: [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
    UserRole.MEMBER: [UserRole.MEMBER, UserRole.VIEWER],
    UserRole.VIEWER: [UserRole.VIEWER],
}


def has_role(user: User, required_role: UserRole) -> bool:
    """Check if user has the required role or higher."""
    return required_role in ROLE_HIERARCHY.get(user.role, [])


def check_role(user: User, required_roles: List[UserRole]) -> bool:
    """Check if user has any of the required roles."""
    for required_role in required_roles:
        if has_role(user, required_role):
            return True
    return False


def require_role(*roles: UserRole):
    """
    Dependency that requires specific role(s) for access.
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_role(UserRole.ADMIN))])
        def admin_endpoint():
            ...
    """
    def dependency(current_user: User = Depends(get_current_user)):
        if not check_role(current_user, list(roles)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(r.value for r in roles)}",
            )
        return current_user
    return dependency


def require_owner():
    """Require owner role."""
    return require_role(UserRole.OWNER)


def require_admin():
    """Require admin role or higher (owner)."""
    return require_role(UserRole.ADMIN)


def require_member():
    """Require member role or higher."""
    return require_role(UserRole.MEMBER)


def require_viewer():
    """Require at least viewer role (any authenticated user)."""
    return require_role(UserRole.VIEWER)


# Plan-based limits
PLAN_LIMITS = {
    "free": {
        "max_users": 1,
        "max_integrations": 2,
        "data_retention_days": 30,
        "features": ["basic_dashboard"],
    },
    "starter": {
        "max_users": 3,
        "max_integrations": 5,
        "data_retention_days": 90,
        "features": ["basic_dashboard", "custom_reports", "email_reports"],
    },
    "pro": {
        "max_users": 10,
        "max_integrations": 15,
        "data_retention_days": 365,
        "features": ["basic_dashboard", "custom_reports", "email_reports", "api_access", "advanced_analytics"],
    },
    "agency": {
        "max_users": -1,  # Unlimited
        "max_integrations": -1,  # Unlimited
        "data_retention_days": -1,  # Unlimited
        "features": ["basic_dashboard", "custom_reports", "email_reports", "api_access", "advanced_analytics", "white_label", "priority_support"],
    },
}


def get_plan_limit(plan: str, limit_key: str) -> int:
    """Get a specific limit for a plan."""
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    return limits.get(limit_key, 0)


def has_feature(plan: str, feature: str) -> bool:
    """Check if a plan has access to a specific feature."""
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    return feature in limits.get("features", [])
