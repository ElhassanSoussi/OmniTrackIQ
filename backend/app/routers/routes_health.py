import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.routers.deps import get_db
from app.config import settings

router = APIRouter()

APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_START_TIME = datetime.now(timezone.utc)


@router.get("/")
def health():
    """Basic health check - always returns ok if the service is running."""
    return {"status": "ok"}


@router.get("/ready")
def readiness(db: Session = Depends(get_db)):
    """
    Readiness check - verifies the service can handle requests.
    Checks database connectivity.
    """
    checks = {
        "database": "unknown",
    }
    all_healthy = True
    
    # Check database
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
        all_healthy = False
    
    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks,
    }


@router.get("/live")
def liveness():
    """Liveness check - verifies the service is alive."""
    return {"status": "alive"}


def _check_integration_config(name: str, env_var: str) -> dict:
    """Check if an integration is configured."""
    configured = bool(getattr(settings, env_var, None))
    return {
        "name": name,
        "configured": configured,
        "status": "ready" if configured else "not_configured",
    }


@router.get("/status")
def status(db: Session = Depends(get_db)):
    """
    Detailed status page with version, uptime, and integration status.
    Useful for debugging and monitoring dashboards.
    """
    now = datetime.now(timezone.utc)
    uptime_seconds = (now - APP_START_TIME).total_seconds()
    
    # Check database
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"
    
    # Check integrations configuration
    integrations = [
        _check_integration_config("Facebook Ads", "FACEBOOK_CLIENT_ID"),
        _check_integration_config("Google Ads", "GOOGLE_ADS_CLIENT_ID"),
        _check_integration_config("TikTok Ads", "TIKTOK_CLIENT_ID"),
        _check_integration_config("Shopify", "SHOPIFY_CLIENT_ID"),
        _check_integration_config("Stripe", "STRIPE_SECRET_KEY"),
    ]
    
    # Check social login providers
    social_auth = [
        _check_integration_config("Google OAuth", "GOOGLE_ADS_CLIENT_ID"),
        _check_integration_config("GitHub OAuth", "GITHUB_CLIENT_ID"),
        _check_integration_config("Apple Sign-In", "APPLE_CLIENT_ID"),
    ]
    
    configured_integrations = sum(1 for i in integrations if i["configured"])
    configured_social = sum(1 for s in social_auth if s["configured"])
    
    return {
        "status": "operational",
        "version": APP_VERSION,
        "environment": os.getenv("ENVIRONMENT", "production"),
        "uptime_seconds": int(uptime_seconds),
        "uptime_human": _format_uptime(uptime_seconds),
        "timestamp": now.isoformat(),
        "checks": {
            "database": db_status,
            "integrations": f"{configured_integrations}/{len(integrations)} configured",
            "social_auth": f"{configured_social}/{len(social_auth)} configured",
        },
        "integrations": integrations,
        "social_auth": social_auth,
    }


def _format_uptime(seconds: float) -> str:
    """Format uptime in human-readable format."""
    days = int(seconds // 86400)
    hours = int((seconds % 86400) // 3600)
    minutes = int((seconds % 3600) // 60)
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    
    return " ".join(parts) if parts else "< 1m"
