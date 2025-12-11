"""Tests for integration endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.integration import Integration
from app.models.account import Account


@pytest.fixture
def connected_integration(db: Session, test_account: Account) -> Integration:
    """Create a connected integration."""
    integration = Integration(
        id="int-test-123",
        account_id=test_account.id,
        platform="facebook",
        status="connected",
        access_token="test_token_encrypted",
        refresh_token="test_refresh_encrypted",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(integration)
    db.commit()
    db.refresh(integration)
    return integration


class TestListIntegrations:
    """Tests for GET /integrations endpoint."""

    def test_list_integrations(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test listing integrations."""
        response = client.get("/integrations/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_list_with_connected_integration(
        self,
        client: TestClient,
        auth_headers: dict,
        connected_integration: Integration,
    ):
        """Test listing integrations with one connected."""
        response = client.get("/integrations/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Find our connected integration
        fb_integrations = [i for i in data if i["platform"] == "facebook"]
        assert len(fb_integrations) >= 1
        assert fb_integrations[0]["status"] == "connected"

    def test_list_integrations_unauthenticated(self, client: TestClient):
        """Test that listing integrations requires auth."""
        response = client.get("/integrations/")
        assert response.status_code == 401


class TestConnectUrl:
    """Tests for GET /integrations/{platform}/connect-url endpoint."""

    def test_get_connect_url_unconfigured(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test getting connect URL for unconfigured platform."""
        response = client.get(
            "/integrations/facebook/connect-url",
            headers=auth_headers,
        )
        # Should return 501 since OAuth not configured in tests
        assert response.status_code == 501
        data = response.json()
        assert "coming soon" in data["detail"].lower() or "not configured" in data["detail"].lower()

    def test_get_connect_url_invalid_platform(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test getting connect URL for invalid platform."""
        response = client.get(
            "/integrations/invalid_platform/connect-url",
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_connect_url_unauthenticated(self, client: TestClient):
        """Test connect URL requires authentication."""
        response = client.get("/integrations/facebook/connect-url")
        assert response.status_code == 401


class TestOAuthCallback:
    """Tests for GET /integrations/{platform}/callback endpoint."""

    def test_callback_with_error(self, client: TestClient):
        """Test OAuth callback with error parameter."""
        response = client.get(
            "/integrations/facebook/callback",
            params={
                "code": "test_code",
                "state": "test-account-123:facebook",
                "error": "access_denied",
                "error_description": "User cancelled",
            },
            follow_redirects=False,
        )
        # Should redirect back to frontend with error
        assert response.status_code in [302, 307]
        location = response.headers.get("location", "")
        assert "error" in location

    def test_callback_invalid_state(self, client: TestClient):
        """Test OAuth callback with invalid state."""
        response = client.get(
            "/integrations/facebook/callback",
            params={
                "code": "test_code",
                "state": "invalid_state_format",
            },
            follow_redirects=False,
        )
        # Should fail or redirect with error
        assert response.status_code in [302, 307, 400]


class TestDisconnect:
    """Tests for DELETE /integrations/{platform} endpoint."""

    def test_disconnect_integration(
        self,
        client: TestClient,
        auth_headers: dict,
        connected_integration: Integration,
    ):
        """Test disconnecting an integration."""
        response = client.delete(
            "/integrations/facebook",
            headers=auth_headers,
        )
        assert response.status_code in [200, 204]

    def test_disconnect_not_connected(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test disconnecting when not connected."""
        response = client.delete(
            "/integrations/google_ads",
            headers=auth_headers,
        )
        # Should return 404 or 200 (idempotent)
        assert response.status_code in [200, 204, 404]

    def test_disconnect_unauthenticated(self, client: TestClient):
        """Test disconnect requires authentication."""
        response = client.delete("/integrations/facebook")
        assert response.status_code == 401


class TestIntegrationStatus:
    """Tests for integration status and sync."""

    def test_integration_has_status(
        self,
        client: TestClient,
        auth_headers: dict,
        connected_integration: Integration,
    ):
        """Test that integration response includes status."""
        response = client.get("/integrations/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        for integration in data:
            assert "status" in integration
            assert "platform" in integration

    def test_integration_has_last_synced(
        self,
        client: TestClient,
        auth_headers: dict,
        connected_integration: Integration,
    ):
        """Test that connected integrations have sync timestamp."""
        response = client.get("/integrations/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        fb = next((i for i in data if i["platform"] == "facebook"), None)
        assert fb is not None
        # last_synced_at should be present (may be null if never synced)
        assert "last_synced_at" in fb
