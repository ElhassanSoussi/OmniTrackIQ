import urllib.parse
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, SignupRequest, TokenResponse, UserInfo, MessageResponse,
    UpdateUserProfileRequest, UpdateOrganizationRequest, UpdateEmailRequest, UpdatePasswordRequest
)
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
    import logging
    logger = logging.getLogger("omnitrackiq")
    try:
        token = auth_service.signup(db, body.email, body.password, body.account_name)
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Signup failed for {body.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create account: {str(e)}"
        )


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
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the currently authenticated user's profile information.
    
    Requires a valid JWT token in the Authorization header.
    """
    # Get account name
    account_name = auth_service.get_account_name(db, current_user.account_id)
    
    return UserInfo(
        id=current_user.id, 
        email=current_user.email, 
        account_id=current_user.account_id,
        role=current_user.role.value if current_user.role else "member",
        name=current_user.name,
        account_name=account_name,
        avatar_url=getattr(current_user, "avatar_url", None),
        timezone=getattr(current_user, "timezone", None)
    )


# ================== Profile Update Endpoints ==================
@router.patch("/me", response_model=MessageResponse, summary="Update user profile", tags=["Settings"])
@limiter.limit(get_auth_rate_limit())
def update_profile(
    request: Request,
    body: UpdateUserProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile settings (name, avatar, timezone).
    """
    auth_service.update_user_profile(
        db, 
        current_user, 
        name=body.name,
        avatar_url=body.avatar_url,
        timezone=body.timezone
    )
    return MessageResponse(message="Profile updated successfully")


@router.patch("/account/me", response_model=MessageResponse, summary="Update organization settings", tags=["Settings"])
@limiter.limit(get_auth_rate_limit())
def update_organization(
    request: Request,
    body: UpdateOrganizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update organization settings (name, industry, currency, timezone).
    """
    auth_service.update_organization_settings(
        db, 
        current_user, 
        name=body.name,
        industry=body.industry,
        currency=body.currency,
        timezone=body.timezone
    )
    return MessageResponse(message="Organization settings updated successfully")


# Deprecated - kept for compatibility if needed, but routing to new logic
@router.post("/update-account", response_model=MessageResponse, summary="Update account settings (Deprecated)")
@limiter.limit(get_auth_rate_limit())
def update_account_deprecated(
    request: Request,
    body: UpdateUserProfileRequest, # Schema also changed, but this endpoint is legacy
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    auth_service.update_user_profile(db, current_user, name=body.name)
    # Note: legacy endpoint only updated user name and account name mixed. 
    # Just updating user name here for safety.
    return MessageResponse(message="Account settings updated successfully")


@router.post("/update-email", response_model=MessageResponse, summary="Update email address")
@limiter.limit(get_auth_rate_limit())
def update_email(
    request: Request,
    body: UpdateEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update login email address.
    
    - **email**: New email address
    
    Requires authentication. The new email must not be in use by another account.
    """
    auth_service.update_email(db, current_user, body.email)
    return MessageResponse(message="Email updated successfully")


@router.post("/update-password", response_model=MessageResponse, summary="Update password")
@limiter.limit(get_auth_rate_limit())
def update_password(
    request: Request,
    body: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update account password.
    
    - **current_password**: Your current password for verification
    - **new_password**: New password (minimum 8 characters)
    
    Requires authentication.
    """
    auth_service.update_password(db, current_user, body.current_password, body.new_password)
    return MessageResponse(message="Password updated successfully")


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


# ================== Password Reset ==================

from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, MessageResponse


@router.post("/forgot-password", response_model=MessageResponse, summary="Request password reset")
@limiter.limit(get_auth_rate_limit())
def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset email.
    
    - **email**: The email address associated with your account
    
    For security reasons, this endpoint always returns success even if the email
    is not found in the system. If the email exists, a reset link will be sent.
    """
    import logging
    logger = logging.getLogger("omnitrackiq")
    
    token = auth_service.create_password_reset_token(db, body.email)
    
    if token:
        # Send password reset email
        try:
            from app.services.email_service import send_password_reset_email
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            send_password_reset_email(body.email, reset_url)
            logger.info(f"Password reset email sent to {body.email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            # Still return success to not reveal if email exists
    
    return MessageResponse(
        message="If an account with that email exists, we've sent a password reset link. Please check your inbox."
    )


@router.post("/reset-password", response_model=MessageResponse, summary="Reset password with token")
@limiter.limit(get_auth_rate_limit())
def reset_password(request: Request, body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using the token from the reset email.
    
    - **token**: The password reset token from the email link
    - **new_password**: Your new password (minimum 8 characters)
    """
    auth_service.reset_password(db, body.token, body.new_password)
    return MessageResponse(message="Your password has been reset successfully. You can now log in with your new password.")
