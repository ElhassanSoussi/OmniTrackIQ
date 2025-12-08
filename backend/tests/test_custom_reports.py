"""Tests for custom reports endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.custom_report import CustomReport
from app.models.user import User


@pytest.fixture
def sample_report(db: Session, test_user: User) -> CustomReport:
    """Create a sample custom report."""
    import json
    report = CustomReport(
        account_id=test_user.account_id,
        user_id=test_user.id,
        name="Test Report",
        description="A test report",
        config_json=json.dumps({
            "metrics": ["revenue", "spend"],
            "dimensions": ["platform"],
            "date_range": "30d",
            "filters": [],
            "compare_previous_period": False,
        }),
        visualization_type="table",
        is_shared=False,
        is_favorite=False,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


class TestCustomReportsCRUD:
    """Tests for custom reports CRUD operations."""

    def test_list_reports(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_report: CustomReport,
    ):
        """Test listing custom reports."""
        response = client.get(
            "/custom-reports",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        # API returns paginated response with items
        assert "items" in data
        assert len(data["items"]) >= 1

    def test_create_report(self, client: TestClient, auth_headers: dict):
        """Test creating a custom report."""
        response = client.post(
            "/custom-reports",
            headers=auth_headers,
            json={
                "name": "New Report",
                "description": "A new report",
                "config": {
                    "metrics": ["revenue"],
                    "dimensions": ["date"],
                    "date_range": "7d",
                    "filters": [],
                    "compare_previous_period": False,
                },
                "visualization_type": "line_chart",
                "is_shared": False,
                "is_favorite": False,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Report"
        assert "id" in data

    def test_get_report(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_report: CustomReport,
    ):
        """Test getting a single report."""
        response = client.get(
            f"/custom-reports/{sample_report.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == sample_report.name

    def test_update_report(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_report: CustomReport,
    ):
        """Test updating a report."""
        import json
        config = json.loads(sample_report.config_json)
        response = client.put(
            f"/custom-reports/{sample_report.id}",
            headers=auth_headers,
            json={
                "name": "Updated Report Name",
                "description": "Updated description",
                "config": config,
                "visualization_type": "bar_chart",
                "is_shared": True,
                "is_favorite": True,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Report Name"
        assert data["is_shared"] == True

    def test_delete_report(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_report: CustomReport,
    ):
        """Test deleting a report."""
        response = client.delete(
            f"/custom-reports/{sample_report.id}",
            headers=auth_headers,
        )
        assert response.status_code == 204
        
        # Verify it's deleted
        response = client.get(
            f"/custom-reports/{sample_report.id}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_duplicate_report(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_report: CustomReport,
    ):
        """Test duplicating a report."""
        response = client.post(
            f"/custom-reports/{sample_report.id}/duplicate",
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert "Copy" in data["name"]
        assert data["id"] != sample_report.id


class TestCustomReportsMetadata:
    """Tests for custom reports metadata endpoint."""

    def test_get_metadata(self, client: TestClient, auth_headers: dict):
        """Test getting reports metadata."""
        response = client.get(
            "/custom-reports/metadata",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "metrics" in data
        assert "dimensions" in data
        
        # Check metrics have labels
        assert len(data["metrics"]) > 0
        metric = data["metrics"][0]
        assert "id" in metric
        assert "label" in metric


class TestCustomReportsExecution:
    """Tests for custom reports execution."""

    def test_run_report(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_report: CustomReport,
    ):
        """Test running a report."""
        response = client.post(
            f"/custom-reports/{sample_report.id}/run",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "data" in data
        assert "summary" in data

    def test_preview_report(self, client: TestClient, auth_headers: dict):
        """Test previewing a report without saving."""
        response = client.post(
            "/custom-reports/preview",
            headers=auth_headers,
            json={
                "metrics": ["revenue", "spend"],
                "dimensions": ["platform"],
                "date_range": "7d",
                "filters": [],
                "compare_previous_period": False,
            },
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "data" in data
        assert "summary" in data
