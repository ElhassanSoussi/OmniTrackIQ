"""
Team management schemas.
"""
import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, validator

from app.models.user import UserRole

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# Team Member schemas
class TeamMemberResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    role: UserRole
    created_at: datetime
    last_login_at: Optional[datetime]

    class Config:
        from_attributes = True


class TeamMemberUpdate(BaseModel):
    role: Optional[UserRole] = None
    name: Optional[str] = None


# Team Invite schemas
class TeamInviteCreate(BaseModel):
    email: str
    role: UserRole = UserRole.MEMBER

    @validator("email")
    def normalize_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise ValueError("Invalid email address")
        return email

    @validator("role")
    def validate_role(cls, v: UserRole) -> UserRole:
        # Cannot invite as owner
        if v == UserRole.OWNER:
            raise ValueError("Cannot invite users as owner")
        return v


class TeamInviteResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    status: str
    created_at: datetime
    expires_at: datetime
    invited_by_email: str

    class Config:
        from_attributes = True


class TeamInviteAccept(BaseModel):
    token: str
    password: str
    name: Optional[str] = None

    @validator("password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


# Bulk invite
class BulkInviteRequest(BaseModel):
    invites: List[TeamInviteCreate]

    @validator("invites")
    def validate_invites(cls, v: List[TeamInviteCreate]) -> List[TeamInviteCreate]:
        if len(v) > 20:
            raise ValueError("Cannot send more than 20 invites at once")
        emails = [invite.email for invite in v]
        if len(emails) != len(set(emails)):
            raise ValueError("Duplicate emails in invite list")
        return v


class BulkInviteResponse(BaseModel):
    successful: List[str]
    failed: List[dict]


# Account/Team info
class TeamInfoResponse(BaseModel):
    account_id: str
    account_name: str
    plan: str
    max_users: int
    current_users: int
    members: List[TeamMemberResponse]
    pending_invites: List[TeamInviteResponse]
