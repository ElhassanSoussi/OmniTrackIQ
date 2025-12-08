"""
Saved views for dashboard configurations.
"""
import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class ViewType(str, Enum):
    """Types of saved views."""
    EXECUTIVE = "executive"
    ACQUISITION = "acquisition"
    CAMPAIGNS = "campaigns"
    CUSTOM = "custom"


class SavedView(Base):
    """Saved dashboard view configuration."""
    __tablename__ = "saved_views"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    name = Column(String, nullable=False)
    view_type = Column(SQLEnum(ViewType), nullable=False, default=ViewType.CUSTOM)
    description = Column(String, nullable=True)
    
    # JSON configuration for filters, date range, metrics shown, etc.
    config_json = Column(Text, nullable=False, default="{}")
    
    # Whether this view is shared with the team
    is_shared = Column(String, nullable=False, default="private")  # private | team
    is_default = Column(String, nullable=False, default="false")  # true | false
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    account = relationship("Account", backref="saved_views")
    user = relationship("User", backref="saved_views")
