"""Add product_events table for analytics tracking

Revision ID: 0013_product_events
Revises: 0012_fix_onboarding_columns
Create Date: 2024-12-09 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0013_product_events'
down_revision = '0012_fix_onboarding_columns'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create product_events table using raw SQL for consistency
    op.execute("""
        CREATE TABLE IF NOT EXISTS product_events (
            id VARCHAR NOT NULL PRIMARY KEY,
            workspace_id VARCHAR,
            user_id VARCHAR,
            event_name VARCHAR NOT NULL,
            properties JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    # Create indexes for efficient querying
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_events_workspace_id ON product_events (workspace_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_events_user_id ON product_events (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_events_event_name ON product_events (event_name)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_events_created_at ON product_events (created_at)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_events_workspace_event ON product_events (workspace_id, event_name)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_product_events_created_event ON product_events (created_at, event_name)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS product_events CASCADE")
