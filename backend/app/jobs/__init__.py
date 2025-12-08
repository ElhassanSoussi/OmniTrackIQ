"""
Background job system for data ingestion and scheduled tasks.
"""
from app.jobs.scheduler import scheduler, start_scheduler, shutdown_scheduler
from app.jobs.sync_tasks import (
    sync_facebook_ads,
    sync_google_ads,
    sync_tiktok_ads,
    sync_shopify_orders,
    sync_all_integrations,
)

__all__ = [
    "scheduler",
    "start_scheduler",
    "shutdown_scheduler",
    "sync_facebook_ads",
    "sync_google_ads",
    "sync_tiktok_ads",
    "sync_shopify_orders",
    "sync_all_integrations",
]
