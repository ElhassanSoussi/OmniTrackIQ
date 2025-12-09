"""
Notification service for managing preferences and sending alerts.
"""
import logging
from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session

from app.models.notification_preference import (
    NotificationPreference,
    NotificationLog,
    AlertType,
    NotificationChannel,
)
from app.models.user import User
from app.services.email_service import (
    send_email,
    EmailMessage,
    get_team_invite_email,
    get_anomaly_alert_email,
    get_weekly_report_email,
    is_email_configured,
)
from app.config import settings

logger = logging.getLogger(__name__)


def get_or_create_preferences(db: Session, user_id: str) -> NotificationPreference:
    """Get notification preferences for a user, creating defaults if needed."""
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    ).first()
    
    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs


def update_preferences(
    db: Session,
    user_id: str,
    updates: dict
) -> NotificationPreference:
    """Update notification preferences for a user."""
    prefs = get_or_create_preferences(db, user_id)
    
    for key, value in updates.items():
        if value is not None and hasattr(prefs, key):
            setattr(prefs, key, value)
    
    prefs.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prefs)
    
    return prefs


def get_notifications(
    db: Session,
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False
) -> tuple[List[NotificationLog], int, int]:
    """
    Get notification logs for a user.
    Returns (items, total_count, unread_count).
    """
    query = db.query(NotificationLog).filter(NotificationLog.user_id == user_id)
    
    if unread_only:
        query = query.filter(NotificationLog.read_at.is_(None))
    
    total = query.count()
    unread_count = db.query(NotificationLog).filter(
        NotificationLog.user_id == user_id,
        NotificationLog.read_at.is_(None)
    ).count()
    
    items = query.order_by(NotificationLog.sent_at.desc()).offset(offset).limit(limit).all()
    
    return items, total, unread_count


def mark_notifications_read(
    db: Session,
    user_id: str,
    notification_ids: Optional[List[str]] = None
) -> int:
    """
    Mark notifications as read.
    If notification_ids is None, marks all as read.
    Returns the number of notifications marked as read.
    """
    query = db.query(NotificationLog).filter(
        NotificationLog.user_id == user_id,
        NotificationLog.read_at.is_(None)
    )
    
    if notification_ids:
        query = query.filter(NotificationLog.id.in_(notification_ids))
    
    count = query.update({"read_at": datetime.utcnow()}, synchronize_session=False)
    db.commit()
    
    return count


def create_notification_log(
    db: Session,
    user_id: str,
    alert_type: AlertType,
    channel: NotificationChannel,
    title: str,
    message: Optional[str] = None,
    reference_id: Optional[str] = None
) -> NotificationLog:
    """Create a notification log entry."""
    log = NotificationLog(
        user_id=user_id,
        alert_type=alert_type,
        channel=channel,
        title=title,
        message=message,
        reference_id=reference_id,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def should_send_notification(
    db: Session,
    user_id: str,
    alert_type: AlertType,
    channel: NotificationChannel
) -> bool:
    """
    Check if a notification should be sent based on user preferences.
    """
    prefs = get_or_create_preferences(db, user_id)
    
    # Check global channel preference
    if channel == NotificationChannel.EMAIL and not prefs.email_notifications_enabled:
        return False
    if channel == NotificationChannel.IN_APP and not prefs.in_app_notifications_enabled:
        return False
    
    # Check specific alert type preference
    if alert_type in [AlertType.ANOMALY_SPIKE, AlertType.ANOMALY_DROP]:
        return prefs.anomaly_alerts_enabled
    elif alert_type == AlertType.SPEND_THRESHOLD:
        return prefs.spend_alerts_enabled
    elif alert_type == AlertType.ROAS_THRESHOLD:
        return prefs.roas_alerts_enabled
    elif alert_type == AlertType.BUDGET_ALERT:
        return prefs.budget_alerts_enabled
    elif alert_type == AlertType.WEEKLY_REPORT:
        return prefs.weekly_report_enabled
    elif alert_type == AlertType.MONTHLY_REPORT:
        return prefs.monthly_report_enabled
    
    return True


def send_team_invite_notification(
    db: Session,
    inviter_name: str,
    inviter_email: str,
    invitee_email: str,
    account_name: str,
    invite_token: str,
    role: str
) -> bool:
    """Send team invite email notification."""
    if not is_email_configured():
        logger.warning("Email not configured, skipping team invite notification")
        return False
    
    invite_url = f"{settings.FRONTEND_URL}/invite/{invite_token}"
    
    email_template = get_team_invite_email(
        inviter_name=inviter_name or inviter_email,
        account_name=account_name,
        invite_url=invite_url,
        role=role
    )
    
    message = EmailMessage(
        to=invitee_email,
        subject=email_template.subject,
        body_html=email_template.body_html,
        body_text=email_template.body_text,
        reply_to=inviter_email
    )
    
    return send_email(message)


def send_anomaly_alert_notification(
    db: Session,
    user: User,
    anomaly_type: str,
    metric_name: str,
    current_value: float,
    expected_value: float,
    change_percent: float,
    campaign_name: Optional[str] = None
) -> bool:
    """Send anomaly alert notification via email and in-app."""
    alert_type = AlertType.ANOMALY_SPIKE if change_percent > 0 else AlertType.ANOMALY_DROP
    
    # Check if user wants these notifications
    if not should_send_notification(db, user.id, alert_type, NotificationChannel.EMAIL):
        logger.debug(f"User {user.id} has anomaly alerts disabled")
        return False
    
    # Create in-app notification
    direction = "increased" if change_percent > 0 else "decreased"
    title = f"{metric_name} {direction} by {abs(change_percent):.1f}%"
    message = f"Current: {current_value:,.2f}, Expected: {expected_value:,.2f}"
    if campaign_name:
        message += f" (Campaign: {campaign_name})"
    
    create_notification_log(
        db=db,
        user_id=user.id,
        alert_type=alert_type,
        channel=NotificationChannel.IN_APP,
        title=title,
        message=message,
    )
    
    # Send email if configured
    if is_email_configured():
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        
        email_template = get_anomaly_alert_email(
            user_name=user.name or user.email,
            anomaly_type=anomaly_type,
            metric_name=metric_name,
            current_value=current_value,
            expected_value=expected_value,
            change_percent=change_percent,
            campaign_name=campaign_name,
            dashboard_url=dashboard_url
        )
        
        message_obj = EmailMessage(
            to=user.email,
            subject=email_template.subject,
            body_html=email_template.body_html,
            body_text=email_template.body_text,
        )
        
        send_email(message_obj)
        
        # Log email notification
        create_notification_log(
            db=db,
            user_id=user.id,
            alert_type=alert_type,
            channel=NotificationChannel.EMAIL,
            title=title,
            message=message,
        )
    
    return True


def send_weekly_report_notification(
    db: Session,
    user: User,
    account_name: str,
    period: str,
    total_spend: float,
    total_revenue: float,
    total_roas: float,
    top_campaigns: List[dict]
) -> bool:
    """Send weekly report notification."""
    if not should_send_notification(db, user.id, AlertType.WEEKLY_REPORT, NotificationChannel.EMAIL):
        logger.debug(f"User {user.id} has weekly reports disabled")
        return False
    
    # Create in-app notification
    title = f"Weekly Report: {period}"
    message = f"Spend: ${total_spend:,.0f}, Revenue: ${total_revenue:,.0f}, ROAS: {total_roas:.2f}x"
    
    create_notification_log(
        db=db,
        user_id=user.id,
        alert_type=AlertType.WEEKLY_REPORT,
        channel=NotificationChannel.IN_APP,
        title=title,
        message=message,
    )
    
    # Send email if configured
    if is_email_configured():
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        
        email_template = get_weekly_report_email(
            user_name=user.name or user.email,
            account_name=account_name,
            period=period,
            total_spend=total_spend,
            total_revenue=total_revenue,
            total_roas=total_roas,
            top_campaigns=top_campaigns,
            dashboard_url=dashboard_url
        )
        
        message_obj = EmailMessage(
            to=user.email,
            subject=email_template.subject,
            body_html=email_template.body_html,
            body_text=email_template.body_text,
        )
        
        send_email(message_obj)
        
        create_notification_log(
            db=db,
            user_id=user.id,
            alert_type=AlertType.WEEKLY_REPORT,
            channel=NotificationChannel.EMAIL,
            title=title,
            message=message,
        )
    
    return True
