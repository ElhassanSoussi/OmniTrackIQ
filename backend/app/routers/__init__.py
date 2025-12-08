"""API routers package."""
from app.routers import (
    routes_anomaly,
    routes_auth,
    routes_billing,
    routes_custom_reports,
    routes_funnel,
    routes_health,
    routes_integrations,
    routes_jobs,
    routes_metrics,
    routes_sample_data,
    routes_saved_views,
    routes_scheduled_reports,
    routes_team,
)

__all__ = [
    "routes_anomaly",
    "routes_auth",
    "routes_billing",
    "routes_custom_reports",
    "routes_funnel",
    "routes_health",
    "routes_integrations",
    "routes_jobs",
    "routes_metrics",
    "routes_sample_data",
    "routes_saved_views",
    "routes_scheduled_reports",
    "routes_team",
]
