"""Tests for team management endpoints."""
# MUST import env_setup first
import tests.env_setup  # noqa: F401

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.account import Account, AccountPlan
from app.models.team_invite import TeamInvite, InviteStatus
from app.security.password import hash_password


@pytest.fixture
def team_owner(db: Session, test_account: Account) -> User:
    """Create an owner user for team tests."""
    user = User(
        id="team-owner-123",
        email="owner@example.com",
        password_hash=hash_password("ownerpassword123"),
        account_id=test_account.id,
        role=UserRole.OWNER,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def team_admin(db: Session, test_account: Account) -> User:
    """Create an admin user for team tests."""
    user = User(
        id="team-admin-123",
        email="admin@example.com",
        password_hash=hash_password("adminpassword123"),
        account_id=test_account.id,
        role=UserRole.ADMIN,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def team_member(db: Session, test_account: Account) -> User:
    """Create a member user for team tests."""
    user = User(
        id="team-member-123",
        email="member@example.com",
        password_hash=hash_password("memberpassword123"),
        account_id=test_account.id,
        role=UserRole.MEMBER,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def owner_headers(team_owner: User) -> dict:
    """Create authorization headers for owner."""
    from app.security.jwt import create_access_token
    token = create_access_token(team_owner.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(team_admin: User) -> dict:
    """Create authorization headers for admin."""
    from app.security.jwt import create_access_token
    token = create_access_token(team_admin.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def member_headers(team_member: User) -> dict:
    """Create authorization headers for member."""
    from app.security.jwt import create_access_token
    token = create_access_token(team_member.id)
    return {"Authorization": f"Bearer {token}"}


class TestGetTeam:
    """Tests for GET /team endpoint."""

    def test_get_team_info(
        self,
        client: TestClient,
        owner_headers: dict,
        team_owner: User,
        test_account: Account,
    ):
        """Test getting team information."""
        response = client.get("/team", headers=owner_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["account_id"] == test_account.id
        assert data["account_name"] == test_account.name
        assert "members" in data
        assert "pending_invites" in data
        assert data["current_users"] >= 1

    def test_get_team_unauthenticated(self, client: TestClient):
        """Test getting team info without authentication."""
        response = client.get("/team")
        assert response.status_code == 401


class TestGetMembers:
    """Tests for GET /team/members endpoint."""

    def test_list_members(
        self,
        client: TestClient,
        owner_headers: dict,
        team_owner: User,
    ):
        """Test listing team members."""
        response = client.get("/team/members", headers=owner_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify owner is in the list
        emails = [m["email"] for m in data]
        assert team_owner.email in emails

    def test_member_can_list_team(
        self,
        client: TestClient,
        member_headers: dict,
        team_member: User,
    ):
        """Test that regular members can view team members."""
        response = client.get("/team/members", headers=member_headers)
        assert response.status_code == 200


class TestInviteMembers:
    """Tests for POST /team/invites endpoint."""

    def test_admin_can_invite(
        self,
        client: TestClient,
        admin_headers: dict,
        test_account: Account,
    ):
        """Test that admin can invite new members."""
        response = client.post(
            "/team/invites",
            headers=admin_headers,
            json={
                "email": "newinvite@example.com",
                "role": "member",
            },
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["email"] == "newinvite@example.com"
        assert data["role"] == "member"
        assert "id" in data

    def test_member_cannot_invite(
        self,
        client: TestClient,
        member_headers: dict,
    ):
        """Test that regular members cannot invite."""
        response = client.post(
            "/team/invites",
            headers=member_headers,
            json={
                "email": "blocked@example.com",
                "role": "member",
            },
        )
        assert response.status_code == 403

    def test_invite_invalid_email(
        self,
        client: TestClient,
        admin_headers: dict,
    ):
        """Test inviting with invalid email."""
        response = client.post(
            "/team/invites",
            headers=admin_headers,
            json={
                "email": "notanemail",
                "role": "member",
            },
        )
        assert response.status_code == 422


class TestUpdateMemberRole:
    """Tests for PATCH /team/members/{user_id} endpoint."""

    def test_admin_can_update_role(
        self,
        client: TestClient,
        admin_headers: dict,
        team_member: User,
    ):
        """Test that admin can update member roles."""
        response = client.patch(
            f"/team/members/{team_member.id}",
            headers=admin_headers,
            json={"role": "viewer"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "viewer"

    def test_member_cannot_update_role(
        self,
        client: TestClient,
        member_headers: dict,
        team_admin: User,
    ):
        """Test that members cannot update roles."""
        response = client.patch(
            f"/team/members/{team_admin.id}",
            headers=member_headers,
            json={"role": "member"},
        )
        assert response.status_code == 403


class TestRemoveMember:
    """Tests for DELETE /team/members/{user_id} endpoint."""

    def test_admin_can_remove_member(
        self,
        client: TestClient,
        db: Session,
        admin_headers: dict,
        test_account: Account,
    ):
        """Test that admin can remove a member."""
        # Create a member to remove
        removable_user = User(
            id="removable-user-123",
            email="removable@example.com",
            password_hash=hash_password("password123"),
            account_id=test_account.id,
            role=UserRole.VIEWER,
            created_at=datetime.utcnow(),
        )
        db.add(removable_user)
        db.commit()
        
        response = client.delete(
            f"/team/members/{removable_user.id}",
            headers=admin_headers,
        )
        assert response.status_code in [200, 204]

    def test_cannot_remove_owner(
        self,
        client: TestClient,
        admin_headers: dict,
        team_owner: User,
    ):
        """Test that owner cannot be removed."""
        response = client.delete(
            f"/team/members/{team_owner.id}",
            headers=admin_headers,
        )
        # Should fail - can't remove owner
        assert response.status_code in [400, 403]

    def test_member_cannot_remove(
        self,
        client: TestClient,
        member_headers: dict,
        team_admin: User,
    ):
        """Test that members cannot remove others."""
        response = client.delete(
            f"/team/members/{team_admin.id}",
            headers=member_headers,
        )
        assert response.status_code == 403
