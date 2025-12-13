from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.user import User
from app.security.jwt import create_access_token
from app.security.password import hash_password, verify_password
from app.services import events_service


def signup(db: Session, email: str, password: str, account_name: str) -> str:
    from sqlalchemy import text
    import uuid
    
    normalized_email = email.strip().lower()
    normalized_account_name = account_name.strip()

    # Use raw SQL to avoid selecting columns that may not exist yet (password_reset_token, etc.)
    result = db.execute(
        text("SELECT id FROM users WHERE email = :email LIMIT 1"),
        {"email": normalized_email}
    )
    if result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead.",
        )

    # Create account with only the core fields that exist in the database
    # Use raw SQL to avoid issues with columns that may not exist yet
    from sqlalchemy import text
    import uuid
    
    account_id = str(uuid.uuid4())
    
    # Check if onboarding columns exist
    try:
        result = db.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'accounts' AND column_name = 'onboarding_completed'
        """))
        has_onboarding_columns = result.fetchone() is not None
    except Exception:
        has_onboarding_columns = False
    
    # Insert based on whether onboarding columns exist
    if has_onboarding_columns:
        db.execute(
            text("""
                INSERT INTO accounts (id, name, type, plan, max_users, onboarding_completed, onboarding_steps)
                VALUES (:id, :name, :type, :plan, :max_users, :onboarding_completed, :onboarding_steps)
            """),
            {
                "id": account_id,
                "name": normalized_account_name,
                "type": "business",
                "plan": "FREE",
                "max_users": 1,
                "onboarding_completed": False,
                "onboarding_steps": '{"created_workspace": false, "connected_integration": false, "viewed_dashboard": false}'
            }
        )
    else:
        db.execute(
            text("""
                INSERT INTO accounts (id, name, type, plan, max_users)
                VALUES (:id, :name, :type, :plan, :max_users)
            """),
            {
                "id": account_id,
                "name": normalized_account_name,
                "type": "business",
                "plan": "FREE",
                "max_users": 1,
            }
        )

    # Create user with raw SQL to avoid issues with columns that may not exist
    user_id = str(uuid.uuid4())
    db.execute(
        text("""
            INSERT INTO users (id, email, password_hash, account_id)
            VALUES (:id, :email, :password_hash, :account_id)
        """),
        {
            "id": user_id,
            "email": normalized_email,
            "password_hash": hash_password(password),
            "account_id": account_id,
        }
    )
    db.commit()

    # Track signup completed event
    events_service.track_event(
        db=db,
        event_name="signup_completed",
        properties={"signup_method": "email"},
        workspace_id=account_id,
        user_id=user_id,
    )
    
    # Track started_trial event (all new signups start with a trial)
    events_service.track_event(
        db=db,
        event_name="started_trial",
        properties={"plan": "free", "trial_days": 14},
        workspace_id=account_id,
        user_id=user_id,
    )

    token = create_access_token(user_id)
    return token


def login(db: Session, email: str, password: str) -> str:
    from sqlalchemy import text
    
    normalized_email = email.strip().lower()
    
    # Use raw SQL to avoid selecting columns that may not exist (password_reset_token, etc.)
    result = db.execute(
        text("SELECT id, password_hash FROM users WHERE email = :email LIMIT 1"),
        {"email": normalized_email}
    )
    row = result.fetchone()
    
    if not row or not verify_password(password, row[1]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password. Please try again."
        )
    return create_access_token(row[0])


def create_password_reset_token(db: Session, email: str) -> Optional[str]:
    """
    Create a password reset token for the user.
    Returns the token if user exists, None otherwise.
    We don't reveal whether the user exists for security.
    """
    import secrets
    from datetime import datetime, timedelta
    
    normalized_email = email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    
    if not user:
        return None
    
    # Generate a secure token
    token = secrets.token_urlsafe(32)
    
    # Store token hash and expiry on user (token expires in 1 hour)
    user.password_reset_token = hash_password(token)
    user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    return token


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """
    Reset user's password using the reset token.
    Returns True if successful, raises HTTPException otherwise.
    """
    from datetime import datetime
    
    # Find user with valid reset token
    users = db.query(User).filter(
        User.password_reset_token.isnot(None),
        User.password_reset_expires > datetime.utcnow()
    ).all()
    
    # Check token against all users with pending resets
    target_user = None
    for user in users:
        if verify_password(token, user.password_reset_token):
            target_user = user
            break
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token. Please request a new password reset."
        )
    
    # Update password and clear reset token
    target_user.password_hash = hash_password(new_password)
    target_user.password_reset_token = None
    target_user.password_reset_expires = None
    db.commit()
    
    return True


# ================== Profile Update Functions ==================

def update_user_profile(
    db: Session, 
    user: User, 
    name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    timezone: Optional[str] = None
) -> None:
    """
    Update user profile settings.
    """
    from sqlalchemy import text
    
    # Build update query dynamically
    updates = []
    params = {"user_id": user.id}
    
    if name is not None:
        updates.append("name = :name")
        params["name"] = name.strip() if name else None
        
    if avatar_url is not None:
        updates.append("avatar_url = :avatar_url")
        params["avatar_url"] = avatar_url.strip() if avatar_url else None
        
    if timezone is not None:
        updates.append("timezone = :timezone")
        params["timezone"] = timezone.strip() if timezone else None
        
    if updates:
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = :user_id"
        db.execute(text(query), params)
        db.commit()


def update_organization_settings(
    db: Session,
    user: User,
    name: Optional[str] = None,
    industry: Optional[str] = None,
    currency: Optional[str] = None,
    timezone: Optional[str] = None
) -> None:
    """
    Update organization (account) settings.
    """
    from sqlalchemy import text
    
    from datetime import datetime
    
    updates = ["updated_at = :updated_at"]
    params = {"account_id": user.account_id, "updated_at": datetime.utcnow()}
    
    if name is not None:
        clean_name = name.strip()
        if not clean_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workspace name cannot be empty"
            )
        updates.append("name = :name")
        params["name"] = clean_name
        
    if industry is not None:
        updates.append("industry = :industry")
        params["industry"] = industry.strip() if industry else None
        
    if currency is not None:
        updates.append("currency = :currency")
        params["currency"] = currency.strip().upper() if currency else None
        
    if timezone is not None:
        updates.append("timezone = :timezone")
        params["timezone"] = timezone.strip() if timezone else None
        
    if len(updates) > 1:  # More than just updated_at
        query = f"UPDATE accounts SET {', '.join(updates)} WHERE id = :account_id"
        db.execute(text(query), params)
        db.commit()


def update_email(db: Session, user: User, new_email: str) -> None:
    """
    Update user email address.
    
    :param user: Current user
    :param new_email: New email address
    """
    from sqlalchemy import text
    
    normalized_email = new_email.strip().lower()
    
    # Check if email is already in use by another user
    result = db.execute(
        text("SELECT id FROM users WHERE email = :email AND id != :user_id LIMIT 1"),
        {"email": normalized_email, "user_id": user.id}
    )
    if result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already in use by another account"
        )
    
    # Update email
    db.execute(
        text("UPDATE users SET email = :email WHERE id = :user_id"),
        {"email": normalized_email, "user_id": user.id}
    )
    db.commit()


def update_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    """
    Update user password after verifying current password.
    
    :param user: Current user
    :param current_password: Current password for verification
    :param new_password: New password to set
    """
    from sqlalchemy import text
    
    # Get current password hash
    result = db.execute(
        text("SELECT password_hash FROM users WHERE id = :user_id"),
        {"user_id": user.id}
    )
    row = result.fetchone()
    
    if not row or not verify_password(current_password, row[0]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update to new password
    db.execute(
        text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id"),
        {"password_hash": hash_password(new_password), "user_id": user.id}
    )
    db.commit()


def get_account_name(db: Session, account_id: str) -> Optional[str]:
    """Get account name by account ID."""
    from sqlalchemy import text
    
    result = db.execute(
        text("SELECT name FROM accounts WHERE id = :account_id"),
        {"account_id": account_id}
    )
    row = result.fetchone()
    return row[0] if row else None

