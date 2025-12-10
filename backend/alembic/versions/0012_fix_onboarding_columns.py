"""Fix missing onboarding columns in accounts table

Revision ID: 0012_fix_onboarding_columns
Revises: 0011_enterprise
Create Date: 2024-12-10 02:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '0012_fix_onboarding_columns'
down_revision = '0011_enterprise'
branch_labels = None
depends_on = None


def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    # Add onboarding_completed column if it doesn't exist
    if not column_exists('accounts', 'onboarding_completed'):
        op.add_column(
            'accounts',
            sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false')
        )
    
    # Add onboarding_steps column if it doesn't exist
    if not column_exists('accounts', 'onboarding_steps'):
        op.add_column(
            'accounts',
            sa.Column('onboarding_steps', sa.JSON(), nullable=False, server_default='{}')
        )


def downgrade() -> None:
    # Don't drop the columns on downgrade since they might be used
    pass
