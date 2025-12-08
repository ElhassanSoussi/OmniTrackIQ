"""Tests for authentication endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.account import Account


class TestAuthSignup:
    """Tests for /auth/signup endpoint."""

    def test_signup_success(self, client: TestClient, db: Session):
        """Test successful user signup."""
        response = client.post(
            "/auth/signup",
            json={
                "email": "newuser@example.com",
                "password": "securepassword123",
                "account_name": "New Company",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_signup_duplicate_email(self, client: TestClient, test_user: User):
        """Test signup fails with duplicate email."""
        response = client.post(
            "/auth/signup",
            json={
                "email": test_user.email,
                "password": "anotherpassword123",
                "account_name": "Another Company",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_signup_invalid_email(self, client: TestClient):
        """Test signup fails with invalid email."""
        response = client.post(
            "/auth/signup",
            json={
                "email": "notanemail",
                "password": "password123",
                "account_name": "Test Company",
            },
        )
        assert response.status_code == 422

    def test_signup_weak_password(self, client: TestClient):
        """Test signup with short password."""
        response = client.post(
            "/auth/signup",
            json={
                "email": "test@example.com",
                "password": "short",
                "account_name": "Test Company",
            },
        )
        assert response.status_code == 422


class TestAuthLogin:
    """Tests for /auth/login endpoint."""

    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login."""
        response = client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login fails with wrong password."""
        response = client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login fails for nonexistent user."""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "anypassword",
            },
        )
        assert response.status_code == 401


class TestAuthMe:
    """Tests for /auth/me endpoint."""

    def test_me_authenticated(self, client: TestClient, auth_headers: dict, test_user: User):
        """Test getting current user info when authenticated."""
        response = client.get("/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["account_id"] == test_user.account_id

    def test_me_unauthenticated(self, client: TestClient):
        """Test /auth/me fails without token."""
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_me_invalid_token(self, client: TestClient):
        """Test /auth/me fails with invalid token."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401
