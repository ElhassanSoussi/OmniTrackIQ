"""Add order_items table for per-product profitability

Revision ID: 0015_order_items
Revises: 0014_password_reset
Create Date: 2025-12-12
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '0015_order_items'
down_revision = '0014_password_reset'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'order_items',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('order_id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('product_id', sa.String(), nullable=False),
        sa.Column('product_name', sa.String(), nullable=False),
        sa.Column('sku', sa.String(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('unit_price', sa.Numeric(18, 4), nullable=False),
        sa.Column('total_price', sa.Numeric(18, 4), nullable=False),
        sa.Column('cost_per_unit', sa.Numeric(18, 4), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_order_items_order_id', 'order_items', ['order_id'])
    op.create_index('ix_order_items_account_id', 'order_items', ['account_id'])
    op.create_index('ix_order_items_product_id', 'order_items', ['product_id'])


def downgrade() -> None:
    op.drop_index('ix_order_items_product_id', table_name='order_items')
    op.drop_index('ix_order_items_account_id', table_name='order_items')
    op.drop_index('ix_order_items_order_id', table_name='order_items')
    op.drop_table('order_items')
