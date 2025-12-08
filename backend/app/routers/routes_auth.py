import urllib.parse
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserInfo
from app.services import auth_service
from app.config import settings
from app.security.rate_limit import limiter, get_auth_rate_limit

router = APIRouter()


# OAuth configuration for social login providers
SOCIAL_OAUTH_CONFIG = {
    "google": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "scope": "openid email profile",
        "client_id_env": "GOOGLE_ADS_CLIENT_ID",  # Reuse Google OAuth client
    },
    "github": {
        "auth_url": "https://github.com/login/oauth/authorize",
        "scope": "user:email",
        "client_id_env": "GITHUB_CLIENT_ID",
    },
    "facebook": {
        "auth_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "scope": "email,public_profile",
        "client_id_env": "FACEBOOK_CLIENT_ID",
    },
    "apple": {
        "auth_url": "https://appleid.apple.com/auth/authorize",
        "scope": "name email",
        "client_id_env": "APPLE_CLIENT_ID",
    },
    "tiktok": {
        "auth_url": "https://www.tiktok.com/auth/authorize/",
        "scope": "user.info.basic",
        "client_id_env": "TIKTOK_CLIENT_ID",
    },
}


@router.post("/signup", response_model=TokenResponse, summary="Create new account")
@limiter.limit(get_auth_rate_limit())
def signup(request: Request, body: SignupRequest, db: Session = Depends(get_db)):
    """
    Create a new user account and return a JWT access token.
    
    - **email**: Valid email address (will be used for login)
    - **password**: Minimum 8 characters
    - **account_name**: Company or organization name
    
    Returns a JWT token that should be included in subsequent requests as:
    `Authorization: Bearer <token>`
    """
    token = auth_service.signup(db, body.email, body.password, body.account_name)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse, summary="Login to existing account")
@limiter.limit(get_auth_rate_limit())
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with email and password to receive a JWT access token.
    
    - **email**: Your registered email address
    - **password**: Your account password
    
    Returns a JWT token valid for 24 hours.
    """
    token = auth_service.login(db, body.email, body.password)
    return TokenResponse(access_token=token)


@router.post("/logout", summary="Logout current session")
@limiter.limit(get_auth_rate_limit())
def logout(request: Request):
    """
    Logout endpoint. Since we use JWT tokens stored client-side,
    the actual logout happens on the client by removing the token.
    This endpoint exists for API completeness and future session invalidation.
    """
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserInfo, summary="Get current user info")
def me(current_user: User = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile information.
    
    Requires a valid JWT token in the Authorization header.
    """
    return UserInfo(
        id=current_user.id, 
        email=current_user.email, 
        account_id=current_user.account_id,
        role=current_user.role.value if current_user.role else "member",
        name=current_user.name
    )


@router.get("/{provider}/login")
@limiter.limit(get_auth_rate_limit())
def social_login(request: Request, provider: str, mode: Optional[str] = "login"):
    """
    Initiate OAuth flow for social login/signup.
    Redirects user to the provider's authorization page.
    """
    if provider not in SOCIAL_OAUTH_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {provider}"
        )
    
    config = SOCIAL_OAUTH_CONFIG[provider]
    client_id = getattr(settings, config["client_id_env"], None)
    
    # Check if OAuth is configured
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"{provider.capitalize()} sign-in is not configured yet. Please use email/password to sign up."
        )
    
    # Build OAuth URL
    redirect_uri = f"{settings.FRONTEND_URL}/auth/{provider}/callback"
    state = f"{mode}:{provider}"
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": config["scope"],
        "response_type": "code",
        "state": state,
    }
    
    # Provider-specific params
    if provider == "google":
        params["access_type"] = "offline"
        params["prompt"] = "select_account"
    elif provider == "apple":
        params["response_mode"] = "form_post"
    
    oauth_url = f"{config['auth_url']}?{urllib.parse.urlencode(params)}"
    
    # Return redirect URL (frontend will handle the redirect)
    return {"url": oauth_url}


@router.get("/{provider}/callback")
@limiter.limit(get_auth_rate_limit())
def social_callback(request: Request, provider: str, code: str, state: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Handle OAuth callback from provider.
    Exchange code for tokens and create/login user.
    """
    if provider not in SOCIAL_OAUTH_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {provider}"
        )
    
    # TODO: Implement token exchange and user creation
    # This requires:
    # 1. Exchange authorization code for access token
    # 2. Fetch user info from provider
    # 3. Create or find user in database
    # 4. Generate JWT token
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"OAuth callback for {provider} is not fully implemented yet."
    )
