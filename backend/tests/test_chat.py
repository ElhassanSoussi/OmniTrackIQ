"""Tests for chat/AI endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.ad_spend import AdSpend
from app.models.order import Order


class TestChatEndpoint:
    """Tests for POST /chat/message endpoint."""

    def test_chat_faq_pricing(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat with pricing question."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "What are your pricing plans?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        # Should mention pricing/plans
        assert any(word in data["message"].lower() for word in ["starter", "pro", "plan", "$", "pricing"])

    def test_chat_faq_roas(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat with ROAS explanation question."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "What is ROAS?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        # Should explain ROAS
        assert "return" in data["message"].lower() or "roas" in data["message"].lower()

    def test_chat_faq_integrations(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat with integrations question."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "What platforms do you integrate with?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        # Should mention some platforms
        response_lower = data["message"].lower()
        assert any(p in response_lower for p in ["facebook", "google", "shopify", "tiktok", "platform", "integration"])

    def test_chat_metrics_query(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
        sample_orders: list[Order],
    ):
        """Test chat with metrics query."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "What's my revenue this week?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        # Should have some response about metrics
        assert len(data["message"]) > 10

    def test_chat_summary_query(
        self,
        client: TestClient,
        auth_headers: dict,
        sample_ad_spend: list[AdSpend],
    ):
        """Test chat asking for summary."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "Give me a summary of my performance"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data

    def test_chat_unknown_question(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat with unrecognized question."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "What's the meaning of life?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should still respond (even if it can't help)
        assert "message" in data
        assert len(data["message"]) > 0

    def test_chat_empty_message(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat with empty message."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": ""},
        )
        # Should return validation error (min_length=1)
        assert response.status_code == 422

    def test_chat_unauthenticated(self, client: TestClient):
        """Test chat requires authentication."""
        response = client.post(
            "/chat/message",
            json={"message": "Hello"},
        )
        assert response.status_code == 401

    def test_chat_support_question(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat with support question."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "How do I contact support?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        # Should mention support contact info
        response_lower = data["message"].lower()
        assert any(word in response_lower for word in ["support", "email", "contact", "help"])

    def test_chat_cancel_subscription(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test chat asking about cancellation."""
        response = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "How do I cancel my subscription?"},
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        # Should respond with something helpful (cancel info or pricing info)
        assert len(data["message"]) > 20


class TestChatSession:
    """Tests for chat session handling."""

    def test_chat_maintains_context(
        self,
        client: TestClient,
        auth_headers: dict,
    ):
        """Test that chat can handle follow-up questions."""
        # First message
        response1 = client.post(
            "/chat/message",
            headers=auth_headers,
            json={"message": "What's my ROAS?"},
        )
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Get conversation_id for follow-up
        conversation_id = data1.get("conversation_id")
        
        # Follow-up with conversation context
        response2 = client.post(
            "/chat/message",
            headers=auth_headers,
            json={
                "message": "And what about revenue?",
                "conversation_id": conversation_id
            },
        )
        assert response2.status_code == 200
        
        # Both should have valid responses
        assert "message" in data1
        assert "message" in response2.json()
