"""add multi-tenant fields

Revision ID: 0002_multi_tenant
Revises: 0001_initial
Create Date: 2025-01-02 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = "0002_multi_tenant"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to accounts table
    op.add_column(
        "accounts",
        sa.Column("plan", sa.String(), nullable=False, server_default="free")
    )
    op.add_column(
        "accounts",
        sa.Column("max_users", sa.Integer(), nullable=False, server_default="1")
    )
    op.add_column(
        "accounts",
        sa.Column("stripe_customer_id", sa.String(), nullable=True)
    )
    op.add_column(
        "accounts",
        sa.Column("stripe_subscription_id", sa.String(), nullable=True)
    )
    op.add_column(
        "accounts",
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index("ix_accounts_stripe_customer_id", "accounts", ["stripe_customer_id"])

    # Add new columns to users table
    op.add_column(
        "users",
        sa.Column("role", sa.String(), nullable=False, server_default="owner")
    )
    op.add_column(
        "users",
        sa.Column("name", sa.String(), nullable=True)
    )
    op.add_column(
        "users",
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True)
    )

    # Create team_invites table
    op.create_table(
        "team_invites",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("token", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("invited_by_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.ForeignKeyConstraint(["invited_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_team_invites_email", "team_invites", ["email"])
    op.create_index("ix_team_invites_token", "team_invites", ["token"], unique=True)


def downgrade() -> None:
    op.drop_table("team_invites")
    
    op.drop_column("users", "last_login_at")
    op.drop_column("users", "name")
    op.drop_column("users", "role")
    
    op.drop_index("ix_accounts_stripe_customer_id", "accounts")
    op.drop_column("accounts", "updated_at")
    op.drop_column("accounts", "stripe_subscription_id")
    op.drop_column("accounts", "stripe_customer_id")
    op.drop_column("accounts", "max_users")
    op.drop_column("accounts", "plan")
