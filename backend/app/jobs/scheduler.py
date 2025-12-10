"""
APScheduler-based background job scheduler.
Handles periodic data sync from connected integrations.
"""
import logging
from datetime import datetime
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: Optional[AsyncIOScheduler] = None


def create_scheduler() -> AsyncIOScheduler:
    """Create and configure the job scheduler."""
    jobstores = {
        "default": MemoryJobStore(),
    }
    
    job_defaults = {
        "coalesce": True,  # Run only once if multiple runs are missed
        "max_instances": 1,  # Prevent overlapping job runs
        "misfire_grace_time": 60 * 5,  # 5 minute grace period
    }
    
    return AsyncIOScheduler(
        jobstores=jobstores,
        job_defaults=job_defaults,
        timezone="UTC",
    )


def start_scheduler():
    """Start the background job scheduler with default jobs."""
    global scheduler
    
    if scheduler is not None and scheduler.running:
        logger.warning("Scheduler already running")
        return
    
    scheduler = create_scheduler()
    
    # Import here to avoid circular imports
    from app.jobs.sync_tasks import (
        sync_all_integrations,
        check_pending_scheduled_reports,
        check_trial_expirations,
    )
    
    # Sync all integrations every hour
    scheduler.add_job(
        sync_all_integrations,
        trigger=IntervalTrigger(hours=1),
        id="sync_all_integrations",
        name="Sync All Integrations",
        replace_existing=True,
    )
    
    # Check for pending scheduled reports every 15 minutes
    scheduler.add_job(
        check_pending_scheduled_reports,
        trigger=IntervalTrigger(minutes=15),
        id="check_scheduled_reports",
        name="Check Scheduled Reports",
        replace_existing=True,
    )
    
    # Check for trial expirations every hour
    scheduler.add_job(
        check_trial_expirations,
        trigger=IntervalTrigger(hours=1),
        id="check_trial_expirations",
        name="Check Trial Expirations",
        replace_existing=True,
    )
    
    # Daily cleanup job at 3 AM UTC
    scheduler.add_job(
        _daily_cleanup,
        trigger=CronTrigger(hour=3, minute=0),
        id="daily_cleanup",
        name="Daily Cleanup",
        replace_existing=True,
    )
    
    scheduler.start()
    logger.info("Background job scheduler started with %d jobs", len(scheduler.get_jobs()))


def shutdown_scheduler():
    """Gracefully shutdown the scheduler."""
    global scheduler
    
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=True)
        logger.info("Background job scheduler stopped")
        scheduler = None


async def _daily_cleanup():
    """Daily maintenance tasks: clean old data, refresh stale tokens, etc."""
    logger.info("Running daily cleanup at %s", datetime.utcnow().isoformat())
    
    # Import here to avoid circular imports
    from app.db import SessionLocal
    from app.models.integration import Integration
    from app.services.integrations_service import refresh_access_token
    
    db = SessionLocal()
    try:
        # Find integrations with tokens expiring in the next 24 hours
        expiring_soon = db.query(Integration).filter(
            Integration.status == "connected",
            Integration.refresh_token.isnot(None),
            Integration.token_expires_at.isnot(None),
            Integration.token_expires_at < datetime.utcnow() + timedelta(hours=24),
        ).all()
        
        for integration in expiring_soon:
            try:
                logger.info(f"Refreshing expiring token for {integration.platform} (account {integration.account_id})")
                token_data = await refresh_access_token(
                    platform=integration.platform,
                    refresh_token=integration.refresh_token,
                )
                
                integration.access_token = token_data.get("access_token")
                if token_data.get("refresh_token"):
                    integration.refresh_token = token_data["refresh_token"]
                
                expires_in = token_data.get("expires_in", 3600)
                integration.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                integration.updated_at = datetime.utcnow()
                
                db.commit()
                logger.info(f"Successfully refreshed token for {integration.platform}")
                
            except Exception as e:
                logger.error(f"Failed to refresh token for {integration.platform}: {e}")
                db.rollback()
                
    finally:
        db.close()


def get_job_status() -> list[dict]:
    """Get status of all scheduled jobs."""
    if not scheduler or not scheduler.running:
        return []
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger),
        })
    
    return jobs


# Need to import timedelta
from datetime import timedelta
