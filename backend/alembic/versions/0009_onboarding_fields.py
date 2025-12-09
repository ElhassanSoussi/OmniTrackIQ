"""Add onboarding fields to accounts table

Revision ID: 0009_onboarding_fields
Revises: 0008_notification_preferences
Create Date: 2024-12-08 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0009_onboarding_fields'
down_revision = '0008_notification_preferences'
branch_labels = None
depends_on = None

# Default onboarding steps
DEFAULT_ONBOARDING_STEPS = {
    "created_workspace": False,
    "connected_integration": False,
    "viewed_dashboard": False,
}


def upgrade() -> None:
    # Add onboarding_completed column
    op.add_column(
        'accounts',
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false')
    )
    
    # Add onboarding_steps JSON column
    op.add_column(
        'accounts',
        sa.Column('onboarding_steps', sa.JSON(), nullable=False, server_default='{}')
    )
    
    # Update existing accounts to have default onboarding steps
    # For existing accounts, we'll mark onboarding as completed since they're already using the system
    op.execute("""
        UPDATE accounts 
        SET onboarding_completed = true,
            onboarding_steps = '{"created_workspace": true, "connected_integration": true, "viewed_dashboard": true}'
    """)


def downgrade() -> None:
    op.drop_column('accounts', 'onboarding_steps')
    op.drop_column('accounts', 'onboarding_completed')
