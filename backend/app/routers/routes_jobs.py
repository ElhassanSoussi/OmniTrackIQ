"""
Admin endpoints for managing background jobs.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.user import UserRole
from app.jobs.scheduler import get_job_status, scheduler
from app.jobs.sync_tasks import sync_all_integrations, sync_integration
from app.models.integration import Integration

router = APIRouter()


def require_admin(user=Depends(get_current_account_user)):
    """Dependency to require admin role."""
    if user.role not in [UserRole.OWNER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


@router.get("/status")
def list_jobs(user=Depends(require_admin)):
    """Get status of all scheduled background jobs."""
    jobs = get_job_status()
    return {
        "scheduler_running": scheduler is not None and scheduler.running if scheduler else False,
        "jobs": jobs,
    }


@router.post("/sync/all")
async def trigger_sync_all(
    background_tasks: BackgroundTasks,
    user=Depends(require_admin),
):
    """Manually trigger sync for all integrations."""
    background_tasks.add_task(sync_all_integrations)
    return {"message": "Sync job queued for all integrations"}


@router.post("/sync/{platform}")
async def trigger_sync_platform(
    platform: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    """Manually trigger sync for a specific platform integration."""
    integration = db.query(Integration).filter(
        Integration.account_id == user.account_id,
        Integration.platform == platform,
        Integration.status == "connected",
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No connected {platform} integration found"
        )
    
    background_tasks.add_task(sync_integration, db, integration)
    return {"message": f"Sync job queued for {platform}"}


@router.get("/history")
def get_sync_history(
    db: Session = Depends(get_db),
    user=Depends(require_admin),
    limit: int = 20,
):
    """Get recent sync history for integrations."""
    integrations = db.query(Integration).filter(
        Integration.account_id == user.account_id,
    ).order_by(Integration.updated_at.desc()).limit(limit).all()
    
    return {
        "history": [
            {
                "platform": i.platform,
                "status": i.status,
                "last_synced": i.updated_at.isoformat() if i.updated_at else None,
            }
            for i in integrations
        ]
    }
