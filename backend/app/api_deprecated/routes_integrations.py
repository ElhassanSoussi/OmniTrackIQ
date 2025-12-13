from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_account_user, get_db
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
    """
    Returns the OAuth URL for the given platform.
    Currently returns placeholder URLs - in production, these would be
    actual OAuth authorization URLs with proper client IDs and redirect URIs.
    """
    # Supported platforms and their OAuth status
    PLATFORM_CONFIG = {
        "facebook": {"implemented": False, "name": "Facebook Ads"},
        "google_ads": {"implemented": False, "name": "Google Ads"},
        "tiktok": {"implemented": False, "name": "TikTok Ads"},
        "shopify": {"implemented": False, "name": "Shopify"},
        "ga4": {"implemented": False, "name": "Google Analytics 4"},
    }
    
    if platform not in PLATFORM_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown platform: {platform}"
        )
    
    config = PLATFORM_CONFIG[platform]
    
    if not config["implemented"]:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"{config['name']} integration is coming soon. We're working on it!"
        )


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
