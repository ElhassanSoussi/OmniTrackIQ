#!/bin/bash
# Build script for Render deployment

set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."

# Clean up alembic state and handle migration issues
python << 'EOF'
import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set, skipping migration check")
    sys.exit(0)

# Handle Render's postgres:// vs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Check if alembic_version table exists
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'alembic_version'
            )
        """))
        table_exists = result.scalar()
        
        if table_exists:
            # Check for multiple version entries (corrupted state)
            result = conn.execute(text("SELECT COUNT(*) FROM alembic_version"))
            count = result.scalar()
            
            if count > 1:
                print(f"WARNING: Found {count} entries in alembic_version table. Cleaning up...")
                # Get all versions
                result = conn.execute(text("SELECT version_num FROM alembic_version"))
                versions = [row[0] for row in result.fetchall()]
                print(f"Current versions: {versions}")
                
                # Sort by migration number and keep the highest
                def get_migration_num(v):
                    try:
                        return int(v.split('_')[0])
                    except:
                        return 0
                
                sorted_versions = sorted(versions, key=get_migration_num, reverse=True)
                latest = sorted_versions[0]
                print(f"Keeping latest version: {latest}")
                
                # Delete all and insert only the latest
                conn.execute(text("DELETE FROM alembic_version"))
                conn.execute(text("INSERT INTO alembic_version (version_num) VALUES (:ver)"), {"ver": latest})
                conn.commit()
                print(f"Fixed alembic_version table. Set to: {latest}")
                
            elif count == 1:
                result = conn.execute(text("SELECT version_num FROM alembic_version"))
                current = result.scalar()
                print(f"Current migration version: {current}")
            else:
                print("No migration version found. Fresh database.")
        else:
            print("No alembic_version table found. Fresh database.")
except Exception as e:
    print(f"Migration check warning (continuing anyway): {e}")

print("Migration check complete.")
EOF

# Run migrations with retry logic
echo "Running alembic upgrade head..."
if ! alembic upgrade head; then
    echo "First migration attempt failed. Attempting recovery..."
    
    # Try to stamp to the current actual state and then upgrade
    python << 'RECOVERY'
import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    sys.exit(1)

engine = create_engine(DATABASE_URL)

# Migration order
migrations = [
    "0001_initial",
    "0002_multi_tenant", 
    "0003_saved_views",
    "0004_scheduled_reports",
    "0005_custom_reports",
    "0006_metrics_backend",
    "0007_enhance_subscriptions",
    "0008_notification_preferences",
    "0009_onboarding_fields",
    "0010_client_accounts",
    "0011_enterprise",
]

# Tables that indicate which migration has been applied
migration_tables = {
    "0001_initial": "users",
    "0002_multi_tenant": "accounts", 
    "0003_saved_views": "saved_views",
    "0004_scheduled_reports": "scheduled_reports",
    "0005_custom_reports": "custom_reports",
    "0006_metrics_backend": "ad_accounts",
    "0007_enhance_subscriptions": None,  # Modifies existing table
    "0008_notification_preferences": "notification_preferences",
    "0009_onboarding_fields": None,  # Modifies existing table
    "0010_client_accounts": "client_accounts",
    "0011_enterprise": "sso_configs",
}

try:
    with engine.connect() as conn:
        # Find the latest migration that has been applied by checking tables
        latest_applied = None
        for migration in migrations:
            table = migration_tables.get(migration)
            if table:
                result = conn.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = '{table}'
                    )
                """))
                if result.scalar():
                    latest_applied = migration
        
        if latest_applied:
            print(f"Detected latest applied migration: {latest_applied}")
            # Clear and set the correct version
            conn.execute(text("DELETE FROM alembic_version"))
            conn.execute(text("INSERT INTO alembic_version (version_num) VALUES (:ver)"), {"ver": latest_applied})
            conn.commit()
            print(f"Set alembic_version to: {latest_applied}")
        else:
            print("Could not detect migration state from tables")
            
except Exception as e:
    print(f"Recovery detection failed: {e}")
RECOVERY

    # Try upgrade again
    echo "Retrying alembic upgrade head..."
    alembic upgrade head
fi

echo "Build complete!"
