"""Create custom_reports table

Revision ID: 0005
Revises: 0004
Create Date: 2025-12-07
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'custom_reports',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('config_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('visualization_type', sa.Enum('table', 'line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'metric_cards', name='visualizationtype'), nullable=False, server_default='table'),
        sa.Column('is_shared', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_favorite', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('last_run_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for faster queries
    op.create_index('ix_custom_reports_account_id', 'custom_reports', ['account_id'])
    op.create_index('ix_custom_reports_user_id', 'custom_reports', ['user_id'])
    op.create_index('ix_custom_reports_is_shared', 'custom_reports', ['is_shared'])
    op.create_index('ix_custom_reports_is_favorite', 'custom_reports', ['is_favorite'])


def downgrade():
    op.drop_index('ix_custom_reports_is_favorite', table_name='custom_reports')
    op.drop_index('ix_custom_reports_is_shared', table_name='custom_reports')
    op.drop_index('ix_custom_reports_user_id', table_name='custom_reports')
    op.drop_index('ix_custom_reports_account_id', table_name='custom_reports')
    op.drop_table('custom_reports')
    
    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS visualizationtype')
