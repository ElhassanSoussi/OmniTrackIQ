# filepath: /Users/elhassansoussi/Desktop/OmnniTrackIQ/backend/tests/env_setup.py
"""
Environment setup for tests - MUST be imported before any app modules.
"""
import os

# Set test environment variables
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_fake"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["TESTING"] = "1"
