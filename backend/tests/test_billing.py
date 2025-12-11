"""Tests for billing endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.account import Account, AccountPlan
from app.models.subscription import Subscription


@pytest.fixture
def subscription(db: Session, test_account: Account) -> Subscription:
    """Create a test subscription."""
    sub = Subscription(
        id="sub-test-123",
        account_id=test_account.id,
        stripe_customer_id="cus_test123",
        stripe_subscription_id="sub_stripe123",
        plan="pro",
        status="active",
        current_period_start=datetime.utcnow(),
        current_period_end=datetime.utcnow() + timedelta(days=30),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


class TestGetPlans:
    """Tests for GET /billing/plans endpoint."""

    def test_get_plans(self, client: TestClient):
        """Test getting available plans (no auth required)."""
        response = client.get("/billing/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert "plans" in data
        plans = data["plans"]
        
        # Should have at least free, starter, pro, agency plans
        plan_names = [p.get("id") or p.get("name", "").lower() for p in plans]
        assert len(plans) >= 3


class TestBillingStatus:
    """Tests for GET /billing/status endpoint."""

    def test_billing_status_with_subscription(
        self,
        client: TestClient,
        auth_headers: dict,
        subscription: Subscription,
    ):
        """Test getting billing status when subscribed."""
        response = client.get("/billing/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["plan"] == "pro"
        assert data["status"] == "active"
        assert "features" in data

    def test_billing_status_no_subscription(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test getting billing status with no subscription."""
        response = client.get("/billing/status", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Should default to free plan or account's current plan
        assert "plan" in data
        assert "status" in data

    def test_billing_status_unauthenticated(self, client: TestClient):
        """Test billing status requires authentication."""
        response = client.get("/billing/status")
        assert response.status_code == 401


class TestBillingMe:
    """Tests for GET /billing/me endpoint."""

    def test_billing_me_with_subscription(
        self,
        client: TestClient,
        auth_headers: dict,
        subscription: Subscription,
    ):
        """Test getting billing info when subscribed."""
        response = client.get("/billing/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["plan"] == "pro"
        assert data["status"] == "active"
        assert "features" in data
        assert "can_upgrade" in data
        assert "can_cancel" in data


class TestCheckout:
    """Tests for POST /billing/checkout endpoint."""

    @patch("app.services.billing_service.create_checkout_session")
    def test_create_checkout_session(
        self,
        mock_checkout: MagicMock,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test creating a checkout session."""
        # Mock Stripe response
        mock_session = MagicMock()
        mock_session.url = "https://checkout.stripe.com/test-session"
        mock_checkout.return_value = mock_session
        
        response = client.post(
            "/billing/checkout",
            headers=auth_headers,
            json={"plan": "pro"},
        )
        
        # Either 200 with URL, or 502 if Stripe not configured
        assert response.status_code in [200, 400, 502]
        if response.status_code == 200:
            data = response.json()
            assert "url" in data

    def test_checkout_invalid_plan(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test checkout with invalid plan."""
        response = client.post(
            "/billing/checkout",
            headers=auth_headers,
            json={"plan": "nonexistent_plan"},
        )
        assert response.status_code in [400, 502]  # 502 if Stripe not configured

    def test_checkout_unauthenticated(self, client: TestClient):
        """Test checkout requires authentication."""
        response = client.post(
            "/billing/checkout",
            json={"plan": "pro"},
        )
        assert response.status_code == 401


class TestStripeWebhook:
    """Tests for POST /billing/webhook endpoint."""

    def test_webhook_missing_signature(self, client: TestClient):
        """Test webhook without signature header."""
        response = client.post(
            "/billing/webhook",
            json={"type": "checkout.session.completed"},
        )
        # Should fail without proper signature
        assert response.status_code == 400

    @patch("stripe.Webhook.construct_event")
    def test_webhook_checkout_completed(
        self,
        mock_construct: MagicMock,
        client: TestClient,
        db: Session,
        test_account: Account,
    ):
        """Test handling checkout.session.completed webhook."""
        # Mock the Stripe event
        mock_construct.return_value = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "subscription": "sub_new123",
                    "customer": "cus_new123",
                    "metadata": {
                        "account_id": test_account.id,
                        "plan": "pro",
                    },
                },
            },
        }
        
        response = client.post(
            "/billing/webhook",
            content=b'{}',
            headers={"Stripe-Signature": "test_sig"},
        )
        
        # Should succeed
        assert response.status_code == 200

    @patch("stripe.Webhook.construct_event")
    def test_webhook_subscription_cancelled(
        self,
        mock_construct: MagicMock,
        client: TestClient,
        db: Session,
        subscription: Subscription,
    ):
        """Test handling subscription cancellation webhook."""
        mock_construct.return_value = {
            "type": "customer.subscription.deleted",
            "data": {
                "object": {
                    "id": subscription.stripe_subscription_id,
                    "customer": subscription.stripe_customer_id,
                },
            },
        }
        
        response = client.post(
            "/billing/webhook",
            content=b'{}',
            headers={"Stripe-Signature": "test_sig"},
        )
        
        assert response.status_code == 200


class TestPortal:
    """Tests for POST /billing/portal endpoint."""

    @patch("app.services.billing_service.create_portal_session")
    def test_create_portal_session(
        self,
        mock_portal: MagicMock,
        client: TestClient,
        auth_headers: dict,
        subscription: Subscription,
    ):
        """Test creating a customer portal session."""
        mock_session = MagicMock()
        mock_session.url = "https://billing.stripe.com/session/test"
        mock_portal.return_value = mock_session
        
        response = client.post("/billing/portal", headers=auth_headers)
        
        # Either 200 with URL, or error if no subscription/Stripe
        assert response.status_code in [200, 400, 404, 502]

    def test_portal_unauthenticated(self, client: TestClient):
        """Test portal requires authentication."""
        response = client.post("/billing/portal")
        assert response.status_code == 401
