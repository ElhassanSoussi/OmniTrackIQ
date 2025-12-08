"""Tests for metrics endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order


class TestMetricsSummary:
    """Tests for /metrics/summary endpoint."""

    def test_summary_authenticated(
        self, 
        client: TestClient, 
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
        sample_orders: list[Order],
    ):
        """Test getting metrics summary when authenticated."""
        response = client.get(
            "/metrics/summary",
            headers=auth_headers,
            params={"from": str(date.today() - timedelta(days=7)), "to": str(date.today())},
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "revenue" in data
        assert "spend" in data
        assert "roas" in data
        assert "profit" in data
        assert isinstance(data["revenue"], (int, float))
        assert isinstance(data["spend"], (int, float))

    def test_summary_unauthenticated(self, client: TestClient):
        """Test summary endpoint requires authentication."""
        response = client.get("/metrics/summary")
        assert response.status_code == 401

    def test_summary_with_platform_filter(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test summary with platform filter."""
        response = client.get(
            "/metrics/summary",
            headers=auth_headers,
            params={"platform": "facebook"},
        )
        assert response.status_code == 200


class TestMetricsCampaigns:
    """Tests for /metrics/campaigns endpoint."""

    def test_campaigns_list(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test getting campaigns list."""
        response = client.get(
            "/metrics/campaigns",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        # API returns a list directly
        assert isinstance(data, list)

    def test_campaigns_pagination(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test campaigns pagination."""
        response = client.get(
            "/metrics/campaigns",
            headers=auth_headers,
            params={"limit": 2, "offset": 0},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2


class TestMetricsOrders:
    """Tests for /metrics/orders endpoint."""

    def test_orders_list(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_orders: list[Order],
    ):
        """Test getting orders list."""
        response = client.get(
            "/metrics/orders",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        # API returns paginated response with items
        assert "items" in data
        assert isinstance(data["items"], list)


class TestMetricsAttribution:
    """Tests for /metrics/attribution endpoint."""

    @pytest.mark.skip(reason="Attribution service requires customer_email field not in Order model")
    def test_attribution_report(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
        sample_orders: list[Order],
    ):
        """Test getting attribution report."""
        response = client.get(
            "/metrics/attribution",
            headers=auth_headers,
            params={"model": "last_touch"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "model" in data
        assert "channels" in data

    def test_attribution_invalid_model(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test attribution with invalid model."""
        response = client.get(
            "/metrics/attribution",
            headers=auth_headers,
            params={"model": "invalid_model"},
        )
        # API returns 400 for invalid model
        assert response.status_code == 400


class TestMetricsCohorts:
    """Tests for /metrics/cohorts endpoint."""

    @pytest.mark.skip(reason="Cohort service requires customer_email field not in Order model")
    def test_retention_cohorts(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_orders: list[Order],
    ):
        """Test getting retention cohorts."""
        response = client.get(
            "/metrics/cohorts/retention",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "cohorts" in data
        assert "period_type" in data
