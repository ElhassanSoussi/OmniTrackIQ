from datetime import datetime, timedelta
import urllib.parse
import json

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.integration import Integration
from app.schemas.integrations import IntegrationItem
from app.config import settings
from app.services.integrations_service import (
    exchange_code_for_token,
    refresh_access_token,
)

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
        platform_names = {
            "facebook": "Facebook Ads",
            "google_ads": "Google Ads",
            "tiktok": "TikTok Ads",
            "shopify": "Shopify",
            "ga4": "Google Analytics 4",
        }
        display_name = platform_names.get(platform, platform.title())
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"{display_name} integration is coming soon! We're working on enabling this connection."
        )
    
    # Shopify requires special handling (store-specific URL)
    if platform == "shopify":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Shopify integration requires additional setup. Please contact support to connect your store."
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


@router.get("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str = Query(...),
    state: str = Query(...),
    error: str = Query(None),
    error_description: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    Handle OAuth callback from provider.
    Exchange code for tokens and store the integration.
    """
    # Handle OAuth errors
    if error:
        error_msg = error_description or error
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?error={urllib.parse.quote(error_msg)}&platform={platform}"
        )
    
    # Parse state to get account_id
    try:
        account_id, state_platform = state.split(":", 1)
        if state_platform != platform:
            raise ValueError("Platform mismatch")
    except ValueError:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?error=Invalid+state+parameter&platform={platform}"
        )
    
    # Exchange code for tokens
    redirect_uri = f"{settings.FRONTEND_URL}/integrations/{platform}/callback"
    
    try:
        token_data = await exchange_code_for_token(
            platform=platform,
            code=code,
            redirect_uri=redirect_uri,
        )
    except ValueError as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?error={urllib.parse.quote(str(e))}&platform={platform}"
        )
    except Exception as e:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?error=Token+exchange+failed&platform={platform}"
        )
    
    # Parse token response (varies by platform)
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    
    # TikTok has different structure
    if platform == "tiktok" and "data" in token_data:
        tiktok_data = token_data["data"]
        access_token = tiktok_data.get("access_token")
        refresh_token = tiktok_data.get("refresh_token")
        expires_in = tiktok_data.get("expires_in", 86400)
    
    if not access_token:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/integrations?error=No+access+token+received&platform={platform}"
        )
    
    # Store or update integration
    integration = db.query(Integration).filter(
        Integration.account_id == account_id,
        Integration.platform == platform,
    ).first()
    
    if not integration:
        integration = Integration(
            account_id=account_id,
            platform=platform,
        )
        db.add(integration)
    
    integration.status = "connected"
    integration.access_token = access_token
    integration.refresh_token = refresh_token
    integration.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None
    integration.extra_data = json.dumps(token_data)
    integration.updated_at = datetime.utcnow()
    
    db.commit()
    
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/integrations?success=true&platform={platform}"
    )


@router.post("/{platform}/refresh")
async def refresh_tokens(
    platform: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Manually refresh OAuth tokens for a platform.
    """
    integration = db.query(Integration).filter(
        Integration.account_id == user.account_id,
        Integration.platform == platform,
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    if not integration.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No refresh token available. Please reconnect the integration."
        )
    
    try:
        token_data = await refresh_access_token(
            platform=platform,
            refresh_token=integration.refresh_token,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to refresh token: {str(e)}"
        )
    
    # Update integration with new tokens
    integration.access_token = token_data.get("access_token")
    if token_data.get("refresh_token"):
        integration.refresh_token = token_data["refresh_token"]
    
    expires_in = token_data.get("expires_in", 3600)
    integration.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    integration.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"status": "refreshed", "platform": platform}


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
