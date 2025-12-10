"""Add enterprise tables for SSO, audit logs, API keys, and data retention

Revision ID: 0011_enterprise
Revises: 0010_client_accounts
Create Date: 2024-12-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0011_enterprise'
down_revision = '0010_client_accounts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types (IF NOT EXISTS for idempotency)
    op.execute("DO $$ BEGIN CREATE TYPE ssoprovider AS ENUM ('saml', 'oidc', 'azure_ad', 'okta', 'google_workspace', 'onelogin'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE ssoconfigstatus AS ENUM ('draft', 'testing', 'active', 'disabled'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE auditaction AS ENUM ('login', 'logout', 'login_failed', 'sso_login', 'password_changed', 'password_reset', 'user_created', 'user_updated', 'user_deleted', 'user_invited', 'user_role_changed', 'account_updated', 'plan_changed', 'billing_updated', 'integration_connected', 'integration_disconnected', 'integration_synced', 'report_viewed', 'report_exported', 'data_exported', 'sso_config_updated', 'api_key_created', 'api_key_revoked', 'permission_changed', 'client_created', 'client_updated', 'client_archived', 'client_access_granted', 'client_access_revoked'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE auditlogseverity AS ENUM ('info', 'warning', 'critical'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    
    # Create sso_configs table
    op.create_table(
        'sso_configs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('account_id', sa.String(), sa.ForeignKey('accounts.id'), nullable=False, unique=True),
        
        # Provider configuration
        sa.Column('provider', sa.Enum('saml', 'oidc', 'azure_ad', 'okta', 'google_workspace', 'onelogin', name='ssoprovider', create_type=False), nullable=False, server_default='saml'),
        sa.Column('status', sa.Enum('draft', 'testing', 'active', 'disabled', name='ssoconfigstatus', create_type=False), nullable=False, server_default='draft'),
        
        # SAML configuration
        sa.Column('saml_entity_id', sa.String(), nullable=True),
        sa.Column('saml_sso_url', sa.String(), nullable=True),
        sa.Column('saml_slo_url', sa.String(), nullable=True),
        sa.Column('saml_certificate', sa.Text(), nullable=True),
        sa.Column('saml_name_id_format', sa.String(), nullable=True, server_default='urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'),
        
        # OIDC configuration
        sa.Column('oidc_issuer', sa.String(), nullable=True),
        sa.Column('oidc_client_id', sa.String(), nullable=True),
        sa.Column('oidc_client_secret', sa.String(), nullable=True),
        sa.Column('oidc_authorization_endpoint', sa.String(), nullable=True),
        sa.Column('oidc_token_endpoint', sa.String(), nullable=True),
        sa.Column('oidc_userinfo_endpoint', sa.String(), nullable=True),
        sa.Column('oidc_jwks_uri', sa.String(), nullable=True),
        
        # Common settings
        sa.Column('domain', sa.String(), nullable=True),
        sa.Column('enforce_sso', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('auto_provision', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('default_role', sa.String(), nullable=False, server_default='member'),
        sa.Column('attribute_mapping', sa.JSON(), nullable=False, server_default='{}'),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    # Create indexes for sso_configs
    op.create_index('ix_sso_configs_account_id', 'sso_configs', ['account_id'])
    op.create_index('ix_sso_configs_domain', 'sso_configs', ['domain'])
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('account_id', sa.String(), sa.ForeignKey('accounts.id'), nullable=False),
        
        # Actor information
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('user_email', sa.String(), nullable=True),
        
        # Action details
        sa.Column('action', sa.Enum('login', 'logout', 'login_failed', 'sso_login', 'password_changed', 'password_reset', 'user_created', 'user_updated', 'user_deleted', 'user_invited', 'user_role_changed', 'account_updated', 'plan_changed', 'billing_updated', 'integration_connected', 'integration_disconnected', 'integration_synced', 'report_viewed', 'report_exported', 'data_exported', 'sso_config_updated', 'api_key_created', 'api_key_revoked', 'permission_changed', 'client_created', 'client_updated', 'client_archived', 'client_access_granted', 'client_access_revoked', name='auditaction', create_type=False), nullable=False),
        sa.Column('severity', sa.Enum('info', 'warning', 'critical', name='auditlogseverity', create_type=False), nullable=False, server_default='info'),
        
        # Target resource
        sa.Column('resource_type', sa.String(), nullable=True),
        sa.Column('resource_id', sa.String(), nullable=True),
        sa.Column('resource_name', sa.String(), nullable=True),
        
        # Context
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('extra_data', sa.JSON(), nullable=True),
        
        # Request information
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('request_id', sa.String(), nullable=True),
        
        # Status
        sa.Column('success', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('error_message', sa.String(), nullable=True),
        
        # Timestamp
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for audit_logs
    op.create_index('ix_audit_logs_account_id', 'audit_logs', ['account_id'])
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])
    op.create_index('ix_audit_logs_account_created', 'audit_logs', ['account_id', 'created_at'])
    
    # Create data_retention_policies table
    op.create_table(
        'data_retention_policies',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('account_id', sa.String(), sa.ForeignKey('accounts.id'), nullable=False, unique=True),
        
        # Retention periods (in days)
        sa.Column('metrics_retention_days', sa.Integer(), nullable=False, server_default='730'),
        sa.Column('orders_retention_days', sa.Integer(), nullable=False, server_default='1095'),
        sa.Column('audit_logs_retention_days', sa.Integer(), nullable=False, server_default='365'),
        sa.Column('reports_retention_days', sa.Integer(), nullable=False, server_default='365'),
        
        # Auto-deletion settings
        sa.Column('auto_delete_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('last_cleanup_at', sa.DateTime(timezone=True), nullable=True),
        
        # Export before deletion
        sa.Column('export_before_delete', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('export_destination', sa.String(), nullable=True),
        
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    
    # Create api_keys table
    op.create_table(
        'api_keys',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('account_id', sa.String(), sa.ForeignKey('accounts.id'), nullable=False),
        sa.Column('created_by_user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
        
        # Key details
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('key_prefix', sa.String(), nullable=False),
        sa.Column('key_hash', sa.String(), nullable=False),
        
        # Permissions
        sa.Column('scopes', sa.JSON(), nullable=False, server_default='["read"]'),
        
        # Restrictions
        sa.Column('allowed_ips', sa.JSON(), nullable=True),
        sa.Column('rate_limit', sa.Integer(), nullable=True),
        
        # Expiration
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        
        # Usage tracking
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_by_user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for api_keys
    op.create_index('ix_api_keys_account_id', 'api_keys', ['account_id'])
    op.create_index('ix_api_keys_key_prefix', 'api_keys', ['key_prefix'])
    op.create_index('ix_api_keys_is_active', 'api_keys', ['is_active'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_api_keys_is_active', table_name='api_keys')
    op.drop_index('ix_api_keys_key_prefix', table_name='api_keys')
    op.drop_index('ix_api_keys_account_id', table_name='api_keys')
    
    op.drop_index('ix_audit_logs_account_created', table_name='audit_logs')
    op.drop_index('ix_audit_logs_created_at', table_name='audit_logs')
    op.drop_index('ix_audit_logs_action', table_name='audit_logs')
    op.drop_index('ix_audit_logs_user_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_account_id', table_name='audit_logs')
    
    op.drop_index('ix_sso_configs_domain', table_name='sso_configs')
    op.drop_index('ix_sso_configs_account_id', table_name='sso_configs')
    
    # Drop tables
    op.drop_table('api_keys')
    op.drop_table('data_retention_policies')
    op.drop_table('audit_logs')
    op.drop_table('sso_configs')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS auditlogseverity')
    op.execute('DROP TYPE IF EXISTS auditaction')
    op.execute('DROP TYPE IF EXISTS ssoconfigstatus')
    op.execute('DROP TYPE IF EXISTS ssoprovider')
