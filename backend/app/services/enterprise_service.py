"""
Enterprise service for SSO, audit logging, and enterprise features.
"""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session

from app.models.account import Account, AccountPlan
from app.models.user import User, UserRole
from app.models.enterprise import (
    SSOConfig,
    SSOProvider,
    SSOConfigStatus,
    AuditLog,
    AuditAction,
    AuditLogSeverity,
    DataRetentionPolicy,
    APIKey,
)


# ================== Plan Checking ==================

def is_enterprise_account(db: Session, account_id: str) -> bool:
    """Check if an account has enterprise features enabled."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return False
    # Enterprise plan or agency plan with enterprise add-on
    return account.plan in [AccountPlan.AGENCY]  # Add ENTERPRISE when plan exists


# ================== SSO Configuration ==================

def get_sso_config(db: Session, account_id: str) -> Optional[SSOConfig]:
    """Get SSO configuration for an account."""
    return db.query(SSOConfig).filter(SSOConfig.account_id == account_id).first()


def get_sso_config_by_domain(db: Session, domain: str) -> Optional[SSOConfig]:
    """Get SSO configuration by email domain for SSO routing."""
    return db.query(SSOConfig).filter(
        SSOConfig.domain == domain.lower(),
        SSOConfig.status == SSOConfigStatus.ACTIVE,
    ).first()


def create_sso_config(
    db: Session,
    account_id: str,
    provider: SSOProvider,
    **kwargs,
) -> SSOConfig:
    """Create a new SSO configuration."""
    config = SSOConfig(
        account_id=account_id,
        provider=provider,
        status=SSOConfigStatus.DRAFT,
        **kwargs,
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


def update_sso_config(
    db: Session,
    account_id: str,
    updates: Dict[str, Any],
) -> Optional[SSOConfig]:
    """Update SSO configuration."""
    config = get_sso_config(db, account_id)
    if not config:
        return None
    
    for key, value in updates.items():
        if hasattr(config, key):
            setattr(config, key, value)
    
    db.commit()
    db.refresh(config)
    return config


def delete_sso_config(db: Session, account_id: str) -> bool:
    """Delete SSO configuration."""
    config = get_sso_config(db, account_id)
    if not config:
        return False
    
    db.delete(config)
    db.commit()
    return True


def validate_sso_config(config: SSOConfig) -> Dict[str, Any]:
    """Validate SSO configuration is complete and correct."""
    errors = []
    warnings = []
    
    if config.provider == SSOProvider.SAML:
        if not config.saml_entity_id:
            errors.append("SAML Entity ID is required")
        if not config.saml_sso_url:
            errors.append("SAML SSO URL is required")
        if not config.saml_certificate:
            errors.append("SAML Certificate is required")
    elif config.provider in [SSOProvider.OIDC, SSOProvider.AZURE_AD, SSOProvider.OKTA, SSOProvider.GOOGLE_WORKSPACE]:
        if not config.oidc_issuer:
            errors.append("OIDC Issuer URL is required")
        if not config.oidc_client_id:
            errors.append("OIDC Client ID is required")
        if not config.oidc_client_secret:
            errors.append("OIDC Client Secret is required")
    
    if not config.domain:
        warnings.append("No email domain configured - SSO will not auto-route")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def get_sso_metadata(db: Session, account_id: str) -> Dict[str, Any]:
    """Get SAML Service Provider metadata for the account."""
    from app.config import settings
    
    base_url = settings.BACKEND_URL or "https://api.omnitrackiq.com"
    
    return {
        "entity_id": f"{base_url}/sso/saml/{account_id}/metadata",
        "acs_url": f"{base_url}/sso/saml/{account_id}/acs",
        "slo_url": f"{base_url}/sso/saml/{account_id}/slo",
        "name_id_format": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    }


# ================== Audit Logging ==================

def log_audit_event(
    db: Session,
    account_id: str,
    action: AuditAction,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    resource_name: Optional[str] = None,
    description: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    request_id: Optional[str] = None,
    success: bool = True,
    error_message: Optional[str] = None,
    severity: AuditLogSeverity = AuditLogSeverity.INFO,
) -> AuditLog:
    """Create an audit log entry."""
    log = AuditLog(
        account_id=account_id,
        user_id=user_id,
        user_email=user_email,
        action=action,
        severity=severity,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_name=resource_name,
        description=description,
        extra_data=metadata,  # renamed from 'metadata' to avoid SQLAlchemy conflict
        ip_address=ip_address,
        user_agent=user_agent,
        request_id=request_id,
        success=success,
        error_message=error_message,
    )
    db.add(log)
    db.commit()
    return log


def get_audit_logs(
    db: Session,
    account_id: str,
    action: Optional[AuditAction] = None,
    user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    severity: Optional[AuditLogSeverity] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[List[AuditLog], int]:
    """Get audit logs with filtering and pagination."""
    query = db.query(AuditLog).filter(AuditLog.account_id == account_id)
    
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    if severity:
        query = query.filter(AuditLog.severity == severity)
    if from_date:
        query = query.filter(AuditLog.created_at >= from_date)
    if to_date:
        query = query.filter(AuditLog.created_at <= to_date)
    
    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
    
    return logs, total


def get_audit_summary(
    db: Session,
    account_id: str,
    days: int = 30,
) -> Dict[str, Any]:
    """Get audit log summary statistics."""
    from sqlalchemy import func
    
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    base_query = db.query(AuditLog).filter(
        AuditLog.account_id == account_id,
        AuditLog.created_at >= cutoff,
    )
    
    total_events = base_query.count()
    
    by_action = dict(
        base_query.with_entities(
            AuditLog.action,
            func.count(AuditLog.id),
        ).group_by(AuditLog.action).all()
    )
    
    by_severity = dict(
        base_query.with_entities(
            AuditLog.severity,
            func.count(AuditLog.id),
        ).group_by(AuditLog.severity).all()
    )
    
    failed_events = base_query.filter(AuditLog.success == False).count()
    
    unique_users = base_query.filter(
        AuditLog.user_id.isnot(None)
    ).with_entities(AuditLog.user_id).distinct().count()
    
    return {
        "period_days": days,
        "total_events": total_events,
        "failed_events": failed_events,
        "unique_users": unique_users,
        "by_action": {k.value if hasattr(k, 'value') else k: v for k, v in by_action.items()},
        "by_severity": {k.value if hasattr(k, 'value') else k: v for k, v in by_severity.items()},
    }


# ================== Data Retention ==================

def get_retention_policy(db: Session, account_id: str) -> Optional[DataRetentionPolicy]:
    """Get data retention policy for an account."""
    return db.query(DataRetentionPolicy).filter(
        DataRetentionPolicy.account_id == account_id
    ).first()


def create_retention_policy(
    db: Session,
    account_id: str,
    **kwargs,
) -> DataRetentionPolicy:
    """Create a data retention policy."""
    policy = DataRetentionPolicy(
        account_id=account_id,
        **kwargs,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


def update_retention_policy(
    db: Session,
    account_id: str,
    updates: Dict[str, Any],
) -> Optional[DataRetentionPolicy]:
    """Update data retention policy."""
    policy = get_retention_policy(db, account_id)
    if not policy:
        return None
    
    for key, value in updates.items():
        if hasattr(policy, key):
            setattr(policy, key, value)
    
    db.commit()
    db.refresh(policy)
    return policy


# ================== API Keys ==================

def generate_api_key() -> tuple[str, str, str]:
    """
    Generate a new API key.
    Returns (full_key, key_prefix, key_hash).
    """
    # Generate a secure random key
    key = f"otiq_{secrets.token_urlsafe(32)}"
    prefix = key[:12]  # "otiq_" + first 7 chars
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    return key, prefix, key_hash


def create_api_key(
    db: Session,
    account_id: str,
    user_id: str,
    name: str,
    scopes: List[str] = None,
    allowed_ips: List[str] = None,
    rate_limit: Optional[int] = None,
    expires_in_days: Optional[int] = None,
) -> tuple[APIKey, str]:
    """
    Create a new API key.
    Returns (api_key_model, full_key).
    The full key is only available at creation time.
    """
    full_key, prefix, key_hash = generate_api_key()
    
    expires_at = None
    if expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
    
    api_key = APIKey(
        account_id=account_id,
        created_by_user_id=user_id,
        name=name,
        key_prefix=prefix,
        key_hash=key_hash,
        scopes=scopes or ["read"],
        allowed_ips=allowed_ips,
        rate_limit=rate_limit,
        expires_at=expires_at,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    return api_key, full_key


def validate_api_key(db: Session, key: str) -> Optional[APIKey]:
    """
    Validate an API key and return the key record if valid.
    Updates last_used_at and usage_count.
    """
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    prefix = key[:12]
    
    api_key = db.query(APIKey).filter(
        APIKey.key_prefix == prefix,
        APIKey.key_hash == key_hash,
        APIKey.is_active == True,
    ).first()
    
    if not api_key:
        return None
    
    # Check expiration
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        return None
    
    # Update usage
    api_key.last_used_at = datetime.utcnow()
    api_key.usage_count += 1
    db.commit()
    
    return api_key


def get_api_keys(db: Session, account_id: str, include_revoked: bool = False) -> List[APIKey]:
    """Get all API keys for an account."""
    query = db.query(APIKey).filter(APIKey.account_id == account_id)
    
    if not include_revoked:
        query = query.filter(APIKey.is_active == True)
    
    return query.order_by(APIKey.created_at.desc()).all()


def revoke_api_key(
    db: Session,
    key_id: str,
    account_id: str,
    revoked_by_user_id: str,
) -> bool:
    """Revoke an API key."""
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.account_id == account_id,
    ).first()
    
    if not api_key:
        return False
    
    api_key.is_active = False
    api_key.revoked_at = datetime.utcnow()
    api_key.revoked_by_user_id = revoked_by_user_id
    db.commit()
    
    return True


# ================== Enterprise Dashboard ==================

def get_enterprise_overview(db: Session, account_id: str) -> Dict[str, Any]:
    """Get enterprise features overview for an account."""
    sso_config = get_sso_config(db, account_id)
    retention_policy = get_retention_policy(db, account_id)
    api_keys = get_api_keys(db, account_id)
    audit_summary = get_audit_summary(db, account_id, days=7)
    
    return {
        "sso": {
            "configured": sso_config is not None,
            "provider": sso_config.provider.value if sso_config else None,
            "status": sso_config.status.value if sso_config else None,
            "enforce_sso": sso_config.enforce_sso if sso_config else False,
        },
        "data_retention": {
            "configured": retention_policy is not None,
            "auto_delete_enabled": retention_policy.auto_delete_enabled if retention_policy else False,
            "metrics_retention_days": retention_policy.metrics_retention_days if retention_policy else 730,
        },
        "api_keys": {
            "count": len(api_keys),
            "active_count": len([k for k in api_keys if k.is_active]),
        },
        "audit": audit_summary,
    }
