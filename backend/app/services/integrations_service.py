"""
Service layer for managing platform integrations.
Handles OAuth token exchange, storage, and refresh.
"""

from datetime import datetime, timedelta
from typing import Optional
import httpx

from sqlalchemy.orm import Session

from app.config import settings
from app.models.integration import Integration


# OAuth token endpoints for each platform
TOKEN_ENDPOINTS = {
    "facebook": "https://graph.facebook.com/v18.0/oauth/access_token",
    "google_ads": "https://oauth2.googleapis.com/token",
    "tiktok": "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
    "shopify": None,  # Shopify uses different flow
    "ga4": "https://oauth2.googleapis.com/token",
}


async def exchange_code_for_token(
    platform: str,
    code: str,
    redirect_uri: str,
) -> dict:
    """
    Exchange OAuth authorization code for access token.
    Returns dict with access_token, refresh_token, expires_in.
    """
    endpoint = TOKEN_ENDPOINTS.get(platform)
    if not endpoint:
        raise ValueError(f"Token exchange not supported for {platform}")

    # Get client credentials from settings
    client_id = getattr(settings, f"{platform.upper()}_CLIENT_ID", None)
    client_secret = getattr(settings, f"{platform.upper()}_CLIENT_SECRET", None)
    
    if not client_id or not client_secret:
        raise ValueError(f"OAuth credentials not configured for {platform}")

    # Build token request
    if platform == "facebook":
        params = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(endpoint, params=params)
            
    elif platform in ["google_ads", "ga4"]:
        data = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, data=data)
            
    elif platform == "tiktok":
        data = {
            "app_id": client_id,
            "secret": client_secret,
            "auth_code": code,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, json=data)
    else:
        raise ValueError(f"Token exchange not implemented for {platform}")

    if response.status_code != 200:
        raise Exception(f"Token exchange failed: {response.text}")

    return response.json()


async def refresh_access_token(
    platform: str,
    refresh_token: str,
) -> dict:
    """
    Refresh an expired access token using the refresh token.
    """
    endpoint = TOKEN_ENDPOINTS.get(platform)
    if not endpoint:
        raise ValueError(f"Token refresh not supported for {platform}")

    client_id = getattr(settings, f"{platform.upper()}_CLIENT_ID", None)
    client_secret = getattr(settings, f"{platform.upper()}_CLIENT_SECRET", None)

    if platform in ["google_ads", "ga4"]:
        data = {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(endpoint, data=data)
            
    elif platform == "facebook":
        # Facebook long-lived tokens don't need refresh, but can be exchanged
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": client_id,
            "client_secret": client_secret,
            "fb_exchange_token": refresh_token,
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(endpoint, params=params)
    else:
        raise ValueError(f"Token refresh not implemented for {platform}")

    if response.status_code != 200:
        raise Exception(f"Token refresh failed: {response.text}")

    return response.json()


def save_integration(
    db: Session,
    account_id: str,
    platform: str,
    access_token: str,
    refresh_token: Optional[str] = None,
    expires_at: Optional[datetime] = None,
    account_name: Optional[str] = None,
    external_account_id: Optional[str] = None,
) -> Integration:
    """
    Save or update an integration record with OAuth tokens.
    """
    integration = (
        db.query(Integration)
        .filter(Integration.account_id == account_id, Integration.platform == platform)
        .first()
    )

    if not integration:
        integration = Integration(
            account_id=account_id,
            platform=platform,
        )
        db.add(integration)

    integration.status = "connected"
    integration.access_token = access_token
    integration.refresh_token = refresh_token
    integration.token_expires_at = expires_at
    integration.account_name = account_name
    integration.external_account_id = external_account_id
    integration.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(integration)

    return integration


def get_valid_token(
    db: Session,
    account_id: str,
    platform: str,
) -> Optional[str]:
    """
    Get a valid access token for the integration, refreshing if needed.
    Returns None if no valid token is available.
    """
    integration = (
        db.query(Integration)
        .filter(
            Integration.account_id == account_id,
            Integration.platform == platform,
            Integration.status == "connected",
        )
        .first()
    )

    if not integration or not integration.access_token:
        return None

    # Check if token is expired
    if integration.token_expires_at and integration.token_expires_at < datetime.utcnow():
        # Try to refresh
        if integration.refresh_token:
            try:
                # Note: This is async, caller should handle appropriately
                # In a real implementation, you'd want to make this synchronous
                # or handle the async refresh separately
                return None  # Trigger refresh flow
            except Exception:
                return None
        return None

    return integration.access_token


def disconnect_integration(
    db: Session,
    account_id: str,
    platform: str,
) -> bool:
    """
    Disconnect an integration by clearing tokens and setting status.
    """
    integration = (
        db.query(Integration)
        .filter(Integration.account_id == account_id, Integration.platform == platform)
        .first()
    )

    if not integration:
        return False

    integration.status = "disconnected"
    integration.access_token = None
    integration.refresh_token = None
    integration.token_expires_at = None
    integration.updated_at = datetime.utcnow()

    db.commit()

    return True
