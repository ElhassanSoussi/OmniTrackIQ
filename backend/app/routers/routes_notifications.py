"""
Notification preference and alert endpoints.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.user import User
from app.routers.deps import get_current_user, get_db
from app.schemas.notification import (
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
    NotificationLogList,
    NotificationLogResponse,
    MarkNotificationsReadRequest,
)
from app.services import notification_service
from app.services.email_service import is_email_configured

router = APIRouter()


@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_notification_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's notification preferences."""
    prefs = notification_service.get_or_create_preferences(db, current_user.id)
    return prefs


@router.patch("/preferences", response_model=NotificationPreferenceResponse)
def update_notification_preferences(
    body: NotificationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's notification preferences."""
    updates = body.model_dump(exclude_unset=True)
    prefs = notification_service.update_preferences(db, current_user.id, updates)
    return prefs


@router.get("", response_model=NotificationLogList)
def get_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's notifications."""
    items, total, unread_count = notification_service.get_notifications(
        db, current_user.id, limit, offset, unread_only
    )
    return NotificationLogList(
        items=[NotificationLogResponse.model_validate(item) for item in items],
        total=total,
        unread_count=unread_count
    )


@router.post("/read")
def mark_notifications_read(
    body: MarkNotificationsReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark notifications as read."""
    count = notification_service.mark_notifications_read(
        db, current_user.id, body.notification_ids
    )
    return {"marked_read": count}


@router.get("/status")
def get_notification_status(
    current_user: User = Depends(get_current_user)
):
    """Get notification system status."""
    return {
        "email_configured": is_email_configured(),
        "channels_available": ["in_app"] + (["email"] if is_email_configured() else [])
    }
