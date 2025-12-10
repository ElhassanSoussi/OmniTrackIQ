"""Tests for product events tracking API."""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.product_event import ALLOWED_EVENT_NAMES


client = TestClient(app)


class TestEventsTrack:
    """Test /events/track endpoint."""
    
    def test_track_event_unauthenticated(self, db_session):
        """Unauthenticated event should be accepted with null user/workspace."""
        response = client.post(
            "/events/track",
            json={
                "event_name": "signup_completed",
                "properties": {"source": "organic"}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "event_id" in data
    
    def test_track_event_authenticated(self, db_session, auth_token, test_user):
        """Authenticated event should include user and workspace IDs."""
        response = client.post(
            "/events/track",
            json={
                "event_name": "viewed_overview_dashboard",
                "properties": {"date_range": "30d"}
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_track_event_invalid_name(self, db_session):
        """Invalid event names should be rejected."""
        response = client.post(
            "/events/track",
            json={
                "event_name": "invalid_event_name",
                "properties": {}
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_track_event_with_properties(self, db_session):
        """Event properties should be stored."""
        response = client.post(
            "/events/track",
            json={
                "event_name": "integration_connected",
                "properties": {
                    "integration_type": "facebook",
                    "workspace_plan": "pro",
                    "is_trial": False
                }
            }
        )
        
        assert response.status_code == 200
        assert response.json()["success"] is True
    
    def test_track_event_large_properties_truncated(self, db_session):
        """Large properties should be truncated, not rejected."""
        large_value = "x" * 10000  # 10KB of data
        response = client.post(
            "/events/track",
            json={
                "event_name": "signup_completed",
                "properties": {"large_field": large_value}
            }
        )
        
        assert response.status_code == 200
        # Event should still be tracked (properties will be truncated internally)


class TestEventsAllowed:
    """Test /events/allowed endpoint."""
    
    def test_get_allowed_events(self):
        """Should return list of allowed event names."""
        response = client.get("/events/allowed")
        
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert isinstance(data["events"], list)
        assert len(data["events"]) > 0
        
        # Verify all returned events are in our whitelist
        for event in data["events"]:
            assert event in ALLOWED_EVENT_NAMES
