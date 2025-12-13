import uuid
from enum import Enum

from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Boolean, Enum as SQLEnum, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class AccountPlan(str, Enum):
    """Subscription plan tiers."""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    AGENCY = "agency"
    ENTERPRISE = "enterprise"


# Default onboarding steps structure
DEFAULT_ONBOARDING_STEPS = {
    "created_workspace": False,
    "connected_integration": False,
    "viewed_dashboard": False,
}


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="business")  # business | agency
    plan = Column(SQLEnum(AccountPlan), nullable=False, default=AccountPlan.FREE)
    max_users = Column(Integer, nullable=False, default=1)  # Determined by plan
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_subscription_id = Column(String, nullable=True)
    
    # Relationships for Phase 5B
    report_templates = relationship("ReportTemplate", back_populates="account", cascade="all, delete-orphan")
    custom_metrics = relationship("CustomMetric", back_populates="account", cascade="all, delete-orphan")
    
    # Organization settings
    industry = Column(String, nullable=True)
    currency = Column(String, nullable=True, default="USD")
    timezone = Column(String, nullable=True, default="UTC")
    
    # Onboarding tracking - nullable to support databases without these columns yet
    onboarding_completed = Column(Boolean, nullable=True, default=False)
    onboarding_steps = Column(JSON, nullable=True, default=lambda: DEFAULT_ONBOARDING_STEPS.copy())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
