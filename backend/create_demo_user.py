#!/usr/bin/env python3
"""
Create a demo user account for testing OmniTrackIQ.
Run this script from the backend directory:
    python create_demo_user.py
"""
import os
import sys

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import uuid

# Import password hashing
from app.security.password import hash_password

# Database URL - use environment variable or default to local
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/omnitrackiq")

# Demo account credentials
DEMO_EMAIL = "demo@omnitrackiq.com"
DEMO_PASSWORD = "Demo2024!"
DEMO_ACCOUNT_NAME = "OmniTrackIQ Demo"

def create_demo_user():
    """Create a demo user account."""
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Check if user already exists
        result = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": DEMO_EMAIL}
        )
        existing_user = result.fetchone()
        
        if existing_user:
            print(f"✓ Demo user already exists: {DEMO_EMAIL}")
            print(f"  Password: {DEMO_PASSWORD}")
            return
        
        # Create account
        account_id = str(uuid.uuid4())
        
        # Check if onboarding columns exist
        result = db.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'accounts' AND column_name = 'onboarding_completed'
        """))
        has_onboarding_columns = result.fetchone() is not None
        
        # Insert account
        if has_onboarding_columns:
            db.execute(
                text("""
                    INSERT INTO accounts (id, name, type, plan, max_users, onboarding_completed, onboarding_steps)
                    VALUES (:id, :name, :type, :plan, :max_users, :onboarding_completed, :onboarding_steps)
                """),
                {
                    "id": account_id,
                    "name": DEMO_ACCOUNT_NAME,
                    "type": "business",
                    "plan": "PRO",  # Give demo user Pro plan for full access
                    "max_users": 10,
                    "onboarding_completed": True,
                    "onboarding_steps": '{"created_workspace": true, "connected_integration": true, "viewed_dashboard": true}'
                }
            )
        else:
            db.execute(
                text("""
                    INSERT INTO accounts (id, name, type, plan, max_users)
                    VALUES (:id, :name, :type, :plan, :max_users)
                """),
                {
                    "id": account_id,
                    "name": DEMO_ACCOUNT_NAME,
                    "type": "business",
                    "plan": "PRO",
                    "max_users": 10,
                }
            )
        
        # Create user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(DEMO_PASSWORD)
        
        db.execute(
            text("""
                INSERT INTO users (id, email, password_hash, account_id, name, is_active)
                VALUES (:id, :email, :password_hash, :account_id, :name, :is_active)
            """),
            {
                "id": user_id,
                "email": DEMO_EMAIL,
                "password_hash": password_hash,
                "account_id": account_id,
                "name": "Demo User",
                "is_active": True,
            }
        )
        
        db.commit()
        
        print("=" * 50)
        print("✓ Demo account created successfully!")
        print("=" * 50)
        print(f"  Email:    {DEMO_EMAIL}")
        print(f"  Password: {DEMO_PASSWORD}")
        print(f"  Plan:     Pro (full access)")
        print("=" * 50)
        print("\nYou can now log in at your website's /login page.")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error creating demo user: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_demo_user()
