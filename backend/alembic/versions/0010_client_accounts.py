"""Add client accounts and user access tables for agency features

Revision ID: 0010_client_accounts
Revises: 0009_onboarding_fields
Create Date: 2024-12-09 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0010_client_accounts'
down_revision = '0009_onboarding_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create client_accounts table
    op.create_table(
        'client_accounts',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('agency_account_id', sa.String(), sa.ForeignKey('accounts.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('industry', sa.String(), nullable=True),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('active', 'paused', 'archived', 'pending_setup', name='clientstatus'), 
                  nullable=False, server_default='pending_setup'),
        sa.Column('settings', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('branding', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('primary_contact_name', sa.String(), nullable=True),
        sa.Column('primary_contact_email', sa.String(), nullable=True),
        sa.Column('internal_notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('last_accessed_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    # Create indexes for client_accounts
    op.create_index('ix_client_accounts_agency_id', 'client_accounts', ['agency_account_id'])
    op.create_index('ix_client_accounts_slug', 'client_accounts', ['agency_account_id', 'slug'], unique=True)
    op.create_index('ix_client_accounts_status', 'client_accounts', ['status'])
    
    # Create client_user_access table
    op.create_table(
        'client_user_access',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('client_account_id', sa.String(), sa.ForeignKey('client_accounts.id'), nullable=False),
        sa.Column('can_view', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('can_edit', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('can_manage', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for client_user_access
    op.create_index('ix_client_user_access_user_id', 'client_user_access', ['user_id'])
    op.create_index('ix_client_user_access_client_id', 'client_user_access', ['client_account_id'])
    op.create_index('ix_client_user_access_unique', 'client_user_access', ['user_id', 'client_account_id'], unique=True)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_client_user_access_unique', table_name='client_user_access')
    op.drop_index('ix_client_user_access_client_id', table_name='client_user_access')
    op.drop_index('ix_client_user_access_user_id', table_name='client_user_access')
    
    op.drop_index('ix_client_accounts_status', table_name='client_accounts')
    op.drop_index('ix_client_accounts_slug', table_name='client_accounts')
    op.drop_index('ix_client_accounts_agency_id', table_name='client_accounts')
    
    # Drop tables
    op.drop_table('client_user_access')
    op.drop_table('client_accounts')
    
    # Drop enum type
    op.execute('DROP TYPE IF EXISTS clientstatus')
