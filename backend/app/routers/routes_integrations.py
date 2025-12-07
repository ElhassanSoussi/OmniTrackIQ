from datetime import datetime
import urllib.parse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.integration import Integration
from app.schemas.integrations import IntegrationItem
from app.config import settings

router = APIRouter()


# OAuth configuration for each platform
OAUTH_CONFIG = {
    "facebook": {
        "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "scope": "ads_read,ads_management,business_management",
        "client_id_setting": "FACEBOOK_CLIENT_ID",
    },
    "google_ads": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "scope": "https://www.googleapis.com/auth/adwords",
        "client_id_setting": "GOOGLE_ADS_CLIENT_ID",
    },
    "tiktok": {
        "auth_url": "https://business-api.tiktok.com/portal/auth",
        "scope": "user.info.basic,ad.read,ad.write",
        "client_id_setting": "TIKTOK_CLIENT_ID",
    },
    "shopify": {
        "auth_url": None,  # Shopify requires store-specific URL
        "scope": "read_orders,read_products,read_customers",
        "client_id_setting": "SHOPIFY_CLIENT_ID",
    },
    "ga4": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "scope": "https://www.googleapis.com/auth/analytics.readonly",
        "client_id_setting": "GOOGLE_ADS_CLIENT_ID",  # Reuse Google OAuth
    },
}


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
    Generate OAuth authorization URL for the given platform.
    """
    if platform not in OAUTH_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown platform: {platform}"
        )
    
    config = OAUTH_CONFIG[platform]
    client_id = getattr(settings, config["client_id_setting"], None)
    
    # Check if OAuth is configured for this platform
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OAuth for {platform} is not configured. Please set {config['client_id_setting']} in environment variables."
        )
    
    # Shopify requires special handling (store-specific URL)
    if platform == "shopify":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Shopify integration requires store URL. Please contact support to set up your Shopify connection."
        )
    
    # Build OAuth URL
    redirect_uri = f"{settings.FRONTEND_URL}/integrations/{platform}/callback"
    state = f"{user.account_id}:{platform}"  # Simple state for demo - use JWT in production
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": config["scope"],
        "response_type": "code",
        "state": state,
    }
    
    # Platform-specific params
    if platform in ["google_ads", "ga4"]:
        params["access_type"] = "offline"
        params["prompt"] = "consent"
    
    oauth_url = f"{config['auth_url']}?{urllib.parse.urlencode(params)}"
    
    return {"url": oauth_url}


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
