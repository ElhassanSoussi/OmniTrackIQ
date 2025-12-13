"""Add AdAccount model and enhance DailyMetrics

Revision ID: 0006_metrics_backend
Revises: 0005_custom_reports
Create Date: 2025-12-08 00:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = "0006_metrics_backend"
down_revision = "0005_custom_reports"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ad_accounts table
    op.create_table(
        "ad_accounts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("account_id", sa.String(), nullable=False),
        sa.Column("integration_id", sa.String(), nullable=True),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("external_id", sa.String(), nullable=False),
        sa.Column("external_name", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("currency", sa.String(), server_default="USD"),
        sa.Column("timezone", sa.String(), nullable=True),
        sa.Column("meta_data", sa.Text(), nullable=True),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["account_id"], ["accounts.id"]),
        sa.ForeignKeyConstraint(["integration_id"], ["integrations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    
    # Create indexes for ad_accounts
    op.create_index("ix_ad_accounts_account_id", "ad_accounts", ["account_id"])
    op.create_index("ix_ad_accounts_account_id_platform", "ad_accounts", ["account_id", "platform"])
    op.create_index("ix_ad_accounts_account_id_external_id", "ad_accounts", ["account_id", "external_id"])
    op.create_index("ix_ad_accounts_account_id_status", "ad_accounts", ["account_id", "status"])
    
    # Add new columns to daily_metrics table
    op.add_column("daily_metrics", sa.Column("channel", sa.String(), nullable=True))
    op.add_column("daily_metrics", sa.Column("ad_account_id", sa.String(), nullable=True))
    op.add_column("daily_metrics", sa.Column("campaign_id", sa.String(), nullable=True))
    op.add_column("daily_metrics", sa.Column("campaign_name", sa.String(), nullable=True))
    op.add_column("daily_metrics", sa.Column("total_conversions", sa.Integer(), nullable=False, server_default="0"))
    
    # Add foreign key for ad_account_id
    with op.batch_alter_table("daily_metrics") as batch_op:
        batch_op.create_foreign_key(
            "fk_daily_metrics_ad_account_id",
            "ad_accounts",
            ["ad_account_id"],
            ["id"],
        )
    
    # Create indexes for daily_metrics
    op.create_index("ix_daily_metrics_account_id", "daily_metrics", ["account_id"])
    op.create_index("ix_daily_metrics_date", "daily_metrics", ["date"])
    op.create_index("ix_daily_metrics_account_date", "daily_metrics", ["account_id", "date"])
    op.create_index("ix_daily_metrics_account_date_channel", "daily_metrics", ["account_id", "date", "channel"])
    op.create_index("ix_daily_metrics_account_channel_campaign", "daily_metrics", ["account_id", "channel", "campaign_id"])
    op.create_index("ix_daily_metrics_account_ad_account", "daily_metrics", ["account_id", "ad_account_id"])


def downgrade() -> None:
    # Drop indexes on daily_metrics
    op.drop_index("ix_daily_metrics_account_ad_account", table_name="daily_metrics")
    op.drop_index("ix_daily_metrics_account_channel_campaign", table_name="daily_metrics")
    op.drop_index("ix_daily_metrics_account_date_channel", table_name="daily_metrics")
    op.drop_index("ix_daily_metrics_account_date", table_name="daily_metrics")
    op.drop_index("ix_daily_metrics_date", table_name="daily_metrics")
    op.drop_index("ix_daily_metrics_account_id", table_name="daily_metrics")
    
    # Drop foreign key
    with op.batch_alter_table("daily_metrics") as batch_op:
        batch_op.drop_constraint("fk_daily_metrics_ad_account_id", type_="foreignkey")
    
    # Drop new columns from daily_metrics
    op.drop_column("daily_metrics", "total_conversions")
    op.drop_column("daily_metrics", "campaign_name")
    op.drop_column("daily_metrics", "campaign_id")
    op.drop_column("daily_metrics", "ad_account_id")
    op.drop_column("daily_metrics", "channel")
    
    # Drop indexes on ad_accounts
    op.drop_index("ix_ad_accounts_account_id_status", table_name="ad_accounts")
    op.drop_index("ix_ad_accounts_account_id_external_id", table_name="ad_accounts")
    op.drop_index("ix_ad_accounts_account_id_platform", table_name="ad_accounts")
    op.drop_index("ix_ad_accounts_account_id", table_name="ad_accounts")
    
    # Drop ad_accounts table
    op.drop_table("ad_accounts")
