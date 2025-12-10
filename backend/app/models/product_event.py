"""Product event model for analytics tracking."""
import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, String, JSON, Index
from sqlalchemy.sql import func

from app.db import Base


class ProductEventName(str, Enum):
    """Allowed product event names for tracking."""
    # Authentication & Onboarding
    SIGNUP_COMPLETED = "signup_completed"
    ONBOARDING_COMPLETED = "onboarding_completed"
    
    # Integrations
    INTEGRATION_CONNECTED = "integration_connected"
    INTEGRATION_DISCONNECTED = "integration_disconnected"
    
    # Dashboard Views
    VIEWED_OVERVIEW_DASHBOARD = "viewed_overview_dashboard"
    VIEWED_CAMPAIGNS_DASHBOARD = "viewed_campaigns_dashboard"
    VIEWED_ORDERS_DASHBOARD = "viewed_orders_dashboard"
    
    # Billing & Trial
    STARTED_TRIAL = "started_trial"
    TRIAL_EXPIRED = "trial_expired"
    SUBSCRIPTION_ACTIVATED = "subscription_activated"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    
    # Demo
    DEMO_LOGIN = "demo_login"
    DEMO_TO_SIGNUP = "demo_to_signup"
    
    # Feature Usage
    REPORT_CREATED = "report_created"
    REPORT_EXPORTED = "report_exported"
    TEAM_MEMBER_INVITED = "team_member_invited"


# Whitelist of allowed event names for validation
ALLOWED_EVENT_NAMES = {e.value for e in ProductEventName}


class ProductEvent(Base):
    """Track product usage events for analytics."""
    __tablename__ = "product_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Context - nullable for unauthenticated events
    workspace_id = Column(String, nullable=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    
    # Event data
    event_name = Column(String, nullable=False, index=True)
    properties = Column(JSON, nullable=False, default=dict)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_product_events_workspace_event', 'workspace_id', 'event_name'),
        Index('ix_product_events_created_event', 'created_at', 'event_name'),
    )
