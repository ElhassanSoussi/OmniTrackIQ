"""
Schemas for notification preferences and alerts.
"""
from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field


class AlertType(str, Enum):
    """Types of alerts."""
    ANOMALY_SPIKE = "anomaly_spike"
    ANOMALY_DROP = "anomaly_drop"
    SPEND_THRESHOLD = "spend_threshold"
    ROAS_THRESHOLD = "roas_threshold"
    BUDGET_ALERT = "budget_alert"
    WEEKLY_REPORT = "weekly_report"
    MONTHLY_REPORT = "monthly_report"


class NotificationChannel(str, Enum):
    """Notification channels."""
    EMAIL = "email"
    IN_APP = "in_app"


class NotificationPreferenceResponse(BaseModel):
    """Response schema for notification preferences."""
    id: str
    user_id: str
    
    # Global preferences
    email_notifications_enabled: bool
    in_app_notifications_enabled: bool
    
    # Anomaly alerts
    anomaly_alerts_enabled: bool
    anomaly_sensitivity: str
    
    # Spend alerts
    spend_alerts_enabled: bool
    daily_spend_threshold: Optional[int] = None
    
    # ROAS alerts
    roas_alerts_enabled: bool
    roas_threshold: Optional[int] = None
    
    # Budget alerts
    budget_alerts_enabled: bool
    budget_alert_percentage: int
    
    # Report preferences
    weekly_report_enabled: bool
    weekly_report_day: int
    monthly_report_enabled: bool
    
    # Quiet hours
    quiet_hours_enabled: bool
    quiet_hours_start: int
    quiet_hours_end: int
    timezone: str
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferenceUpdate(BaseModel):
    """Update schema for notification preferences."""
    # Global preferences
    email_notifications_enabled: Optional[bool] = None
    in_app_notifications_enabled: Optional[bool] = None
    
    # Anomaly alerts
    anomaly_alerts_enabled: Optional[bool] = None
    anomaly_sensitivity: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    
    # Spend alerts
    spend_alerts_enabled: Optional[bool] = None
    daily_spend_threshold: Optional[int] = Field(None, ge=0)
    
    # ROAS alerts
    roas_alerts_enabled: Optional[bool] = None
    roas_threshold: Optional[int] = Field(None, ge=0)
    
    # Budget alerts
    budget_alerts_enabled: Optional[bool] = None
    budget_alert_percentage: Optional[int] = Field(None, ge=1, le=100)
    
    # Report preferences
    weekly_report_enabled: Optional[bool] = None
    weekly_report_day: Optional[int] = Field(None, ge=0, le=6)
    monthly_report_enabled: Optional[bool] = None
    
    # Quiet hours
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[int] = Field(None, ge=0, le=23)
    quiet_hours_end: Optional[int] = Field(None, ge=0, le=23)
    timezone: Optional[str] = None


class NotificationLogResponse(BaseModel):
    """Response schema for notification log entry."""
    id: str
    alert_type: AlertType
    channel: NotificationChannel
    title: str
    message: Optional[str] = None
    reference_id: Optional[str] = None
    sent_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationLogList(BaseModel):
    """Paginated list of notification logs."""
    items: List[NotificationLogResponse]
    total: int
    unread_count: int


class MarkNotificationsReadRequest(BaseModel):
    """Request to mark notifications as read."""
    notification_ids: Optional[List[str]] = None  # If None, mark all as read
