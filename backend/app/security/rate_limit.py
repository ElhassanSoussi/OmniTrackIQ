"""
Rate limiting utilities using slowapi.
"""
import os
from slowapi import Limiter
from slowapi.util import get_remote_address

# Default rate limits
DEFAULT_RATE_LIMIT = os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "60")
AUTH_RATE_LIMIT = os.getenv("AUTH_RATE_LIMIT_PER_MINUTE", "10")

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)


def get_auth_rate_limit() -> str:
    """Rate limit for authentication endpoints (stricter)."""
    return f"{AUTH_RATE_LIMIT}/minute"


def get_default_rate_limit() -> str:
    """Default rate limit for API endpoints."""
    return f"{DEFAULT_RATE_LIMIT}/minute"
