import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, String, Integer, Enum as SQLEnum
from sqlalchemy.sql import func

from app.db import Base


class AccountPlan(str, Enum):
    """Subscription plan tiers."""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    AGENCY = "agency"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="business")  # business | agency
    plan = Column(SQLEnum(AccountPlan), nullable=False, default=AccountPlan.FREE)
    max_users = Column(Integer, nullable=False, default=1)  # Determined by plan
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_subscription_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
