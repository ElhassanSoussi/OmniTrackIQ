"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "accounts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "integrations",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="connected"),
        sa.Column("access_token", sa.Text(), nullable=True),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("config_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "ad_spend",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("external_account_id", sa.String(), nullable=True),
        sa.Column("external_campaign_id", sa.String(), nullable=True),
        sa.Column("campaign_name", sa.String(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("impressions", sa.Integer(), nullable=True),
        sa.Column("clicks", sa.Integer(), nullable=True),
        sa.Column("conversions", sa.Integer(), nullable=True),
        sa.Column("cost", sa.Numeric(18, 4), nullable=False),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_ad_spend_date", "ad_spend", ["date"])
    op.create_index("idx_ad_spend_account", "ad_spend", ["account_id"])
    op.create_index("idx_ad_spend_platform", "ad_spend", ["platform"])
    op.create_index("idx_ad_spend_campaign", "ad_spend", ["external_campaign_id"])

    op.create_table(
        "orders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("source_platform", sa.String(), nullable=False),
        sa.Column("external_order_id", sa.String(), nullable=False),
        sa.Column("date_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("total_amount", sa.Numeric(18, 4), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("utm_source", sa.String(), nullable=True),
        sa.Column("utm_campaign", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_orders_date_time", "orders", ["date_time"])
    op.create_index("idx_orders_account", "orders", ["account_id"])

    op.create_table(
        "daily_metrics",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("total_revenue", sa.Numeric(18, 4), nullable=False, server_default="0"),
        sa.Column("total_ad_spend", sa.Numeric(18, 4), nullable=False, server_default="0"),
        sa.Column("total_orders", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_clicks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_impressions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("roas", sa.Numeric(18, 4), nullable=False, server_default="0"),
        sa.Column("profit", sa.Numeric(18, 4), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("daily_metrics") as batch_op:
        batch_op.create_unique_constraint("idx_daily_metrics_unique", ["account_id", "date"])

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("stripe_customer_id", sa.String(), nullable=False),
        sa.Column("stripe_subscription_id", sa.String(), nullable=False),
        sa.Column("plan", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
    with op.batch_alter_table("daily_metrics") as batch_op:
        batch_op.drop_constraint("idx_daily_metrics_unique", type_="unique")
    op.drop_table("daily_metrics")
    op.drop_index("idx_orders_account", table_name="orders")
    op.drop_index("idx_orders_date_time", table_name="orders")
    op.drop_table("orders")
    op.drop_index("idx_ad_spend_campaign", table_name="ad_spend")
    op.drop_index("idx_ad_spend_platform", table_name="ad_spend")
    op.drop_index("idx_ad_spend_account", table_name="ad_spend")
    op.drop_index("idx_ad_spend_date", table_name="ad_spend")
    op.drop_table("ad_spend")
    op.drop_table("integrations")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("accounts")
