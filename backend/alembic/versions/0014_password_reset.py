"""Add password reset columns to users

Revision ID: 0014_password_reset
Revises: 0013_product_events
Create Date: 2025-12-11
"""
from alembic import op
import sqlalchemy as sa


revision = "0014_password_reset"
down_revision = "0013_product_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add password reset token column
    op.add_column(
        "users",
        sa.Column("password_reset_token", sa.String(), nullable=True)
    )
    # Add password reset expiry column
    op.add_column(
        "users",
        sa.Column("password_reset_expires", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "password_reset_expires")
    op.drop_column("users", "password_reset_token")
