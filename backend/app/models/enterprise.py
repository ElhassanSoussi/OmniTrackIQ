"""
Enterprise models for SSO configuration and audit logging.
These features are available on Enterprise plan accounts.
"""
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, String, Boolean, Integer, Enum as SQLEnum, Index, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class SSOProvider(str, Enum):
    """Supported SSO providers."""
    SAML = "saml"
    OIDC = "oidc"
    AZURE_AD = "azure_ad"
    OKTA = "okta"
    GOOGLE_WORKSPACE = "google_workspace"
    ONELOGIN = "onelogin"


class SSOConfigStatus(str, Enum):
    """SSO configuration status."""
    DRAFT = "draft"
    TESTING = "testing"
    ACTIVE = "active"
    DISABLED = "disabled"


class SSOConfig(Base):
    """
    SSO (Single Sign-On) configuration for an account.
    Supports SAML 2.0 and OIDC protocols.
    """
    __tablename__ = "sso_configs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, unique=True)
    
    # Provider configuration
    provider = Column(SQLEnum(SSOProvider), nullable=False, default=SSOProvider.SAML)
    status = Column(SQLEnum(SSOConfigStatus), nullable=False, default=SSOConfigStatus.DRAFT)
    
    # SAML configuration
    saml_entity_id = Column(String, nullable=True)  # Identity Provider Entity ID
    saml_sso_url = Column(String, nullable=True)  # SSO Login URL
    saml_slo_url = Column(String, nullable=True)  # Single Logout URL (optional)
    saml_certificate = Column(Text, nullable=True)  # X.509 Certificate (PEM format)
    saml_name_id_format = Column(String, nullable=True, default="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress")
    
    # OIDC configuration
    oidc_issuer = Column(String, nullable=True)  # Issuer URL
    oidc_client_id = Column(String, nullable=True)
    oidc_client_secret = Column(String, nullable=True)  # Encrypted
    oidc_authorization_endpoint = Column(String, nullable=True)
    oidc_token_endpoint = Column(String, nullable=True)
    oidc_userinfo_endpoint = Column(String, nullable=True)
    oidc_jwks_uri = Column(String, nullable=True)
    
    # Common settings
    domain = Column(String, nullable=True)  # Email domain for auto-routing (e.g., "acme.com")
    enforce_sso = Column(Boolean, nullable=False, default=False)  # Block password login when enabled
    auto_provision = Column(Boolean, nullable=False, default=True)  # Auto-create users on first SSO login
    default_role = Column(String, nullable=False, default="member")  # Role for auto-provisioned users
    
    # Attribute mapping (IdP attribute -> OmniTrackIQ field)
    attribute_mapping = Column(JSON, nullable=False, default=lambda: {
        "email": "email",
        "first_name": "firstName",
        "last_name": "lastName",
        "name": "displayName",
        "groups": "groups",
    })
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)  # Last successful SSO login
    
    # Relationships
    account = relationship("Account", backref="sso_config")
    
    __table_args__ = (
        Index("ix_sso_configs_account_id", "account_id"),
        Index("ix_sso_configs_domain", "domain"),
    )


class AuditAction(str, Enum):
    """Audit log action categories."""
    # Authentication
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    SSO_LOGIN = "sso_login"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET = "password_reset"
    
    # User management
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_INVITED = "user_invited"
    USER_ROLE_CHANGED = "user_role_changed"
    
    # Account management
    ACCOUNT_UPDATED = "account_updated"
    PLAN_CHANGED = "plan_changed"
    BILLING_UPDATED = "billing_updated"
    
    # Integration management
    INTEGRATION_CONNECTED = "integration_connected"
    INTEGRATION_DISCONNECTED = "integration_disconnected"
    INTEGRATION_SYNCED = "integration_synced"
    
    # Data access
    REPORT_VIEWED = "report_viewed"
    REPORT_EXPORTED = "report_exported"
    DATA_EXPORTED = "data_exported"
    
    # Security
    SSO_CONFIG_UPDATED = "sso_config_updated"
    API_KEY_CREATED = "api_key_created"
    API_KEY_REVOKED = "api_key_revoked"
    PERMISSION_CHANGED = "permission_changed"
    
    # Client management (Agency)
    CLIENT_CREATED = "client_created"
    CLIENT_UPDATED = "client_updated"
    CLIENT_ARCHIVED = "client_archived"
    CLIENT_ACCESS_GRANTED = "client_access_granted"
    CLIENT_ACCESS_REVOKED = "client_access_revoked"


class AuditLogSeverity(str, Enum):
    """Severity level for audit events."""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AuditLog(Base):
    """
    Audit log entry for tracking security-relevant actions.
    Provides compliance and security monitoring capabilities.
    """
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    
    # Actor information
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Null for system events
    user_email = Column(String, nullable=True)  # Denormalized for historical record
    
    # Action details
    action = Column(SQLEnum(AuditAction), nullable=False)
    severity = Column(SQLEnum(AuditLogSeverity), nullable=False, default=AuditLogSeverity.INFO)
    
    # Target resource
    resource_type = Column(String, nullable=True)  # e.g., "user", "integration", "report"
    resource_id = Column(String, nullable=True)
    resource_name = Column(String, nullable=True)  # Human-readable name
    
    # Context
    description = Column(String, nullable=True)  # Human-readable description
    extra_data = Column(JSON, nullable=True)  # Additional structured data (renamed from 'metadata')
    
    # Request information
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    request_id = Column(String, nullable=True)  # Correlation ID
    
    # Status
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(String, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    account = relationship("Account", backref="audit_logs")
    user = relationship("User", backref="audit_logs")
    
    __table_args__ = (
        Index("ix_audit_logs_account_id", "account_id"),
        Index("ix_audit_logs_user_id", "user_id"),
        Index("ix_audit_logs_action", "action"),
        Index("ix_audit_logs_created_at", "created_at"),
        Index("ix_audit_logs_account_created", "account_id", "created_at"),
    )


class DataRetentionPolicy(Base):
    """
    Data retention policy for an account.
    Defines how long different types of data are kept.
    """
    __tablename__ = "data_retention_policies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False, unique=True)
    
    # Retention periods (in days, 0 = indefinite)
    metrics_retention_days = Column(Integer, nullable=False, default=730)  # 2 years
    orders_retention_days = Column(Integer, nullable=False, default=1095)  # 3 years
    audit_logs_retention_days = Column(Integer, nullable=False, default=365)  # 1 year
    reports_retention_days = Column(Integer, nullable=False, default=365)  # 1 year
    
    # Auto-deletion settings
    auto_delete_enabled = Column(Boolean, nullable=False, default=False)
    last_cleanup_at = Column(DateTime(timezone=True), nullable=True)
    
    # Export before deletion
    export_before_delete = Column(Boolean, nullable=False, default=True)
    export_destination = Column(String, nullable=True)  # S3, GCS, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    account = relationship("Account", backref="data_retention_policy")


class APIKey(Base):
    """
    API keys for programmatic access.
    Enterprise feature for automation and integrations.
    """
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    created_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Key details
    name = Column(String, nullable=False)  # Human-readable name
    key_prefix = Column(String, nullable=False)  # First 8 chars for identification
    key_hash = Column(String, nullable=False)  # Hashed full key
    
    # Permissions
    scopes = Column(JSON, nullable=False, default=lambda: ["read"])  # read, write, admin
    
    # Restrictions
    allowed_ips = Column(JSON, nullable=True)  # IP whitelist
    rate_limit = Column(Integer, nullable=True)  # Requests per minute
    
    # Expiration
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Usage tracking
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    usage_count = Column(Integer, nullable=False, default=0)
    
    # Status
    is_active = Column(Boolean, nullable=False, default=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    account = relationship("Account", backref="api_keys")
    created_by = relationship("User", foreign_keys=[created_by_user_id], backref="created_api_keys")
    revoked_by = relationship("User", foreign_keys=[revoked_by_user_id])
    
    __table_args__ = (
        Index("ix_api_keys_account_id", "account_id"),
        Index("ix_api_keys_key_prefix", "key_prefix"),
        Index("ix_api_keys_is_active", "is_active"),
    )
