"""Add enterprise tables for SSO, audit logs, API keys, and data retention

Revision ID: 0011_enterprise
Revises: 0010_client_accounts
Create Date: 2024-12-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0011_enterprise'
down_revision = '0010_client_accounts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop enum types if they exist (from partial previous migration)
    op.execute("DROP TYPE IF EXISTS ssoprovider CASCADE")
    op.execute("DROP TYPE IF EXISTS ssoconfigstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS auditaction CASCADE")
    op.execute("DROP TYPE IF EXISTS auditlogseverity CASCADE")
    
    # Drop tables if they exist (from partial previous migration)
    op.execute("DROP TABLE IF EXISTS api_keys CASCADE")
    op.execute("DROP TABLE IF EXISTS data_retention_policies CASCADE")
    op.execute("DROP TABLE IF EXISTS audit_logs CASCADE")
    op.execute("DROP TABLE IF EXISTS sso_configs CASCADE")
    
    # Create enum types using raw SQL
    op.execute("CREATE TYPE ssoprovider AS ENUM ('saml', 'oidc', 'azure_ad', 'okta', 'google_workspace', 'onelogin')")
    op.execute("CREATE TYPE ssoconfigstatus AS ENUM ('draft', 'testing', 'active', 'disabled')")
    op.execute("CREATE TYPE auditaction AS ENUM ('login', 'logout', 'login_failed', 'sso_login', 'password_changed', 'password_reset', 'user_created', 'user_updated', 'user_deleted', 'user_invited', 'user_role_changed', 'account_updated', 'plan_changed', 'billing_updated', 'integration_connected', 'integration_disconnected', 'integration_synced', 'report_viewed', 'report_exported', 'data_exported', 'sso_config_updated', 'api_key_created', 'api_key_revoked', 'permission_changed', 'client_created', 'client_updated', 'client_archived', 'client_access_granted', 'client_access_revoked')")
    op.execute("CREATE TYPE auditlogseverity AS ENUM ('info', 'warning', 'critical')")
    
    # Create sso_configs table using VARCHAR and raw SQL for enum columns
    op.execute("""
        CREATE TABLE sso_configs (
            id VARCHAR NOT NULL PRIMARY KEY,
            account_id VARCHAR NOT NULL REFERENCES accounts(id),
            
            -- Provider configuration (using created enum types)
            provider ssoprovider NOT NULL DEFAULT 'saml',
            status ssoconfigstatus NOT NULL DEFAULT 'draft',
            
            -- SAML configuration
            saml_entity_id VARCHAR,
            saml_sso_url VARCHAR,
            saml_slo_url VARCHAR,
            saml_certificate TEXT,
            saml_name_id_format VARCHAR DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            
            -- OIDC configuration
            oidc_issuer VARCHAR,
            oidc_client_id VARCHAR,
            oidc_client_secret VARCHAR,
            oidc_authorization_endpoint VARCHAR,
            oidc_token_endpoint VARCHAR,
            oidc_userinfo_endpoint VARCHAR,
            oidc_jwks_uri VARCHAR,
            
            -- Common settings
            domain VARCHAR,
            enforce_sso BOOLEAN NOT NULL DEFAULT false,
            auto_provision BOOLEAN NOT NULL DEFAULT true,
            default_role VARCHAR NOT NULL DEFAULT 'member',
            attribute_mapping JSONB NOT NULL DEFAULT '{}',
            
            -- Metadata
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE,
            last_login_at TIMESTAMP WITH TIME ZONE,
            
            CONSTRAINT uq_sso_configs_account_id UNIQUE (account_id)
        )
    """)
    
    # Create indexes for sso_configs
    op.create_index('ix_sso_configs_account_id', 'sso_configs', ['account_id'])
    op.create_index('ix_sso_configs_domain', 'sso_configs', ['domain'])
    
    # Create audit_logs table using raw SQL
    op.execute("""
        CREATE TABLE audit_logs (
            id VARCHAR NOT NULL PRIMARY KEY,
            account_id VARCHAR NOT NULL REFERENCES accounts(id),
            
            -- Actor information
            user_id VARCHAR REFERENCES users(id),
            user_email VARCHAR,
            
            -- Action details (using created enum types)
            action auditaction NOT NULL,
            severity auditlogseverity NOT NULL DEFAULT 'info',
            
            -- Target resource
            resource_type VARCHAR,
            resource_id VARCHAR,
            resource_name VARCHAR,
            
            -- Context
            description VARCHAR,
            extra_data JSONB,
            
            -- Request information
            ip_address VARCHAR,
            user_agent VARCHAR,
            request_id VARCHAR,
            
            -- Status
            success BOOLEAN NOT NULL DEFAULT true,
            error_message VARCHAR,
            
            -- Timestamp
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    # Create indexes for audit_logs
    op.create_index('ix_audit_logs_account_id', 'audit_logs', ['account_id'])
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])
    op.create_index('ix_audit_logs_account_created', 'audit_logs', ['account_id', 'created_at'])
    
    # Create data_retention_policies table using raw SQL
    op.execute("""
        CREATE TABLE data_retention_policies (
            id VARCHAR NOT NULL PRIMARY KEY,
            account_id VARCHAR NOT NULL REFERENCES accounts(id),
            
            -- Retention periods (in days)
            metrics_retention_days INTEGER NOT NULL DEFAULT 730,
            orders_retention_days INTEGER NOT NULL DEFAULT 1095,
            audit_logs_retention_days INTEGER NOT NULL DEFAULT 365,
            reports_retention_days INTEGER NOT NULL DEFAULT 365,
            
            -- Auto-deletion settings
            auto_delete_enabled BOOLEAN NOT NULL DEFAULT false,
            last_cleanup_at TIMESTAMP WITH TIME ZONE,
            
            -- Export before deletion
            export_before_delete BOOLEAN NOT NULL DEFAULT true,
            export_destination VARCHAR,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE,
            
            CONSTRAINT uq_data_retention_policies_account_id UNIQUE (account_id)
        )
    """)
    
    # Create api_keys table using raw SQL
    op.execute("""
        CREATE TABLE api_keys (
            id VARCHAR NOT NULL PRIMARY KEY,
            account_id VARCHAR NOT NULL REFERENCES accounts(id),
            created_by_user_id VARCHAR NOT NULL REFERENCES users(id),
            
            -- Key details
            name VARCHAR NOT NULL,
            key_prefix VARCHAR NOT NULL,
            key_hash VARCHAR NOT NULL,
            
            -- Permissions
            scopes JSONB NOT NULL DEFAULT '["read"]',
            
            -- Restrictions
            allowed_ips JSONB,
            rate_limit INTEGER,
            
            -- Expiration
            expires_at TIMESTAMP WITH TIME ZONE,
            
            -- Usage tracking
            last_used_at TIMESTAMP WITH TIME ZONE,
            usage_count INTEGER NOT NULL DEFAULT 0,
            
            -- Status
            is_active BOOLEAN NOT NULL DEFAULT true,
            revoked_at TIMESTAMP WITH TIME ZONE,
            revoked_by_user_id VARCHAR REFERENCES users(id),
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
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
