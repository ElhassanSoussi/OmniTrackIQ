import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base
from app.models.user import UserRole


class InviteStatus(str, Enum):
    """Status of a team invitation."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class TeamInvite(Base):
    """Team invitation for adding users to an account."""
    __tablename__ = "team_invites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    email = Column(String, nullable=False, index=True)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.MEMBER)
    token = Column(String, unique=True, nullable=False, index=True)
    status = Column(SQLEnum(InviteStatus), nullable=False, default=InviteStatus.PENDING)
    invited_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    account = relationship("Account", backref="invites")
    invited_by = relationship("User", backref="sent_invites")
