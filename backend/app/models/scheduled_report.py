"""
Model for scheduled email reports.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
import enum

from app.db import Base


class ReportFrequency(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class ReportType(str, enum.Enum):
    OVERVIEW = "overview"
    CAMPAIGNS = "campaigns"
    REVENUE = "revenue"
    ORDERS = "orders"
    CUSTOM = "custom"


class ScheduledReport(Base):
    """Scheduled report configuration for email delivery."""
    __tablename__ = "scheduled_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, index=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Report configuration
    name = Column(String(255), nullable=False)
    report_type = Column(SQLEnum(ReportType), nullable=False, default=ReportType.OVERVIEW)
    frequency = Column(SQLEnum(ReportFrequency), nullable=False, default=ReportFrequency.WEEKLY)
    
    # Recipients (comma-separated emails or JSON array)
    recipients = Column(JSON, nullable=False, default=list)
    
    # Filters and settings
    date_range_days = Column(String(10), default="30")  # "7", "30", "90", or "custom"
    platforms = Column(JSON, default=list)  # Empty = all platforms
    metrics = Column(JSON, default=list)  # Specific metrics to include
    
    # Scheduling
    is_active = Column(Boolean, default=True)
    send_time = Column(String(5), default="09:00")  # HH:MM format
    timezone = Column(String(50), default="UTC")
    day_of_week = Column(String(10), nullable=True)  # For weekly: "monday", "tuesday", etc.
    day_of_month = Column(String(2), nullable=True)  # For monthly: "1", "15", etc.
    
    # Tracking
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    next_send_at = Column(DateTime(timezone=True), nullable=True)
    send_count = Column(String, default="0")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
