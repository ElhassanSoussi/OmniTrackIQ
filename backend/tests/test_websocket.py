"""Tests for WebSocket functionality."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.websocket_service import (
    ConnectionManager,
    Channel,
    MessageType,
    notify_metrics_update,
    notify_sync_status,
    notify_anomaly_detected,
    send_notification,
)


class TestConnectionManager:
    """Tests for WebSocket ConnectionManager."""

    def test_connection_manager_singleton(self):
        """Test ConnectionManager is a singleton."""
        manager1 = ConnectionManager()
        manager2 = ConnectionManager()
        assert manager1 is manager2

    def test_get_stats_empty(self):
        """Test stats when no connections."""
        manager = ConnectionManager()
        stats = manager.get_stats()
        assert "total_connections" in stats
        assert "accounts_connected" in stats
        assert "channel_subscriptions" in stats


class TestWebSocketRoutes:
    """Tests for WebSocket HTTP routes."""

    def test_websocket_stats(self, client):
        """Test /ws/stats endpoint."""
        response = client.get("/ws/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_connections" in data
        assert "accounts_connected" in data

    def test_websocket_channels(self, client):
        """Test /ws/channels endpoint."""
        response = client.get("/ws/channels")
        assert response.status_code == 200
        data = response.json()
        assert "channels" in data
        channels = [c["name"] for c in data["channels"]]
        assert "metrics" in channels
        assert "notifications" in channels
        assert "sync_status" in channels
        assert "anomalies" in channels


class TestChannelEnum:
    """Tests for Channel enum."""

    def test_channel_values(self):
        """Test all channel values exist."""
        assert Channel.METRICS.value == "metrics"
        assert Channel.NOTIFICATIONS.value == "notifications"
        assert Channel.SYNC_STATUS.value == "sync_status"
        assert Channel.ANOMALIES.value == "anomalies"


class TestMessageTypeEnum:
    """Tests for MessageType enum."""

    def test_message_type_values(self):
        """Test key message types exist."""
        assert MessageType.SUBSCRIBE.value == "subscribe"
        assert MessageType.UNSUBSCRIBE.value == "unsubscribe"
        assert MessageType.METRICS_UPDATE.value == "metrics_update"
        assert MessageType.NOTIFICATION.value == "notification"
        assert MessageType.ANOMALY_ALERT.value == "anomaly_alert"
