"""
Team management service.
"""
import secrets
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.user import User, UserRole
from app.models.team_invite import TeamInvite, InviteStatus
from app.security.password import hash_password
from app.security.jwt import create_access_token
from app.security.rbac import get_plan_limit


def get_team_members(db: Session, account_id: str) -> List[User]:
    """Get all users in an account."""
    return db.query(User).filter(User.account_id == account_id).all()


def get_team_member(db: Session, account_id: str, user_id: str) -> Optional[User]:
    """Get a specific team member."""
    return db.query(User).filter(
        User.account_id == account_id,
        User.id == user_id
    ).first()


def update_team_member_role(
    db: Session,
    account_id: str,
    user_id: str,
    new_role: UserRole,
    current_user: User
) -> User:
    """Update a team member's role."""
    user = get_team_member(db, account_id, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this account"
        )
    
    # Cannot change own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    # Cannot demote or change owner (there can only be one owner)
    if user.role == UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change owner role. Transfer ownership first."
        )
    
    # Cannot promote to owner
    if new_role == UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot promote to owner. Use transfer ownership instead."
        )
    
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def remove_team_member(
    db: Session,
    account_id: str,
    user_id: str,
    current_user: User
) -> bool:
    """Remove a team member from the account."""
    user = get_team_member(db, account_id, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this account"
        )
    
    # Cannot remove self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself from the team"
        )
    
    # Cannot remove owner
    if user.role == UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the account owner"
        )
    
    db.delete(user)
    db.commit()
    return True


def create_invite(
    db: Session,
    account_id: str,
    email: str,
    role: UserRole,
    invited_by: User
) -> TeamInvite:
    """Create a team invite."""
    # Check if email already exists in the system
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        if existing_user.account_id == account_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This user is already a member of your team"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered with another account"
        )
    
    # Check for existing pending invite
    existing_invite = db.query(TeamInvite).filter(
        TeamInvite.account_id == account_id,
        TeamInvite.email == email,
        TeamInvite.status == InviteStatus.PENDING
    ).first()
    if existing_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A pending invite already exists for this email"
        )
    
    # Check user limit based on plan
    account = db.query(Account).filter(Account.id == account_id).first()
    current_users = db.query(User).filter(User.account_id == account_id).count()
    pending_invites = db.query(TeamInvite).filter(
        TeamInvite.account_id == account_id,
        TeamInvite.status == InviteStatus.PENDING
    ).count()
    
    max_users = account.max_users if account else get_plan_limit("free", "max_users")
    if max_users != -1 and (current_users + pending_invites) >= max_users:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Team member limit reached ({max_users}). Upgrade your plan to add more users."
        )
    
    # Create invite
    token = secrets.token_urlsafe(32)
    invite = TeamInvite(
        account_id=account_id,
        email=email,
        role=role,
        token=token,
        invited_by_id=invited_by.id,
        expires_at=datetime.utcnow() + timedelta(days=7)  # 7 day expiry
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    
    # TODO: Send invite email
    
    return invite


def get_pending_invites(db: Session, account_id: str) -> List[TeamInvite]:
    """Get all pending invites for an account."""
    return db.query(TeamInvite).filter(
        TeamInvite.account_id == account_id,
        TeamInvite.status == InviteStatus.PENDING
    ).all()


def get_invite_by_token(db: Session, token: str) -> Optional[TeamInvite]:
    """Get an invite by its token."""
    return db.query(TeamInvite).filter(TeamInvite.token == token).first()


def accept_invite(
    db: Session,
    token: str,
    password: str,
    name: Optional[str] = None
) -> str:
    """Accept an invite and create a user account. Returns JWT token."""
    invite = get_invite_by_token(db, token)
    
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation link"
        )
    
    if invite.status != InviteStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has already been used or cancelled"
        )
    
    if invite.expires_at < datetime.utcnow():
        invite.status = InviteStatus.EXPIRED
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has expired. Please request a new one."
        )
    
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == invite.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered"
        )
    
    # Create the user
    user = User(
        email=invite.email,
        password_hash=hash_password(password),
        account_id=invite.account_id,
        role=invite.role,
        name=name
    )
    db.add(user)
    
    # Update invite status
    invite.status = InviteStatus.ACCEPTED
    invite.accepted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return create_access_token(user.id)


def cancel_invite(db: Session, account_id: str, invite_id: str) -> bool:
    """Cancel a pending invite."""
    invite = db.query(TeamInvite).filter(
        TeamInvite.id == invite_id,
        TeamInvite.account_id == account_id,
        TeamInvite.status == InviteStatus.PENDING
    ).first()
    
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found or already processed"
        )
    
    invite.status = InviteStatus.CANCELLED
    db.commit()
    return True


def resend_invite(db: Session, account_id: str, invite_id: str) -> TeamInvite:
    """Resend an invite (regenerate token and extend expiry)."""
    invite = db.query(TeamInvite).filter(
        TeamInvite.id == invite_id,
        TeamInvite.account_id == account_id
    ).first()
    
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found"
        )
    
    if invite.status not in [InviteStatus.PENDING, InviteStatus.EXPIRED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot resend this invite"
        )
    
    invite.token = secrets.token_urlsafe(32)
    invite.status = InviteStatus.PENDING
    invite.expires_at = datetime.utcnow() + timedelta(days=7)
    db.commit()
    db.refresh(invite)
    
    # TODO: Send invite email
    
    return invite


def transfer_ownership(
    db: Session,
    account_id: str,
    new_owner_id: str,
    current_owner: User
) -> bool:
    """Transfer account ownership to another user."""
    if current_owner.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can transfer ownership"
        )
    
    new_owner = get_team_member(db, account_id, new_owner_id)
    if not new_owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this account"
        )
    
    if new_owner.id == current_owner.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already the owner"
        )
    
    # Transfer ownership
    current_owner.role = UserRole.ADMIN
    new_owner.role = UserRole.OWNER
    db.commit()
    
    return True
