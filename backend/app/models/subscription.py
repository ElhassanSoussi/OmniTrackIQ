import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.db import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)

    stripe_customer_id = Column(String, nullable=False)
    stripe_subscription_id = Column(String, nullable=False)
    plan = Column(String, nullable=False)
    status = Column(String, nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
