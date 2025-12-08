"""Add scheduled reports table

Revision ID: 0004
Revises: 0003_saved_views
Create Date: 2025-12-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0004'
down_revision: Union[str, None] = '0003_saved_views'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'scheduled_reports',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('report_type', sa.Enum('OVERVIEW', 'CAMPAIGNS', 'REVENUE', 'ORDERS', 'CUSTOM', name='reporttype'), nullable=False),
        sa.Column('frequency', sa.Enum('DAILY', 'WEEKLY', 'MONTHLY', name='reportfrequency'), nullable=False),
        sa.Column('recipients', sa.JSON(), nullable=False),
        sa.Column('date_range_days', sa.String(length=10), nullable=True),
        sa.Column('platforms', sa.JSON(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('send_time', sa.String(length=5), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('day_of_week', sa.String(length=10), nullable=True),
        sa.Column('day_of_month', sa.String(length=2), nullable=True),
        sa.Column('last_sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_send_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('send_count', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_scheduled_reports_account_id'), 'scheduled_reports', ['account_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_scheduled_reports_account_id'), table_name='scheduled_reports')
    op.drop_table('scheduled_reports')
    op.execute("DROP TYPE IF EXISTS reporttype")
    op.execute("DROP TYPE IF EXISTS reportfrequency")
