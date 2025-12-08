"""Tests for funnel endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient

from app.models.ad_spend import AdSpend
from app.models.order import Order


class TestFunnelEndpoints:
    """Tests for /funnel endpoints."""

    def test_funnel_data(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
        sample_orders: list[Order],
    ):
        """Test getting funnel data."""
        response = client.get(
            "/funnel",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "stages" in data
        assert "summary" in data
        assert "date_range" in data
        assert isinstance(data["stages"], list)
        assert len(data["stages"]) > 0
        
        # Check stage structure
        stage = data["stages"][0]
        assert "id" in stage
        assert "name" in stage
        assert "value" in stage
        assert "percentage" in stage
        assert "drop_off" in stage

    def test_funnel_metadata(self, client: TestClient, auth_headers: dict):
        """Test getting funnel metadata."""
        response = client.get(
            "/funnel/metadata",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "default_stages" in data
        assert "compare_options" in data
        assert "granularity_options" in data

    def test_funnel_comparison_by_platform(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test funnel comparison by platform."""
        response = client.get(
            "/funnel/comparison",
            headers=auth_headers,
            params={"compare_by": "platform"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "compare_by" in data
        assert data["compare_by"] == "platform"
        assert "comparisons" in data

    def test_funnel_comparison_by_time(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test funnel comparison by time period."""
        response = client.get(
            "/funnel/comparison",
            headers=auth_headers,
            params={"compare_by": "time_period"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "compare_by" in data
        assert "current_period" in data
        assert "previous_period" in data

    def test_funnel_trends(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test funnel trends endpoint."""
        response = client.get(
            "/funnel/trends",
            headers=auth_headers,
            params={"granularity": "daily"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "granularity" in data
        assert "trends" in data
        assert isinstance(data["trends"], list)

    def test_funnel_with_platform_filter(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test funnel with platform filter."""
        response = client.get(
            "/funnel",
            headers=auth_headers,
            params={"platform": "facebook"},
        )
        assert response.status_code == 200

    def test_funnel_unauthenticated(self, client: TestClient):
        """Test funnel endpoint requires authentication."""
        response = client.get("/funnel")
        assert response.status_code == 401
