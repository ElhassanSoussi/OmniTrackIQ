"""Tests for notification endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.notification_preference import (
    NotificationPreference,
    NotificationLog,
    NotificationChannel,
    AlertType,
)


@pytest.fixture
def notification_preferences(db: Session, test_user: User) -> NotificationPreference:
    """Create notification preferences for test user."""
    prefs = NotificationPreference(
        id="pref-test-123",
        user_id=test_user.id,
        email_notifications_enabled=True,
        in_app_notifications_enabled=True,
        anomaly_alerts_enabled=True,
        spend_alerts_enabled=True,
        daily_spend_threshold=1000,
        roas_alerts_enabled=True,
        roas_threshold=200,
        weekly_report_enabled=True,
        monthly_report_enabled=False,
    )
    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return prefs


@pytest.fixture
def notification_logs(db: Session, test_user: User) -> list[NotificationLog]:
    """Create sample notification logs."""
    logs = []
    for i in range(5):
        log = NotificationLog(
            id=f"log-{i}",
            user_id=test_user.id,
            alert_type=AlertType.ANOMALY_SPIKE if i % 2 == 0 else AlertType.SPEND_THRESHOLD,
            channel=NotificationChannel.IN_APP,
            title=f"Test Alert {i}",
            message=f"This is test notification {i}",
            read_at=datetime.utcnow() if i < 2 else None,
            sent_at=datetime.utcnow(),
        )
        db.add(log)
        logs.append(log)
    db.commit()
    return logs


class TestGetPreferences:
    """Tests for GET /notifications/preferences endpoint."""

    def test_get_preferences(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_preferences: NotificationPreference,
    ):
        """Test getting notification preferences."""
        response = client.get("/notifications/preferences", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["email_notifications_enabled"] == True
        assert data["in_app_notifications_enabled"] == True
        assert data["anomaly_alerts_enabled"] == True

    def test_get_preferences_creates_default(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that getting preferences creates defaults if none exist."""
        response = client.get("/notifications/preferences", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should have default values
        assert "email_notifications_enabled" in data
        assert "in_app_notifications_enabled" in data

    def test_get_preferences_unauthenticated(self, client: TestClient):
        """Test preferences endpoint requires auth."""
        response = client.get("/notifications/preferences")
        assert response.status_code == 401


class TestUpdatePreferences:
    """Tests for PATCH /notifications/preferences endpoint."""

    def test_update_preferences(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_preferences: NotificationPreference,
    ):
        """Test updating notification preferences."""
        response = client.patch(
            "/notifications/preferences",
            headers=auth_headers,
            json={
                "email_notifications_enabled": False,
                "daily_spend_threshold": 5000,
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["email_notifications_enabled"] == False
        assert data["daily_spend_threshold"] == 5000
        # Unchanged fields should remain
        assert data["in_app_notifications_enabled"] == True

    def test_update_partial(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test partial update only changes specified fields."""
        # First, get current values
        response = client.get("/notifications/preferences", headers=auth_headers)
        original = response.json()
        
        # Update only one field
        response = client.patch(
            "/notifications/preferences",
            headers=auth_headers,
            json={"weekly_report_enabled": False},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["weekly_report_enabled"] == False


class TestGetNotifications:
    """Tests for GET /notifications endpoint."""

    def test_get_notifications(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_logs: list[NotificationLog],
    ):
        """Test getting notifications list."""
        response = client.get("/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert "unread_count" in data
        assert len(data["items"]) == 5
        # 3 unread (i >= 2)
        assert data["unread_count"] == 3

    def test_get_notifications_unread_only(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_logs: list[NotificationLog],
    ):
        """Test filtering to unread only."""
        response = client.get(
            "/notifications",
            headers=auth_headers,
            params={"unread_only": True},
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should only have unread notifications
        assert all(item.get("read_at") is None for item in data["items"])

    def test_get_notifications_pagination(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_logs: list[NotificationLog],
    ):
        """Test notifications pagination."""
        response = client.get(
            "/notifications",
            headers=auth_headers,
            params={"limit": 2, "offset": 0},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["items"]) <= 2


class TestMarkAsRead:
    """Tests for marking notifications as read."""

    def test_mark_as_read(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_logs: list[NotificationLog],
    ):
        """Test marking specific notifications as read."""
        # Get unread notification IDs
        unread_ids = [log.id for log in notification_logs if log.read_at is None]
        
        response = client.post(
            "/notifications/read",
            headers=auth_headers,
            json={"notification_ids": unread_ids[:1]},
        )
        assert response.status_code == 200

    def test_mark_all_as_read(
        self,
        client: TestClient,
        auth_headers: dict,
        notification_logs: list[NotificationLog],
    ):
        """Test marking all notifications as read."""
        response = client.post(
            "/notifications/read",
            headers=auth_headers,
            json={"mark_all": True},
        )
        assert response.status_code == 200


class TestNotificationStatus:
    """Tests for notification status endpoints."""

    def test_get_status(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test getting notification status summary."""
        response = client.get("/notifications/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "email_configured" in data
        assert "channels_available" in data
        assert "in_app" in data["channels_available"]
