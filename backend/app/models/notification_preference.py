"""
Notification preference model for user notification settings.
"""
import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.orm import relationship

from app.db import Base


class NotificationChannel(str, PyEnum):
    """Notification delivery channels."""
    EMAIL = "email"
    IN_APP = "in_app"
    # Future: SLACK = "slack", WEBHOOK = "webhook"


class AlertType(str, PyEnum):
    """Types of alerts users can configure."""
    ANOMALY_SPIKE = "anomaly_spike"  # Unusual increase in metrics
    ANOMALY_DROP = "anomaly_drop"    # Unusual decrease in metrics
    SPEND_THRESHOLD = "spend_threshold"  # Daily spend exceeds threshold
    ROAS_THRESHOLD = "roas_threshold"    # ROAS drops below threshold
    BUDGET_ALERT = "budget_alert"        # Approaching budget limit
    WEEKLY_REPORT = "weekly_report"      # Weekly summary report
    MONTHLY_REPORT = "monthly_report"    # Monthly summary report


class NotificationPreference(Base):
    """User notification preferences."""
    __tablename__ = "notification_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Global preferences
    email_notifications_enabled = Column(Boolean, default=True)
    in_app_notifications_enabled = Column(Boolean, default=True)
    
    # Alert preferences
    anomaly_alerts_enabled = Column(Boolean, default=True)
    anomaly_sensitivity = Column(String(20), default="medium")  # low, medium, high
    
    spend_alerts_enabled = Column(Boolean, default=False)
    daily_spend_threshold = Column(Integer, nullable=True)  # Alert if daily spend exceeds this
    
    roas_alerts_enabled = Column(Boolean, default=False)
    roas_threshold = Column(Integer, nullable=True)  # Alert if ROAS drops below this (stored as percentage * 100)
    
    budget_alerts_enabled = Column(Boolean, default=True)
    budget_alert_percentage = Column(Integer, default=80)  # Alert at 80% of budget
    
    # Report preferences
    weekly_report_enabled = Column(Boolean, default=True)
    weekly_report_day = Column(Integer, default=1)  # 0=Sunday, 1=Monday, etc.
    
    monthly_report_enabled = Column(Boolean, default=False)
    
    # Quiet hours (don't send notifications during these hours)
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(Integer, default=22)  # 10 PM
    quiet_hours_end = Column(Integer, default=8)     # 8 AM
    timezone = Column(String(50), default="UTC")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notification_preferences")

    def __repr__(self):
        return f"<NotificationPreference user_id={self.user_id}>"


class NotificationLog(Base):
    """Log of sent notifications for tracking and preventing duplicates."""
    __tablename__ = "notification_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    alert_type = Column(Enum(AlertType), nullable=False)
    channel = Column(Enum(NotificationChannel), nullable=False)
    
    title = Column(String(255), nullable=False)
    message = Column(String(2000), nullable=True)
    
    # For deduplication
    reference_id = Column(String(100), nullable=True)  # e.g., anomaly_id, campaign_id
    
    # Status
    sent_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notification_logs")

    def __repr__(self):
        return f"<NotificationLog {self.alert_type} to user={self.user_id}>"
