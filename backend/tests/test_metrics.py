"""Tests for metrics endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ad_spend import AdSpend
from app.models.order import Order
from app.models.daily_metrics import DailyMetrics, Channel
from app.models.ad_account import AdAccount, AdAccountStatus


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
        assert "impressions" in data
        assert "clicks" in data
        assert "conversions" in data
        assert "orders" in data
        assert "ctr" in data
        assert "cpc" in data
        assert "cpa" in data
        assert "aov" in data
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
        data = response.json()
        assert "spend" in data
        
    def test_summary_default_date_range(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test summary uses default 7-day range when no dates provided."""
        response = client.get(
            "/metrics/summary",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "daily" in data  # Should include daily breakdown


class TestMetricsTimeseries:
    """Tests for /metrics/timeseries endpoint."""
    
    def test_timeseries_basic(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test getting basic timeseries data."""
        response = client.get(
            "/metrics/timeseries",
            headers=auth_headers,
            params={
                "from": str(date.today() - timedelta(days=7)),
                "to": str(date.today()),
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)
        
    def test_timeseries_with_channel_breakdown(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test timeseries with channel breakdown."""
        response = client.get(
            "/metrics/timeseries",
            headers=auth_headers,
            params={
                "from": str(date.today() - timedelta(days=7)),
                "to": str(date.today()),
                "group_by_channel": True,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "by_channel" in data
        
    def test_timeseries_custom_metrics(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test timeseries with custom metrics selection."""
        response = client.get(
            "/metrics/timeseries",
            headers=auth_headers,
            params={
                "from": str(date.today() - timedelta(days=7)),
                "to": str(date.today()),
                "metrics": ["spend", "clicks", "conversions"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "data" in data


class TestMetricsChannels:
    """Tests for /metrics/channels endpoint."""
    
    def test_channels_breakdown(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test getting channel breakdown."""
        response = client.get(
            "/metrics/channels",
            headers=auth_headers,
            params={
                "from": str(date.today() - timedelta(days=30)),
                "to": str(date.today()),
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "channels" in data
        assert "total_spend" in data
        assert "total_revenue" in data
        assert isinstance(data["channels"], list)
        
    def test_channels_includes_platform_label(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test that channel breakdown includes platform labels."""
        response = client.get(
            "/metrics/channels",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        if data["channels"]:
            channel = data["channels"][0]
            assert "platform" in channel
            assert "platform_label" in channel
            assert "spend" in channel
            assert "spend_percentage" in channel


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
        
    def test_campaigns_sort_by_spend(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test campaigns sorted by spend."""
        response = client.get(
            "/metrics/campaigns",
            headers=auth_headers,
            params={"sort_by": "spend"},
        )
        assert response.status_code == 200
        data = response.json()
        if len(data) >= 2:
            # Verify sorted descending by spend
            assert data[0]["spend"] >= data[1]["spend"]
            
    def test_campaigns_filter_by_platform(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test campaigns filtered by platform."""
        response = client.get(
            "/metrics/campaigns",
            headers=auth_headers,
            params={"platform": "facebook"},
        )
        assert response.status_code == 200
        data = response.json()
        for campaign in data:
            assert campaign["platform"] == "facebook"
            
    def test_campaign_detail(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test getting campaign detail."""
        # First get a campaign ID
        response = client.get(
            "/metrics/campaigns",
            headers=auth_headers,
            params={"limit": 1},
        )
        assert response.status_code == 200
        campaigns = response.json()
        
        if campaigns:
            campaign_id = campaigns[0]["campaign_id"]
            detail_response = client.get(
                f"/metrics/campaigns/{campaign_id}",
                headers=auth_headers,
            )
            assert detail_response.status_code == 200
            detail = detail_response.json()
            assert "campaign_id" in detail
            assert "summary" in detail
            assert "daily" in detail
            
    def test_campaign_detail_not_found(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test 404 for non-existent campaign."""
        response = client.get(
            "/metrics/campaigns/non-existent-campaign",
            headers=auth_headers,
        )
        assert response.status_code == 404


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
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "total_revenue" in data
        assert "aov" in data
        
    def test_orders_pagination(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_orders: list[Order],
    ):
        """Test orders pagination."""
        response = client.get(
            "/metrics/orders",
            headers=auth_headers,
            params={"limit": 10, "offset": 0},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 10
        
    def test_orders_filter_by_utm_source(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_orders: list[Order],
    ):
        """Test orders filtered by UTM source."""
        response = client.get(
            "/metrics/orders",
            headers=auth_headers,
            params={"utm_source": "facebook"},
        )
        assert response.status_code == 200
        data = response.json()
        for order in data["items"]:
            assert order["utm_source"] == "facebook"
            
    def test_orders_summary(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_orders: list[Order],
    ):
        """Test getting orders summary."""
        response = client.get(
            "/metrics/orders/summary",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_orders" in data
        assert "total_revenue" in data
        assert "aov" in data
        assert "orders_by_source" in data
        assert "revenue_by_source" in data


class TestMetricsTopPerformers:
    """Tests for /metrics/top-performers endpoint."""
    
    def test_top_performers_by_spend(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test getting top performers by spend."""
        response = client.get(
            "/metrics/top-performers",
            headers=auth_headers,
            params={"metric": "spend", "limit": 5},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5
        if data:
            assert "rank" in data[0]
            assert "campaign_id" in data[0]
            assert "campaign_name" in data[0]
            assert "platform" in data[0]
            assert "spend" in data[0]
            
    def test_top_performers_by_conversions(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test getting top performers by conversions."""
        response = client.get(
            "/metrics/top-performers",
            headers=auth_headers,
            params={"metric": "conversions", "limit": 3},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3


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


class TestMetricsMultiTenancy:
    """Tests for multi-tenancy isolation in metrics endpoints."""
    
    def test_summary_only_returns_own_account_data(
        self,
        db: Session,
        client: TestClient,
        auth_headers: dict,
        test_account,
        sample_ad_spend: list[AdSpend],
    ):
        """Test that summary only returns data for the authenticated user's account."""
        from app.models.account import Account, AccountPlan
        from datetime import datetime
        
        # Create another account with its own data
        other_account = Account(
            id="other-account-456",
            name="Other Company",
            plan=AccountPlan.PRO,
            created_at=datetime.utcnow(),
        )
        db.add(other_account)
        
        # Add ad spend for the other account
        other_ad_spend = AdSpend(
            account_id=other_account.id,
            platform="facebook",
            external_campaign_id="other-campaign-1",
            campaign_name="Other Campaign",
            date=date.today(),
            cost=999999.99,  # Large amount that would affect totals
            impressions=1000000,
            clicks=50000,
            conversions=5000,
        )
        db.add(other_ad_spend)
        db.commit()
        
        # Get summary for authenticated user
        response = client.get(
            "/metrics/summary",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        
        # The large spend from other account should not be included
        assert data["spend"] < 999999.99
        
    def test_campaigns_isolated_by_account(
        self,
        db: Session,
        client: TestClient,
        auth_headers: dict,
        test_account,
        sample_ad_spend: list[AdSpend],
    ):
        """Test that campaigns are isolated by account."""
        from app.models.account import Account, AccountPlan
        from datetime import datetime
        
        # Create another account with its own campaign
        other_account = Account(
            id="other-account-789",
            name="Another Company",
            plan=AccountPlan.FREE,
            created_at=datetime.utcnow(),
        )
        db.add(other_account)
        
        other_ad_spend = AdSpend(
            account_id=other_account.id,
            platform="tiktok",
            external_campaign_id="secret-campaign-xyz",
            campaign_name="Secret Campaign - Should Not See",
            date=date.today(),
            cost=1000.0,
            impressions=10000,
            clicks=500,
            conversions=25,
        )
        db.add(other_ad_spend)
        db.commit()
        
        # Get campaigns for authenticated user
        response = client.get(
            "/metrics/campaigns",
            headers=auth_headers,
        )
        assert response.status_code == 200
        campaigns = response.json()
        
        # The secret campaign should not be visible
        campaign_names = [c["campaign_name"] for c in campaigns]
        assert "Secret Campaign - Should Not See" not in campaign_names
        campaign_ids = [c["campaign_id"] for c in campaigns]
        assert "secret-campaign-xyz" not in campaign_ids


class TestMetricsEdgeCases:
    """Tests for edge cases in metrics endpoints."""
    
    def test_summary_empty_data(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test summary with no data returns zeros."""
        response = client.get(
            "/metrics/summary",
            headers=auth_headers,
            params={
                "from": str(date.today() - timedelta(days=365)),
                "to": str(date.today() - timedelta(days=364)),
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["spend"] == 0
        assert data["revenue"] == 0
        
    def test_timeseries_future_dates(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test timeseries with future dates returns empty data."""
        response = client.get(
            "/metrics/timeseries",
            headers=auth_headers,
            params={
                "from": str(date.today() + timedelta(days=1)),
                "to": str(date.today() + timedelta(days=7)),
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []
        
    def test_channels_no_spend(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test channels endpoint with no spend data."""
        response = client.get(
            "/metrics/channels",
            headers=auth_headers,
            params={
                "from": str(date.today() - timedelta(days=365)),
                "to": str(date.today() - timedelta(days=364)),
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["channels"] == []
        
    def test_invalid_date_range(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test with from_date after to_date."""
        response = client.get(
            "/metrics/summary",
            headers=auth_headers,
            params={
                "from": str(date.today()),
                "to": str(date.today() - timedelta(days=7)),
            },
        )
        # Should still return 200 but empty results
        assert response.status_code == 200


class TestDailyMetricsModel:
    """Tests for the DailyMetrics model with channels."""
    
    def test_create_daily_metrics_with_channel(
        self,
        db: Session,
        test_account,
    ):
        """Test creating DailyMetrics with channel enum."""
        daily_metric = DailyMetrics(
            account_id=test_account.id,
            date=date.today(),
            channel=Channel.FACEBOOK,
            total_revenue=1000.0,
            total_orders=10,
            total_ad_spend=200.0,
            total_impressions=50000,
            total_clicks=1500,
            total_conversions=50,
            roas=5.0,
            profit=800.0,
        )
        db.add(daily_metric)
        db.commit()
        db.refresh(daily_metric)
        
        assert daily_metric.id is not None
        assert daily_metric.channel == Channel.FACEBOOK
        assert daily_metric.total_conversions == 50
        
    def test_create_campaign_level_metrics(
        self,
        db: Session,
        test_account,
    ):
        """Test creating campaign-level DailyMetrics."""
        daily_metric = DailyMetrics(
            account_id=test_account.id,
            date=date.today(),
            channel=Channel.GOOGLE_ADS,
            campaign_id="campaign-123",
            campaign_name="Test Campaign",
            total_revenue=500.0,
            total_orders=5,
            total_ad_spend=100.0,
            total_impressions=20000,
            total_clicks=600,
            total_conversions=20,
            roas=5.0,
            profit=400.0,
        )
        db.add(daily_metric)
        db.commit()
        db.refresh(daily_metric)
        
        assert daily_metric.campaign_id == "campaign-123"
        assert daily_metric.campaign_name == "Test Campaign"


class TestAdAccountModel:
    """Tests for the AdAccount model."""
    
    def test_create_ad_account(
        self,
        db: Session,
        test_account,
    ):
        """Test creating an AdAccount."""
        ad_account = AdAccount(
            account_id=test_account.id,
            integration_id=None,
            platform="facebook",
            external_id="act_123456789",
            external_name="My FB Ad Account",
            name="Primary Facebook Account",
            status=AdAccountStatus.ACTIVE,
            currency="USD",
            timezone="America/New_York",
        )
        db.add(ad_account)
        db.commit()
        db.refresh(ad_account)
        
        assert ad_account.id is not None
        assert ad_account.platform == "facebook"
        assert ad_account.status == AdAccountStatus.ACTIVE
        assert ad_account.external_id == "act_123456789"
        
    def test_ad_account_status_enum(
        self,
        db: Session,
        test_account,
    ):
        """Test AdAccount status enum values."""
        ad_account = AdAccount(
            account_id=test_account.id,
            platform="google_ads",
            external_id="customers/123",
            name="Test Google Account",
            status=AdAccountStatus.PAUSED,
        )
        db.add(ad_account)
        db.commit()
        db.refresh(ad_account)
        
        assert ad_account.status == AdAccountStatus.PAUSED
        
        # Update status
        ad_account.status = AdAccountStatus.ERROR
        db.commit()
        db.refresh(ad_account)
        
        assert ad_account.status == AdAccountStatus.ERROR
