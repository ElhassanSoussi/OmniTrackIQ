"""
AdAccount (DataSource) model for tracking connected ad platform accounts.
Each AdAccount represents a specific account within a platform (e.g., a Facebook Ad Account).
"""
import uuid
from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Index, String, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class AdAccountStatus(str, PyEnum):
    """Status of an ad account connection."""
    ACTIVE = "active"
    PAUSED = "paused"
    DISCONNECTED = "disconnected"
    ERROR = "error"


class AdAccount(Base):
    """
    Represents an ad account/data source connected through an integration.
    
    For example, a Facebook integration might have multiple ad accounts.
    This enables granular tracking at the ad account level.
    """
    __tablename__ = "ad_accounts"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Multi-tenancy: workspace/account scope
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, index=True)
    
    # Link to the parent integration (OAuth connection) - nullable for demo/manual accounts
    integration_id = Column(String, ForeignKey("integrations.id"), nullable=True, index=True)
    
    # Platform type (denormalized for efficient queries)
    platform = Column(String, nullable=False)  # facebook, google_ads, tiktok, etc.
    
    # External identifiers from the platform
    external_id = Column(String, nullable=False)  # Platform's account ID
    external_name = Column(String, nullable=True)  # Platform's account name
    
    # Display name (can be customized by user)
    name = Column(String, nullable=False)
    
    # Status
    status = Column(
        Enum(AdAccountStatus),
        nullable=False,
        default=AdAccountStatus.ACTIVE
    )
    
    # Currency for this ad account
    currency = Column(String, default="USD")
    
    # Timezone (from platform)
    timezone = Column(String, nullable=True)
    
    # Additional metadata from the platform (JSON)
    meta_data = Column(Text, nullable=True)
    
    # Last sync timestamp
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    
    # Soft delete flag
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    
    # Relationships
    # integration = relationship("Integration", back_populates="ad_accounts")
    
    # Indexes for common query patterns
    __table_args__ = (
        # Multi-tenant queries: get all ad accounts for a workspace
        Index("ix_ad_accounts_account_id_platform", "account_id", "platform"),
        # Lookup by external ID
        Index("ix_ad_accounts_account_id_external_id", "account_id", "external_id"),
        # Get active accounts for a workspace
        Index("ix_ad_accounts_account_id_status", "account_id", "status"),
    )
    
    def __repr__(self):
        return f"<AdAccount(id={self.id}, name={self.name}, platform={self.platform})>"
