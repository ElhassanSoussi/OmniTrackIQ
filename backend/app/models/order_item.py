"""Order item model for per-product profitability analytics."""
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Integer
from sqlalchemy.sql import func

from app.db import Base


class OrderItem(Base):
    """
    Individual line items within an order.
    Used for per-product profitability calculations.
    """
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False, index=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, index=True)
    
    # Product identification
    product_id = Column(String, nullable=False, index=True)
    product_name = Column(String, nullable=False)
    sku = Column(String, nullable=True)
    
    # Sales data
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(18, 4), nullable=False)
    total_price = Column(Numeric(18, 4), nullable=False)  # quantity * unit_price
    
    # Cost data (for COGS calculation)
    # Nullable - will default to 0 if not available
    cost_per_unit = Column(Numeric(18, 4), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
