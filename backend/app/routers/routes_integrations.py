from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.integration import Integration
from app.schemas.integrations import IntegrationItem

router = APIRouter()


@router.get("/", response_model=list[IntegrationItem])
def list_integrations(db: Session = Depends(get_db), user=Depends(get_current_account_user)):
    rows = (
        db.query(Integration)
        .filter(Integration.account_id == user.account_id)
        .order_by(Integration.created_at.desc())
        .all()
    )
    return [
        IntegrationItem(
          platform=row.platform,
          status=row.status,
          last_synced_at=row.updated_at.isoformat() if row.updated_at else None,
        )
        for row in rows
    ]


@router.get("/{platform}/connect-url")
def connect_url(platform: str, user=Depends(get_current_account_user)):
    # Placeholder for OAuth URL construction per platform
    return {"url": f"https://connect/{platform}"}


@router.delete("/{platform}")
def disconnect(platform: str, db: Session = Depends(get_db), user=Depends(get_current_account_user)):
    row = (
        db.query(Integration)
        .filter(Integration.account_id == user.account_id, Integration.platform == platform)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    row.status = "disconnected"
    row.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "disconnected", "platform": platform}
