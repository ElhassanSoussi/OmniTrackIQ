"""Tests for anomaly detection endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient

from app.models.ad_spend import AdSpend
from app.models.order import Order


class TestAnomalyEndpoints:
    """Tests for /anomalies endpoints."""

    def test_anomaly_detection(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
        sample_orders: list[Order],
    ):
        """Test anomaly detection endpoint."""
        response = client.get(
            "/anomalies",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "anomalies" in data
        assert "summary" in data
        assert "sensitivity" in data
        assert "metrics_analyzed" in data
        assert isinstance(data["anomalies"], list)
        
        # Check summary structure
        summary = data["summary"]
        assert "total_anomalies" in summary
        assert "by_severity" in summary
        assert "by_metric" in summary

    def test_anomaly_detection_with_sensitivity(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test anomaly detection with different sensitivity levels."""
        for sensitivity in ["low", "medium", "high"]:
            response = client.get(
                "/anomalies",
                headers=auth_headers,
                params={"sensitivity": sensitivity},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["sensitivity"] == sensitivity

    def test_anomaly_detection_with_metrics_filter(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test anomaly detection with specific metrics."""
        response = client.get(
            "/anomalies",
            headers=auth_headers,
            params={"metrics": ["spend", "revenue"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert set(data["metrics_analyzed"]).issubset({"spend", "revenue"})

    def test_anomaly_metadata(self, client: TestClient, auth_headers: dict):
        """Test anomaly metadata endpoint."""
        response = client.get(
            "/anomalies/metadata",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "metrics" in data
        assert "severity_levels" in data
        assert "anomaly_types" in data
        assert "sensitivity_levels" in data

    def test_anomaly_trends(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test anomaly trends endpoint."""
        response = client.get(
            "/anomalies/trends",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "timeline" in data
        assert "total_days_with_anomalies" in data
        assert "date_range" in data

    def test_metric_health(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
        sample_orders: list[Order],
    ):
        """Test metric health endpoint."""
        response = client.get(
            "/anomalies/health",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "metrics" in data
        assert "overall_health" in data
        assert "date_range" in data
        
        # Check metric health structure
        if data["metrics"]:
            metric = data["metrics"][0]
            assert "metric" in metric
            assert "label" in metric
            assert "status" in metric
            assert "change_percent" in metric

    def test_anomaly_with_platform_filter(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test anomaly detection with platform filter."""
        response = client.get(
            "/anomalies",
            headers=auth_headers,
            params={"platform": "facebook"},
        )
        assert response.status_code == 200

    def test_anomaly_unauthenticated(self, client: TestClient):
        """Test anomaly endpoint requires authentication."""
        response = client.get("/anomalies")
        assert response.status_code == 401
