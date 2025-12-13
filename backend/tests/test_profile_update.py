"""
Tests for profile update endpoints.
"""
import pytest
from unittest.mock import MagicMock, patch


class TestProfileUpdateEndpoints:
    """Test suite for /auth/update-* endpoints."""

    def test_update_account_request_validation(self):
        """Test UpdateAccountRequest schema validation."""
        from app.schemas.auth import UpdateAccountRequest
        
        # Valid request with both fields
        req = UpdateAccountRequest(account_name="My Company", name="John Doe")
        assert req.account_name == "My Company"
        assert req.name == "John Doe"
        
        # Valid request with only account_name
        req = UpdateAccountRequest(account_name="Another Co")
        assert req.account_name == "Another Co"
        assert req.name is None
        
        # Valid request with only name
        req = UpdateAccountRequest(name="Jane Doe")
        assert req.name == "Jane Doe"
        assert req.account_name is None
        
        # Empty account_name should fail
        with pytest.raises(ValueError, match="cannot be empty"):
            UpdateAccountRequest(account_name="")
        
        # Too long account_name should fail
        with pytest.raises(ValueError, match="100 characters or less"):
            UpdateAccountRequest(account_name="x" * 101)

    def test_update_email_request_validation(self):
        """Test UpdateEmailRequest schema validation."""
        from app.schemas.auth import UpdateEmailRequest
        
        # Valid email
        req = UpdateEmailRequest(email="test@example.com")
        assert req.email == "test@example.com"
        
        # Email should be normalized to lowercase
        req = UpdateEmailRequest(email="TEST@EXAMPLE.COM")
        assert req.email == "test@example.com"
        
        # Invalid email should fail
        with pytest.raises(ValueError, match="Invalid email"):
            UpdateEmailRequest(email="not-an-email")

    def test_update_password_request_validation(self):
        """Test UpdatePasswordRequest schema validation."""
        from app.schemas.auth import UpdatePasswordRequest
        
        # Valid passwords
        req = UpdatePasswordRequest(current_password="oldpass123", new_password="newpass123")
        assert req.current_password == "oldpass123"
        assert req.new_password == "newpass123"
        
        # Short new password should fail
        with pytest.raises(ValueError, match="at least 8 characters"):
            UpdatePasswordRequest(current_password="oldpass", new_password="short")

    def test_user_info_includes_account_name(self):
        """Test UserInfo schema includes account_name field."""
        from app.schemas.auth import UserInfo
        
        user_info = UserInfo(
            id="user-123",
            email="test@example.com",
            account_id="acc-456",
            role="owner",
            name="Test User",
            account_name="Test Company"
        )
        
        assert user_info.account_name == "Test Company"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
