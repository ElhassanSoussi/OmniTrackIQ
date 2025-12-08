"""
Team management endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.account import Account
from app.routers.deps import get_current_user, get_db
from app.schemas.team import (
    TeamMemberResponse,
    TeamMemberUpdate,
    TeamInviteCreate,
    TeamInviteResponse,
    TeamInviteAccept,
    BulkInviteRequest,
    BulkInviteResponse,
    TeamInfoResponse,
)
from app.services import team_service
from app.security.rbac import require_admin, require_owner
from app.security.rate_limit import limiter, get_default_rate_limit

router = APIRouter()


@router.get("", response_model=TeamInfoResponse)
def get_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team information including members and pending invites."""
    account = db.query(Account).filter(Account.id == current_user.account_id).first()
    members = team_service.get_team_members(db, current_user.account_id)
    pending_invites = team_service.get_pending_invites(db, current_user.account_id)
    
    return TeamInfoResponse(
        account_id=account.id,
        account_name=account.name,
        plan=account.plan.value,
        max_users=account.max_users,
        current_users=len(members),
        members=[
            TeamMemberResponse(
                id=m.id,
                email=m.email,
                name=m.name,
                role=m.role,
                created_at=m.created_at,
                last_login_at=m.last_login_at
            )
            for m in members
        ],
        pending_invites=[
            TeamInviteResponse(
                id=inv.id,
                email=inv.email,
                role=inv.role,
                status=inv.status.value,
                created_at=inv.created_at,
                expires_at=inv.expires_at,
                invited_by_email=inv.invited_by.email
            )
            for inv in pending_invites
        ]
    )


@router.get("/members", response_model=List[TeamMemberResponse])
def get_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all team members."""
    members = team_service.get_team_members(db, current_user.account_id)
    return [
        TeamMemberResponse(
            id=m.id,
            email=m.email,
            name=m.name,
            role=m.role,
            created_at=m.created_at,
            last_login_at=m.last_login_at
        )
        for m in members
    ]


@router.patch("/members/{user_id}", response_model=TeamMemberResponse)
def update_member(
    user_id: str,
    body: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Update a team member's role or name. Requires admin role."""
    if body.role:
        user = team_service.update_team_member_role(
            db,
            current_user.account_id,
            user_id,
            body.role,
            current_user
        )
    else:
        user = team_service.get_team_member(db, current_user.account_id, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    
    if body.name is not None:
        user.name = body.name
        db.commit()
        db.refresh(user)
    
    return TeamMemberResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        created_at=user.created_at,
        last_login_at=user.last_login_at
    )


@router.delete("/members/{user_id}")
def remove_member(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Remove a team member. Requires admin role."""
    team_service.remove_team_member(db, current_user.account_id, user_id, current_user)
    return {"message": "Team member removed successfully"}


# Invite endpoints
@router.post("/invites", response_model=TeamInviteResponse)
@limiter.limit(get_default_rate_limit())
def create_invite(
    request: Request,
    body: TeamInviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Create a team invite. Requires admin role."""
    invite = team_service.create_invite(
        db,
        current_user.account_id,
        body.email,
        body.role,
        current_user
    )
    return TeamInviteResponse(
        id=invite.id,
        email=invite.email,
        role=invite.role,
        status=invite.status.value,
        created_at=invite.created_at,
        expires_at=invite.expires_at,
        invited_by_email=current_user.email
    )


@router.post("/invites/bulk", response_model=BulkInviteResponse)
@limiter.limit("5/minute")  # Stricter limit for bulk operations
def bulk_invite(
    request: Request,
    body: BulkInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Send multiple invites at once. Requires admin role."""
    successful = []
    failed = []
    
    for invite_data in body.invites:
        try:
            team_service.create_invite(
                db,
                current_user.account_id,
                invite_data.email,
                invite_data.role,
                current_user
            )
            successful.append(invite_data.email)
        except HTTPException as e:
            failed.append({"email": invite_data.email, "error": e.detail})
    
    return BulkInviteResponse(successful=successful, failed=failed)


@router.get("/invites", response_model=List[TeamInviteResponse])
def get_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending invites."""
    invites = team_service.get_pending_invites(db, current_user.account_id)
    return [
        TeamInviteResponse(
            id=inv.id,
            email=inv.email,
            role=inv.role,
            status=inv.status.value,
            created_at=inv.created_at,
            expires_at=inv.expires_at,
            invited_by_email=inv.invited_by.email
        )
        for inv in invites
    ]


@router.delete("/invites/{invite_id}")
def cancel_invite(
    invite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Cancel a pending invite. Requires admin role."""
    team_service.cancel_invite(db, current_user.account_id, invite_id)
    return {"message": "Invite cancelled successfully"}


@router.post("/invites/{invite_id}/resend", response_model=TeamInviteResponse)
@limiter.limit("5/minute")
def resend_invite(
    request: Request,
    invite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Resend an invite (regenerates token and extends expiry). Requires admin role."""
    invite = team_service.resend_invite(db, current_user.account_id, invite_id)
    return TeamInviteResponse(
        id=invite.id,
        email=invite.email,
        role=invite.role,
        status=invite.status.value,
        created_at=invite.created_at,
        expires_at=invite.expires_at,
        invited_by_email=invite.invited_by.email
    )


# Public endpoint for accepting invites
@router.post("/invites/accept")
@limiter.limit("10/minute")
def accept_invite(
    request: Request,
    body: TeamInviteAccept,
    db: Session = Depends(get_db)
):
    """Accept an invite and create a user account. Returns JWT token."""
    token = team_service.accept_invite(db, body.token, body.password, body.name)
    return {"access_token": token, "token_type": "bearer"}


# Get invite info (for accept page)
@router.get("/invites/info/{token}")
def get_invite_info(
    token: str,
    db: Session = Depends(get_db)
):
    """Get invite information by token (for accept invite page)."""
    invite = team_service.get_invite_by_token(db, token)
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation link"
        )
    
    account = db.query(Account).filter(Account.id == invite.account_id).first()
    
    return {
        "email": invite.email,
        "role": invite.role.value,
        "account_name": account.name if account else "Unknown",
        "status": invite.status.value,
        "expires_at": invite.expires_at.isoformat(),
        "is_valid": invite.status.value == "pending"
    }


# Ownership transfer
@router.post("/transfer-ownership/{user_id}")
def transfer_ownership(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner())
):
    """Transfer account ownership to another user. Requires owner role."""
    team_service.transfer_ownership(db, current_user.account_id, user_id, current_user)
    return {"message": "Ownership transferred successfully"}
