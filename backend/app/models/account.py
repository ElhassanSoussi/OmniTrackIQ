import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func

from app.db import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="business")  # business | agency
    created_at = Column(DateTime(timezone=True), server_default=func.now())
