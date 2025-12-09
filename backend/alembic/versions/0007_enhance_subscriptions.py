"""Enhance subscriptions table with additional fields and indexes

Revision ID: 0007_enhance_subscriptions
Revises: 0006_metrics_backend
Create Date: 2025-12-08
"""
from alembic import op
import sqlalchemy as sa


revision = "0007_enhance_subscriptions"
down_revision = "0006_metrics_backend"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to subscriptions table
    op.add_column(
        "subscriptions",
        sa.Column("stripe_price_id", sa.String(), nullable=True),
    )
    op.add_column(
        "subscriptions",
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "subscriptions",
        sa.Column("trial_end", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "subscriptions",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create indexes for faster lookups
    op.create_index(
        "ix_subscriptions_account_id",
        "subscriptions",
        ["account_id"],
        unique=False,
    )
    op.create_index(
        "ix_subscriptions_stripe_subscription_id",
        "subscriptions",
        ["stripe_subscription_id"],
        unique=False,
    )
    op.create_index(
        "ix_subscriptions_stripe_customer_id",
        "subscriptions",
        ["stripe_customer_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop indexes
    op.drop_index("ix_subscriptions_stripe_customer_id", table_name="subscriptions")
    op.drop_index("ix_subscriptions_stripe_subscription_id", table_name="subscriptions")
    op.drop_index("ix_subscriptions_account_id", table_name="subscriptions")

    # Drop columns
    op.drop_column("subscriptions", "updated_at")
    op.drop_column("subscriptions", "trial_end")
    op.drop_column("subscriptions", "current_period_start")
    op.drop_column("subscriptions", "stripe_price_id")
