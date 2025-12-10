"""
Client account model for agency multi-client management.
Allows agencies to manage multiple client accounts from a single agency account.
"""
import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, String, Boolean, Enum as SQLEnum, Index, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class ClientStatus(str, Enum):
    """Client account status."""
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"
    PENDING_SETUP = "pending_setup"


class ClientAccount(Base):
    """
    Represents a client account managed by an agency.
    Each client account is a separate workspace with its own data.
    """
    __tablename__ = "client_accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # The agency account that owns/manages this client
    agency_account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    
    # Client workspace details
    name = Column(String, nullable=False)  # Client company name
    slug = Column(String, nullable=False)  # URL-friendly identifier
    industry = Column(String, nullable=True)  # e-commerce, saas, retail, etc.
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # Status
    status = Column(SQLEnum(ClientStatus), nullable=False, default=ClientStatus.PENDING_SETUP)
    
    # Settings
    settings = Column(JSON, nullable=False, default=lambda: {
        "timezone": "UTC",
        "currency": "USD",
        "date_format": "YYYY-MM-DD",
        "white_label": False,
    })
    
    # Branding for white-label reports
    branding = Column(JSON, nullable=False, default=lambda: {
        "primary_color": "#10B981",
        "logo_url": None,
        "company_name": None,
        "report_footer": None,
    })
    
    # Contact information
    primary_contact_name = Column(String, nullable=True)
    primary_contact_email = Column(String, nullable=True)
    
    # Notes for internal agency use
    internal_notes = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    agency_account = relationship("Account", backref="client_accounts")
    
    # Indexes
    __table_args__ = (
        Index("ix_client_accounts_agency_id", "agency_account_id"),
        Index("ix_client_accounts_slug", "agency_account_id", "slug", unique=True),
        Index("ix_client_accounts_status", "status"),
    )


class ClientUserAccess(Base):
    """
    Maps which agency users have access to which client accounts.
    Enables granular permission control per client.
    """
    __tablename__ = "client_user_access"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    client_account_id = Column(String, ForeignKey("client_accounts.id"), nullable=False)
    
    # Permission level for this specific client
    can_view = Column(Boolean, nullable=False, default=True)
    can_edit = Column(Boolean, nullable=False, default=False)
    can_manage = Column(Boolean, nullable=False, default=False)  # Can invite others, change settings
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="client_access")
    client_account = relationship("ClientAccount", backref="user_access")
    
    # Indexes
    __table_args__ = (
        Index("ix_client_user_access_user_id", "user_id"),
        Index("ix_client_user_access_client_id", "client_account_id"),
        Index("ix_client_user_access_unique", "user_id", "client_account_id", unique=True),
    )
