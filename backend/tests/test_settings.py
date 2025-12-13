import pytest
from app.models.user import User
from app.models.account import Account

def test_update_profile(client, db, auth_headers):
    response = client.patch(
        "/auth/me",
        headers=auth_headers,
        json={
            "name": "Updated Name",
            "avatar_url": "https://example.com/avatar.jpg",
            "timezone": "Europe/Paris"
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Profile updated successfully"

    # Verify update
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["avatar_url"] == "https://example.com/avatar.jpg"
    assert data["timezone"] == "Europe/Paris"

def test_update_organization(client, db, auth_headers):
    response = client.patch(
        "/auth/account/me",
        headers=auth_headers,
        json={
            "name": "Updated Corp",
            "industry": "saas",
            "currency": "EUR",
            "timezone": "Europe/London"
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Organization settings updated successfully"

    response = client.get("/auth/me", headers=auth_headers)
    assert response.json()["account_name"] == "Updated Corp"
