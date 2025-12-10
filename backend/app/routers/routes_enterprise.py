"""
Enterprise routes for SSO, audit logging, API keys, and data retention.
These features are available on Enterprise plan accounts.
"""
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.enterprise import (
    SSOProvider,
    SSOConfigStatus,
    AuditAction,
    AuditLogSeverity,
)
from app.services import enterprise_service

router = APIRouter()


# ================== Pydantic Schemas ==================

# SSO Schemas
class SSOConfigCreate(BaseModel):
    provider: SSOProvider
    domain: Optional[str] = Field(None, description="Email domain for auto-routing (e.g., 'acme.com')")
    enforce_sso: bool = False
    auto_provision: bool = True
    default_role: str = "member"
    
    # SAML fields
    saml_entity_id: Optional[str] = None
    saml_sso_url: Optional[str] = None
    saml_slo_url: Optional[str] = None
    saml_certificate: Optional[str] = None
    saml_name_id_format: Optional[str] = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
    
    # OIDC fields
    oidc_issuer: Optional[str] = None
    oidc_client_id: Optional[str] = None
    oidc_client_secret: Optional[str] = None
    oidc_authorization_endpoint: Optional[str] = None
    oidc_token_endpoint: Optional[str] = None
    oidc_userinfo_endpoint: Optional[str] = None
    oidc_jwks_uri: Optional[str] = None
    
    # Attribute mapping
    attribute_mapping: Optional[dict] = None


class SSOConfigUpdate(BaseModel):
    provider: Optional[SSOProvider] = None
    status: Optional[SSOConfigStatus] = None
    domain: Optional[str] = None
    enforce_sso: Optional[bool] = None
    auto_provision: Optional[bool] = None
    default_role: Optional[str] = None
    
    # SAML fields
    saml_entity_id: Optional[str] = None
    saml_sso_url: Optional[str] = None
    saml_slo_url: Optional[str] = None
    saml_certificate: Optional[str] = None
    saml_name_id_format: Optional[str] = None
    
    # OIDC fields
    oidc_issuer: Optional[str] = None
    oidc_client_id: Optional[str] = None
    oidc_client_secret: Optional[str] = None
    oidc_authorization_endpoint: Optional[str] = None
    oidc_token_endpoint: Optional[str] = None
    oidc_userinfo_endpoint: Optional[str] = None
    oidc_jwks_uri: Optional[str] = None
    
    # Attribute mapping
    attribute_mapping: Optional[dict] = None


class SSOConfigResponse(BaseModel):
    id: str
    provider: str
    status: str
    domain: Optional[str]
    enforce_sso: bool
    auto_provision: bool
    default_role: str
    
    # SAML (redacted secrets)
    saml_entity_id: Optional[str]
    saml_sso_url: Optional[str]
    saml_slo_url: Optional[str]
    saml_certificate_configured: bool = False
    
    # OIDC (redacted secrets)
    oidc_issuer: Optional[str]
    oidc_client_id: Optional[str]
    oidc_client_secret_configured: bool = False
    
    attribute_mapping: dict
    created_at: str
    updated_at: Optional[str]
    last_login_at: Optional[str]

    class Config:
        from_attributes = True


class SSOMetadataResponse(BaseModel):
    entity_id: str
    acs_url: str
    slo_url: str
    name_id_format: str


class SSOValidationResponse(BaseModel):
    valid: bool
    errors: List[str]
    warnings: List[str]


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    user_email: Optional[str]
    action: str
    severity: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    resource_name: Optional[str]
    description: Optional[str]
    metadata: Optional[dict]
    ip_address: Optional[str]
    success: bool
    error_message: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    logs: List[AuditLogResponse]
    total: int
    limit: int
    offset: int


class AuditSummaryResponse(BaseModel):
    period_days: int
    total_events: int
    failed_events: int
    unique_users: int
    by_action: dict
    by_severity: dict


# Data Retention Schemas
class DataRetentionPolicyCreate(BaseModel):
    metrics_retention_days: int = Field(730, ge=30, le=3650)
    orders_retention_days: int = Field(1095, ge=30, le=3650)
    audit_logs_retention_days: int = Field(365, ge=30, le=3650)
    reports_retention_days: int = Field(365, ge=30, le=3650)
    auto_delete_enabled: bool = False
    export_before_delete: bool = True
    export_destination: Optional[str] = None


class DataRetentionPolicyUpdate(BaseModel):
    metrics_retention_days: Optional[int] = Field(None, ge=30, le=3650)
    orders_retention_days: Optional[int] = Field(None, ge=30, le=3650)
    audit_logs_retention_days: Optional[int] = Field(None, ge=30, le=3650)
    reports_retention_days: Optional[int] = Field(None, ge=30, le=3650)
    auto_delete_enabled: Optional[bool] = None
    export_before_delete: Optional[bool] = None
    export_destination: Optional[str] = None


class DataRetentionPolicyResponse(BaseModel):
    id: str
    metrics_retention_days: int
    orders_retention_days: int
    audit_logs_retention_days: int
    reports_retention_days: int
    auto_delete_enabled: bool
    export_before_delete: bool
    export_destination: Optional[str]
    last_cleanup_at: Optional[str]
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


# API Key Schemas
class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    scopes: List[str] = Field(default=["read"])
    allowed_ips: Optional[List[str]] = None
    rate_limit: Optional[int] = Field(None, ge=1, le=10000)
    expires_in_days: Optional[int] = Field(None, ge=1, le=365)


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    scopes: List[str]
    allowed_ips: Optional[List[str]]
    rate_limit: Optional[int]
    expires_at: Optional[str]
    last_used_at: Optional[str]
    usage_count: int
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class APIKeyCreatedResponse(BaseModel):
    """Response when creating an API key - includes full key (only shown once)."""
    api_key: APIKeyResponse
    full_key: str = Field(..., description="Full API key - only shown once at creation")


# Enterprise Overview
class EnterpriseOverviewResponse(BaseModel):
    sso: dict
    data_retention: dict
    api_keys: dict
    audit: dict


# ================== Dependency ==================

def require_enterprise_plan():
    """Dependency to ensure user has enterprise features enabled."""
    async def _require_enterprise(
        db: Session = Depends(get_db),
        user=Depends(get_current_account_user),
    ):
        if not enterprise_service.is_enterprise_account(db, user.account_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Enterprise plan required for these features"
            )
        return user
    return _require_enterprise


# ================== SSO Configuration Endpoints ==================

@router.get("/sso", response_model=Optional[SSOConfigResponse])
def get_sso_config(
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Get the SSO configuration for the current account.
    Returns null if SSO is not configured.
    """
    config = enterprise_service.get_sso_config(db, user.account_id)
    if not config:
        return None
    
    return SSOConfigResponse(
        id=config.id,
        provider=config.provider.value,
        status=config.status.value,
        domain=config.domain,
        enforce_sso=config.enforce_sso,
        auto_provision=config.auto_provision,
        default_role=config.default_role,
        saml_entity_id=config.saml_entity_id,
        saml_sso_url=config.saml_sso_url,
        saml_slo_url=config.saml_slo_url,
        saml_certificate_configured=bool(config.saml_certificate),
        oidc_issuer=config.oidc_issuer,
        oidc_client_id=config.oidc_client_id,
        oidc_client_secret_configured=bool(config.oidc_client_secret),
        attribute_mapping=config.attribute_mapping or {},
        created_at=config.created_at.isoformat() if config.created_at else None,
        updated_at=config.updated_at.isoformat() if config.updated_at else None,
        last_login_at=config.last_login_at.isoformat() if config.last_login_at else None,
    )


@router.post("/sso", response_model=SSOConfigResponse, status_code=status.HTTP_201_CREATED)
def create_sso_config(
    body: SSOConfigCreate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Create a new SSO configuration.
    Only one SSO configuration is allowed per account.
    """
    # Check if config already exists
    existing = enterprise_service.get_sso_config(db, user.account_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SSO configuration already exists. Use PUT to update."
        )
    
    config = enterprise_service.create_sso_config(
        db=db,
        account_id=user.account_id,
        provider=body.provider,
        domain=body.domain.lower() if body.domain else None,
        enforce_sso=body.enforce_sso,
        auto_provision=body.auto_provision,
        default_role=body.default_role,
        saml_entity_id=body.saml_entity_id,
        saml_sso_url=body.saml_sso_url,
        saml_slo_url=body.saml_slo_url,
        saml_certificate=body.saml_certificate,
        saml_name_id_format=body.saml_name_id_format,
        oidc_issuer=body.oidc_issuer,
        oidc_client_id=body.oidc_client_id,
        oidc_client_secret=body.oidc_client_secret,
        oidc_authorization_endpoint=body.oidc_authorization_endpoint,
        oidc_token_endpoint=body.oidc_token_endpoint,
        oidc_userinfo_endpoint=body.oidc_userinfo_endpoint,
        oidc_jwks_uri=body.oidc_jwks_uri,
        attribute_mapping=body.attribute_mapping,
    )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.SSO_CONFIG_UPDATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="sso_config",
        resource_id=config.id,
        description=f"SSO configuration created with provider {body.provider.value}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return SSOConfigResponse(
        id=config.id,
        provider=config.provider.value,
        status=config.status.value,
        domain=config.domain,
        enforce_sso=config.enforce_sso,
        auto_provision=config.auto_provision,
        default_role=config.default_role,
        saml_entity_id=config.saml_entity_id,
        saml_sso_url=config.saml_sso_url,
        saml_slo_url=config.saml_slo_url,
        saml_certificate_configured=bool(config.saml_certificate),
        oidc_issuer=config.oidc_issuer,
        oidc_client_id=config.oidc_client_id,
        oidc_client_secret_configured=bool(config.oidc_client_secret),
        attribute_mapping=config.attribute_mapping or {},
        created_at=config.created_at.isoformat() if config.created_at else None,
        updated_at=config.updated_at.isoformat() if config.updated_at else None,
        last_login_at=None,
    )


@router.put("/sso", response_model=SSOConfigResponse)
def update_sso_config(
    body: SSOConfigUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Update the SSO configuration.
    """
    updates = body.model_dump(exclude_unset=True)
    if "domain" in updates and updates["domain"]:
        updates["domain"] = updates["domain"].lower()
    
    config = enterprise_service.update_sso_config(db, user.account_id, updates)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSO configuration not found"
        )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.SSO_CONFIG_UPDATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="sso_config",
        resource_id=config.id,
        description="SSO configuration updated",
        metadata={"updated_fields": list(updates.keys())},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return SSOConfigResponse(
        id=config.id,
        provider=config.provider.value,
        status=config.status.value,
        domain=config.domain,
        enforce_sso=config.enforce_sso,
        auto_provision=config.auto_provision,
        default_role=config.default_role,
        saml_entity_id=config.saml_entity_id,
        saml_sso_url=config.saml_sso_url,
        saml_slo_url=config.saml_slo_url,
        saml_certificate_configured=bool(config.saml_certificate),
        oidc_issuer=config.oidc_issuer,
        oidc_client_id=config.oidc_client_id,
        oidc_client_secret_configured=bool(config.oidc_client_secret),
        attribute_mapping=config.attribute_mapping or {},
        created_at=config.created_at.isoformat() if config.created_at else None,
        updated_at=config.updated_at.isoformat() if config.updated_at else None,
        last_login_at=config.last_login_at.isoformat() if config.last_login_at else None,
    )


@router.delete("/sso", status_code=status.HTTP_204_NO_CONTENT)
def delete_sso_config(
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Delete the SSO configuration.
    Users will need to use password authentication after this.
    """
    config = enterprise_service.get_sso_config(db, user.account_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSO configuration not found"
        )
    
    config_id = config.id
    enterprise_service.delete_sso_config(db, user.account_id)
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.SSO_CONFIG_UPDATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="sso_config",
        resource_id=config_id,
        description="SSO configuration deleted",
        severity=AuditLogSeverity.WARNING,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return None


@router.get("/sso/metadata", response_model=SSOMetadataResponse)
def get_sso_metadata(
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Get SAML Service Provider metadata for identity provider configuration.
    Use these values when setting up your IdP (Okta, Azure AD, etc.)
    """
    metadata = enterprise_service.get_sso_metadata(db, user.account_id)
    return SSOMetadataResponse(**metadata)


@router.post("/sso/validate", response_model=SSOValidationResponse)
def validate_sso_config(
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Validate the current SSO configuration.
    Returns errors that must be fixed and warnings for potential issues.
    """
    config = enterprise_service.get_sso_config(db, user.account_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSO configuration not found"
        )
    
    result = enterprise_service.validate_sso_config(config)
    return SSOValidationResponse(**result)


@router.post("/sso/activate", response_model=SSOConfigResponse)
def activate_sso_config(
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Activate the SSO configuration after testing.
    Validates the configuration before activation.
    """
    config = enterprise_service.get_sso_config(db, user.account_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SSO configuration not found"
        )
    
    # Validate before activation
    validation = enterprise_service.validate_sso_config(config)
    if not validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "SSO configuration is invalid",
                "errors": validation["errors"]
            }
        )
    
    config = enterprise_service.update_sso_config(
        db, user.account_id, {"status": SSOConfigStatus.ACTIVE}
    )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.SSO_CONFIG_UPDATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="sso_config",
        resource_id=config.id,
        description="SSO configuration activated",
        severity=AuditLogSeverity.WARNING,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return SSOConfigResponse(
        id=config.id,
        provider=config.provider.value,
        status=config.status.value,
        domain=config.domain,
        enforce_sso=config.enforce_sso,
        auto_provision=config.auto_provision,
        default_role=config.default_role,
        saml_entity_id=config.saml_entity_id,
        saml_sso_url=config.saml_sso_url,
        saml_slo_url=config.saml_slo_url,
        saml_certificate_configured=bool(config.saml_certificate),
        oidc_issuer=config.oidc_issuer,
        oidc_client_id=config.oidc_client_id,
        oidc_client_secret_configured=bool(config.oidc_client_secret),
        attribute_mapping=config.attribute_mapping or {},
        created_at=config.created_at.isoformat() if config.created_at else None,
        updated_at=config.updated_at.isoformat() if config.updated_at else None,
        last_login_at=config.last_login_at.isoformat() if config.last_login_at else None,
    )


# ================== Audit Log Endpoints ==================

@router.get("/audit-logs", response_model=AuditLogListResponse)
def list_audit_logs(
    action: Optional[AuditAction] = Query(None, description="Filter by action type"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    severity: Optional[AuditLogSeverity] = Query(None, description="Filter by severity"),
    from_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    to_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    List audit logs with filtering and pagination.
    Returns security-relevant events for compliance and monitoring.
    """
    logs, total = enterprise_service.get_audit_logs(
        db=db,
        account_id=user.account_id,
        action=action,
        user_id=user_id,
        resource_type=resource_type,
        severity=severity,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
    )
    
    return AuditLogListResponse(
        logs=[
            AuditLogResponse(
                id=log.id,
                user_id=log.user_id,
                user_email=log.user_email,
                action=log.action.value,
                severity=log.severity.value,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                resource_name=log.resource_name,
                description=log.description,
                metadata=log.extra_data,  # renamed from 'metadata' in model
                ip_address=log.ip_address,
                success=log.success,
                error_message=log.error_message,
                created_at=log.created_at.isoformat() if log.created_at else None,
            )
            for log in logs
        ],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/audit-logs/summary", response_model=AuditSummaryResponse)
def get_audit_summary(
    days: int = Query(30, ge=1, le=365, description="Number of days to summarize"),
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Get audit log summary statistics.
    Provides an overview of security events over the specified period.
    """
    summary = enterprise_service.get_audit_summary(db, user.account_id, days)
    return AuditSummaryResponse(**summary)


# ================== Data Retention Endpoints ==================

@router.get("/retention", response_model=Optional[DataRetentionPolicyResponse])
def get_retention_policy(
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Get the data retention policy for the current account.
    Returns null if no custom policy is configured (defaults apply).
    """
    policy = enterprise_service.get_retention_policy(db, user.account_id)
    if not policy:
        return None
    
    return DataRetentionPolicyResponse(
        id=policy.id,
        metrics_retention_days=policy.metrics_retention_days,
        orders_retention_days=policy.orders_retention_days,
        audit_logs_retention_days=policy.audit_logs_retention_days,
        reports_retention_days=policy.reports_retention_days,
        auto_delete_enabled=policy.auto_delete_enabled,
        export_before_delete=policy.export_before_delete,
        export_destination=policy.export_destination,
        last_cleanup_at=policy.last_cleanup_at.isoformat() if policy.last_cleanup_at else None,
        created_at=policy.created_at.isoformat() if policy.created_at else None,
        updated_at=policy.updated_at.isoformat() if policy.updated_at else None,
    )


@router.post("/retention", response_model=DataRetentionPolicyResponse, status_code=status.HTTP_201_CREATED)
def create_retention_policy(
    body: DataRetentionPolicyCreate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Create a data retention policy.
    Only one policy is allowed per account.
    """
    existing = enterprise_service.get_retention_policy(db, user.account_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Retention policy already exists. Use PUT to update."
        )
    
    policy = enterprise_service.create_retention_policy(
        db=db,
        account_id=user.account_id,
        **body.model_dump(),
    )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.ACCOUNT_UPDATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="retention_policy",
        resource_id=policy.id,
        description="Data retention policy created",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return DataRetentionPolicyResponse(
        id=policy.id,
        metrics_retention_days=policy.metrics_retention_days,
        orders_retention_days=policy.orders_retention_days,
        audit_logs_retention_days=policy.audit_logs_retention_days,
        reports_retention_days=policy.reports_retention_days,
        auto_delete_enabled=policy.auto_delete_enabled,
        export_before_delete=policy.export_before_delete,
        export_destination=policy.export_destination,
        last_cleanup_at=None,
        created_at=policy.created_at.isoformat() if policy.created_at else None,
        updated_at=None,
    )


@router.put("/retention", response_model=DataRetentionPolicyResponse)
def update_retention_policy(
    body: DataRetentionPolicyUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Update the data retention policy.
    """
    updates = body.model_dump(exclude_unset=True)
    policy = enterprise_service.update_retention_policy(db, user.account_id, updates)
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Retention policy not found"
        )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.ACCOUNT_UPDATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="retention_policy",
        resource_id=policy.id,
        description="Data retention policy updated",
        metadata={"updated_fields": list(updates.keys())},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return DataRetentionPolicyResponse(
        id=policy.id,
        metrics_retention_days=policy.metrics_retention_days,
        orders_retention_days=policy.orders_retention_days,
        audit_logs_retention_days=policy.audit_logs_retention_days,
        reports_retention_days=policy.reports_retention_days,
        auto_delete_enabled=policy.auto_delete_enabled,
        export_before_delete=policy.export_before_delete,
        export_destination=policy.export_destination,
        last_cleanup_at=policy.last_cleanup_at.isoformat() if policy.last_cleanup_at else None,
        created_at=policy.created_at.isoformat() if policy.created_at else None,
        updated_at=policy.updated_at.isoformat() if policy.updated_at else None,
    )


# ================== API Key Endpoints ==================

@router.get("/api-keys", response_model=List[APIKeyResponse])
def list_api_keys(
    include_revoked: bool = Query(False, description="Include revoked keys"),
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    List all API keys for the account.
    Does not include the full key values (only shown at creation).
    """
    keys = enterprise_service.get_api_keys(db, user.account_id, include_revoked)
    
    return [
        APIKeyResponse(
            id=key.id,
            name=key.name,
            key_prefix=key.key_prefix,
            scopes=key.scopes or ["read"],
            allowed_ips=key.allowed_ips,
            rate_limit=key.rate_limit,
            expires_at=key.expires_at.isoformat() if key.expires_at else None,
            last_used_at=key.last_used_at.isoformat() if key.last_used_at else None,
            usage_count=key.usage_count,
            is_active=key.is_active,
            created_at=key.created_at.isoformat() if key.created_at else None,
        )
        for key in keys
    ]


@router.post("/api-keys", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    body: APIKeyCreate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Create a new API key.
    
    **Important**: The full API key is only returned once at creation.
    Store it securely - it cannot be retrieved again.
    """
    # Validate scopes
    valid_scopes = {"read", "write", "admin"}
    if not set(body.scopes).issubset(valid_scopes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scopes. Valid options: {valid_scopes}"
        )
    
    api_key, full_key = enterprise_service.create_api_key(
        db=db,
        account_id=user.account_id,
        user_id=user.id,
        name=body.name,
        scopes=body.scopes,
        allowed_ips=body.allowed_ips,
        rate_limit=body.rate_limit,
        expires_in_days=body.expires_in_days,
    )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.API_KEY_CREATED,
        user_id=user.id,
        user_email=user.email,
        resource_type="api_key",
        resource_id=api_key.id,
        resource_name=api_key.name,
        description=f"API key '{body.name}' created with scopes: {body.scopes}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return APIKeyCreatedResponse(
        api_key=APIKeyResponse(
            id=api_key.id,
            name=api_key.name,
            key_prefix=api_key.key_prefix,
            scopes=api_key.scopes or ["read"],
            allowed_ips=api_key.allowed_ips,
            rate_limit=api_key.rate_limit,
            expires_at=api_key.expires_at.isoformat() if api_key.expires_at else None,
            last_used_at=None,
            usage_count=0,
            is_active=True,
            created_at=api_key.created_at.isoformat() if api_key.created_at else None,
        ),
        full_key=full_key,
    )


@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    key_id: str,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Revoke an API key.
    The key will immediately stop working for all requests.
    """
    # Get key name before revoking for audit log
    keys = enterprise_service.get_api_keys(db, user.account_id, include_revoked=True)
    key = next((k for k in keys if k.id == key_id), None)
    
    success = enterprise_service.revoke_api_key(
        db=db,
        key_id=key_id,
        account_id=user.account_id,
        revoked_by_user_id=user.id,
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Log audit event
    enterprise_service.log_audit_event(
        db=db,
        account_id=user.account_id,
        action=AuditAction.API_KEY_REVOKED,
        user_id=user.id,
        user_email=user.email,
        resource_type="api_key",
        resource_id=key_id,
        resource_name=key.name if key else None,
        description=f"API key '{key.name if key else key_id}' revoked",
        severity=AuditLogSeverity.WARNING,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
    return None


# ================== Enterprise Overview ==================

@router.get("/overview", response_model=EnterpriseOverviewResponse)
def get_enterprise_overview(
    db: Session = Depends(get_db),
    user=Depends(require_enterprise_plan()),
):
    """
    Get an overview of enterprise features configuration and status.
    Useful for dashboards and monitoring.
    """
    overview = enterprise_service.get_enterprise_overview(db, user.account_id)
    return EnterpriseOverviewResponse(**overview)
