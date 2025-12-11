"""Tests for product events tracking API."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.product_event import ALLOWED_EVENT_NAMES


class TestEventsTrack:
    """Test /events/track endpoint."""
    
    def test_track_event_unauthenticated(self, client: TestClient, db: Session):
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
    
    def test_track_event_authenticated(
        self,
        client: TestClient,
        db: Session,
        auth_headers: dict,
        test_user,
    ):
        """Authenticated event should include user and workspace IDs."""
        response = client.post(
            "/events/track",
            json={
                "event_name": "viewed_overview_dashboard",
                "properties": {"date_range": "30d"}
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_track_event_invalid_name(self, client: TestClient, db: Session):
        """Invalid event names should be rejected."""
        response = client.post(
            "/events/track",
            json={
                "event_name": "invalid_event_name",
                "properties": {}
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_track_event_with_properties(self, client: TestClient, db: Session):
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
    
    def test_track_event_large_properties_truncated(self, client: TestClient, db: Session):
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
    
    def test_get_allowed_events(self, client: TestClient):
        """Should return list of allowed event names."""
        response = client.get("/events/allowed")
        
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert isinstance(data["events"], list)
        assert len(data["events"]) > 0
        # Check a known event is in the list
        assert "signup_completed" in data["events"]
