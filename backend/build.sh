#!/bin/bash
# Build script for Render deployment

set -e

echo "=== OmniTrackIQ Backend Build ==="
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"
echo ""

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "=== Verifying application imports ==="
python -c "from app.main import app; print('Application imports OK')"

echo ""
echo "=== Running database migrations ==="

# Pre-migration cleanup script
python << 'CLEANUP_EOF'
import os
import sys

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set, skipping migration check")
    sys.exit(0)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    from sqlalchemy import create_engine, text
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'alembic_version'
            )
        """))
        table_exists = result.scalar()
        
        if not table_exists:
            print("Fresh database - no alembic_version table yet")
            sys.exit(0)
        
        result = conn.execute(text("SELECT COUNT(*) FROM alembic_version"))
        count = result.scalar()
        
        if count > 1:
            print(f"WARNING: Found {count} entries in alembic_version. Cleaning up...")
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            versions = [row[0] for row in result.fetchall()]
            print(f"Found versions: {versions}")
            
            def get_num(v):
                try:
                    return int(v.split('_')[0])
                except:
                    return 0
            
            latest = sorted(versions, key=get_num, reverse=True)[0]
            print(f"Keeping: {latest}")
            
            conn.execute(text("DELETE FROM alembic_version"))
            conn.execute(text("INSERT INTO alembic_version (version_num) VALUES (:v)"), {"v": latest})
            conn.commit()
            print("Fixed alembic_version table")
        elif count == 1:
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            print(f"Current version: {result.scalar()}")
        else:
            print("Empty alembic_version table")
            
except Exception as e:
    print(f"Pre-migration check warning: {e}")

CLEANUP_EOF

echo ""
echo "Running alembic upgrade head..."
alembic upgrade head || {
    echo ""
    echo "=== Migration failed, attempting recovery ==="
    
    python << 'RECOVERY_EOF'
import os
import sys

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

from sqlalchemy import create_engine, text
engine = create_engine(DATABASE_URL)

migration_tables = {
    "0001_initial": "users",
    "0002_multi_tenant": "accounts",
    "0003_saved_views": "saved_views",
    "0004_scheduled_reports": "scheduled_reports",
    "0005_custom_reports": "custom_reports",
    "0006_metrics_backend": "ad_accounts",
    "0007_enhance_subscriptions": None,
    "0008_notification_preferences": "notification_preferences",
    "0009_onboarding_fields": None,
    "0010_client_accounts": "client_accounts",
    "0011_enterprise": "sso_configs",
}

migrations = list(migration_tables.keys())

try:
    with engine.connect() as conn:
        latest = None
        for mig in migrations:
            table = migration_tables.get(mig)
            if table:
                result = conn.execute(text(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = '{table}'
                    )
                """))
                if result.scalar():
                    latest = mig
        
        if latest:
            print(f"Detected state: {latest}")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS alembic_version (
                    version_num VARCHAR(32) NOT NULL PRIMARY KEY
                )
            """))
            conn.execute(text("DELETE FROM alembic_version"))
            conn.execute(text("INSERT INTO alembic_version (version_num) VALUES (:v)"), {"v": latest})
            conn.commit()
            print(f"Set alembic_version to: {latest}")
        else:
            print("Could not detect migration state")
except Exception as e:
    print(f"Recovery failed: {e}")
    sys.exit(1)

RECOVERY_EOF

    echo ""
    echo "Retrying alembic upgrade head..."
    alembic upgrade head
}

echo ""
echo "=== Build complete! ==="
