"""
Pytest configuration and fixtures for OmniTrackIQ tests.
"""
# MUST import env_setup first to set environment variables before any app modules
import tests.env_setup  # noqa: F401

import os
import sys

# Set test environment variables BEFORE any app imports
# This must be at the very top of the file
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_fake"
os.environ["STRIPE_WEBHOOK_SECRET"] = "whsec_test"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["TESTING"] = "true"

import pytest
from datetime import datetime, timedelta
from typing import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db import Base
from app.routers.deps import get_db
from app.models.user import User
from app.models.account import Account, AccountPlan
from app.models.ad_spend import AdSpend
from app.models.order import Order
from app.security.jwt import create_access_token
from app.security.password import hash_password


# Create test database engine
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    """Override database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def override_get_db(db: Session):
    """Create a dependency override that yields the test db."""
    def _get_db():
        try:
            yield db
        finally:
            pass
    return _get_db


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = override_get_db(db)
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_account(db: Session) -> Account:
    """Create a test account."""
    account = Account(
        id="test-account-123",
        name="Test Company",
        plan=AccountPlan.PRO,
        created_at=datetime.utcnow(),
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@pytest.fixture
def test_user(db: Session, test_account: Account) -> User:
    """Create a test user."""
    user = User(
        id="test-user-123",
        email="test@example.com",
        password_hash=hash_password("testpassword123"),
        account_id=test_account.id,
        role="admin",
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authorization headers with valid JWT token."""
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_ad_spend(db: Session, test_account: Account) -> list[AdSpend]:
    """Create sample ad spend data."""
    ad_spends = []
    platforms = ["facebook", "google_ads", "tiktok"]
    
    for i in range(30):
        date = datetime.utcnow().date() - timedelta(days=i)
        for platform in platforms:
            ad_spend = AdSpend(
                account_id=test_account.id,
                platform=platform,
                external_campaign_id=f"{platform}-campaign-1",
                campaign_name=f"{platform.title()} Campaign 1",
                date=date,
                cost=100.0 + (i * 10),
                impressions=10000 + (i * 1000),
                clicks=500 + (i * 50),
                conversions=25 + i,
            )
            db.add(ad_spend)
            ad_spends.append(ad_spend)
    
    db.commit()
    return ad_spends


@pytest.fixture
def sample_orders(db: Session, test_account: Account) -> list[Order]:
    """Create sample order data."""
    orders = []
    
    for i in range(50):
        order = Order(
            account_id=test_account.id,
            external_order_id=f"order-{i}",
            source_platform="shopify",
            total_amount=50.0 + (i * 5),
            currency="USD",
            date_time=datetime.utcnow() - timedelta(days=i % 30),
            utm_source="facebook" if i % 2 == 0 else "google_ads",
            utm_campaign=f"campaign-{i % 3}",
        )
        db.add(order)
        orders.append(order)
    
    db.commit()
    return orders
