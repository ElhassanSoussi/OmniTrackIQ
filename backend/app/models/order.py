import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.sql import func

from app.db import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    source_platform = Column(String, nullable=False)
    external_order_id = Column(String, nullable=False)

    date_time = Column(DateTime(timezone=True), nullable=False)
    total_amount = Column(Numeric(18, 4), nullable=False)
    currency = Column(String, nullable=False)

    utm_source = Column(String, nullable=True)
    utm_campaign = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
