import uuid

from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String

from app.db import Base


class AdSpend(Base):
    __tablename__ = "ad_spend"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    platform = Column(String, nullable=False)

    external_account_id = Column(String, nullable=True)
    external_campaign_id = Column(String, nullable=True)
    campaign_name = Column(String, nullable=True)

    date = Column(Date, nullable=False)
    impressions = Column(Integer, nullable=True)
    clicks = Column(Integer, nullable=True)
    conversions = Column(Integer, nullable=True)
    cost = Column(Numeric(18, 4), nullable=False)
