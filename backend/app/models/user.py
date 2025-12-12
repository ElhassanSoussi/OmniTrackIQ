import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, String, Enum as SQLEnum
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.sql import func

from app.db import Base


class UserRole(str, Enum):
    """User roles for role-based access control."""
    OWNER = "owner"      # Full access, can delete account, manage billing
    ADMIN = "admin"      # Can manage team, integrations, settings
    MEMBER = "member"    # Can view and create reports
    VIEWER = "viewer"    # Read-only access


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.OWNER)
    name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Password reset fields - deferred to avoid SELECT errors if columns don't exist yet
    password_reset_token = deferred(Column(String, nullable=True))
    password_reset_expires = deferred(Column(DateTime(timezone=True), nullable=True))

    account = relationship("Account", backref="users")
    notification_preferences = relationship(
        "NotificationPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    notification_logs = relationship(
        "NotificationLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )
