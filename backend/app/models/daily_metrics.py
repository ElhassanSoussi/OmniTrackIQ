import uuid

from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String

from app.db import Base


class DailyMetrics(Base):
    __tablename__ = "daily_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    date = Column(Date, nullable=False)

    total_revenue = Column(Numeric(18, 4), nullable=False, default=0)
    total_ad_spend = Column(Numeric(18, 4), nullable=False, default=0)
    total_orders = Column(Integer, nullable=False, default=0)
    total_clicks = Column(Integer, nullable=False, default=0)
    total_impressions = Column(Integer, nullable=False, default=0)
    roas = Column(Numeric(18, 4), nullable=False, default=0)
    profit = Column(Numeric(18, 4), nullable=False, default=0)
