"""Add saved views table

Revision ID: 0003
Revises: 0002
Create Date: 2025-01-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0003'
down_revision: Union[str, None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create saved_views table
    op.create_table(
        'saved_views',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('view_type', sa.Enum('EXECUTIVE', 'ACQUISITION', 'CAMPAIGNS', 'CUSTOM', name='viewtype'), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('config_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('is_shared', sa.String(), nullable=False, server_default='private'),
        sa.Column('is_default', sa.String(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for faster lookups
    op.create_index('ix_saved_views_account_id', 'saved_views', ['account_id'])
    op.create_index('ix_saved_views_user_id', 'saved_views', ['user_id'])
    op.create_index('ix_saved_views_view_type', 'saved_views', ['view_type'])


def downgrade() -> None:
    op.drop_index('ix_saved_views_view_type', 'saved_views')
    op.drop_index('ix_saved_views_user_id', 'saved_views')
    op.drop_index('ix_saved_views_account_id', 'saved_views')
    op.drop_table('saved_views')
    
    # Drop enum type
    op.execute('DROP TYPE IF EXISTS viewtype')
