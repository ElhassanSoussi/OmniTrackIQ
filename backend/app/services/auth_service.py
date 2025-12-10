from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.user import User
from app.security.jwt import create_access_token
from app.security.password import hash_password, verify_password
from app.services import events_service


def signup(db: Session, email: str, password: str, account_name: str) -> str:
    normalized_email = email.strip().lower()
    normalized_account_name = account_name.strip()

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
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

    user = User(email=normalized_email, password_hash=hash_password(password), account_id=account_id)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Track signup completed event
    events_service.track_event(
        db=db,
        event_name="signup_completed",
        properties={"signup_method": "email"},
        workspace_id=account_id,
        user_id=user.id,
    )

    token = create_access_token(user.id)
    return token


def login(db: Session, email: str, password: str) -> str:
    normalized_email = email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password. Please try again."
        )
    return create_access_token(user.id)
