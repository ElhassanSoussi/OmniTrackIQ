"""0017_templates_custom_metrics

Revision ID: 789cabcc7b4b
Revises: 0016_settings_fields
Create Date: 2025-12-13 01:13:27.593613
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '789cabcc7b4b'
down_revision = '0016_settings_fields'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create custom_metrics
    op.create_table('custom_metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('formula', sa.Text(), nullable=False),
        sa.Column('format', sa.String(), nullable=False),
        sa.Column('created_by_user_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_custom_metrics_account_id'), 'custom_metrics', ['account_id'], unique=False)
    op.create_index(op.f('ix_custom_metrics_id'), 'custom_metrics', ['id'], unique=False)

    # 2. Create report_templates
    op.create_table('report_templates',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('config_json', sa.JSON(), server_default='{}', nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('created_by_user_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_report_templates_account_id'), 'report_templates', ['account_id'], unique=False)
    op.create_index(op.f('ix_report_templates_id'), 'report_templates', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_report_templates_id'), table_name='report_templates')
    op.drop_index(op.f('ix_report_templates_account_id'), table_name='report_templates')
    op.drop_table('report_templates')
    op.drop_index(op.f('ix_custom_metrics_id'), table_name='custom_metrics')
    op.drop_index(op.f('ix_custom_metrics_account_id'), table_name='custom_metrics')
    op.drop_table('custom_metrics')
