import os
import sys
import logging
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import create_engine, pool, text

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))

from app.config import settings  # noqa: E402
from app.db import Base  # noqa: E402
from app import models  # noqa: E402,F401

config = context.config

# Get database URL and handle Render's postgres:// prefix
database_url = str(settings.DATABASE_URL)
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
logger = logging.getLogger("alembic.env")


def cleanup_multiple_heads(connection):
    """Fix corrupted alembic_version table with multiple entries."""
    try:
        result = connection.execute(text("SELECT COUNT(*) FROM alembic_version"))
        count = result.scalar()
        
        if count > 1:
            logger.warning(f"Found {count} entries in alembic_version. Cleaning up...")
            result = connection.execute(text("SELECT version_num FROM alembic_version"))
            versions = [row[0] for row in result.fetchall()]
            logger.warning(f"Versions found: {versions}")
            
            # Keep only the latest one (highest numbered)
            sorted_versions = sorted(versions, key=lambda x: x.split('_')[0] if '_' in x else x, reverse=True)
            latest = sorted_versions[0]
            
            connection.execute(text("DELETE FROM alembic_version WHERE version_num != :latest"), {"latest": latest})
            connection.commit()
            logger.info(f"Cleaned up. Kept version: {latest}")
    except Exception as e:
        # Table might not exist yet, which is fine
        logger.debug(f"Cleanup check skipped: {e}")


def run_migrations_offline() -> None:
    context.configure(
        url=database_url, 
        target_metadata=target_metadata, 
        literal_binds=True, 
        compare_type=True,
        render_as_batch=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(database_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        # Clean up any duplicate head entries before running migrations
        cleanup_multiple_heads(connection)
        
        context.configure(
            connection=connection, 
            target_metadata=target_metadata, 
            compare_type=True,
            render_as_batch=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
