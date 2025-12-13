import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base

class ReportTemplate(Base):
    __tablename__ = "report_templates"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Store report configuration (metrics, dimensions, filters, etc.)
    config_json = Column(JSON, nullable=False, server_default='{}')
    
    is_public = Column(Boolean, default=False, nullable=False)  # Visible to all users in account
    created_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    account = relationship("Account", back_populates="report_templates")
    created_by = relationship("User")
