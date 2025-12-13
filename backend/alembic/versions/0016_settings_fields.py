"""Add settings fields to users and accounts

Revision ID: 0016_settings_fields
Revises: 0015_order_items
Create Date: 2025-12-12 22:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0016_settings_fields'
down_revision = '0015_order_items'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add columns to users table
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('timezone', sa.String(), nullable=True))

    # Add columns to accounts table
    op.add_column('accounts', sa.Column('industry', sa.String(), nullable=True))
    op.add_column('accounts', sa.Column('currency', sa.String(), nullable=True))
    # accounts table already has timezone column?
    # Checked models/account.py: it was added. Check existing schema.
    # 0006 added timezone to ad_accounts, not accounts?
    # 0001 initial accounts: id, name, type, created_at. No timezone.
    op.add_column('accounts', sa.Column('timezone', sa.String(), nullable=True))


def downgrade() -> None:
    # Drop columns from accounts table
    op.drop_column('accounts', 'timezone')
    op.drop_column('accounts', 'currency')
    op.drop_column('accounts', 'industry')

    # Drop columns from users table
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'avatar_url')
