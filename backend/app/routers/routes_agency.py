"""
Agency management routes for multi-client features.
"""
from datetime import date, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.account import AccountPlan
from app.models.client_account import ClientStatus
from app.services import agency_service

router = APIRouter()


# ================== Pydantic Schemas ==================

class ClientAccountCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    internal_notes: Optional[str] = None


class ClientAccountUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[ClientStatus] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    internal_notes: Optional[str] = None
    settings: Optional[dict] = None
    branding: Optional[dict] = None


class ClientAccessGrant(BaseModel):
    user_id: str
    can_view: bool = True
    can_edit: bool = False
    can_manage: bool = False


class WhiteLabelUpdate(BaseModel):
    primary_color: Optional[str] = None
    logo_url: Optional[str] = None
    company_name: Optional[str] = None
    report_footer: Optional[str] = None


class ClientAccountResponse(BaseModel):
    id: str
    name: str
    slug: str
    industry: Optional[str]
    website: Optional[str]
    logo_url: Optional[str]
    status: str
    primary_contact_name: Optional[str]
    primary_contact_email: Optional[str]
    settings: dict
    branding: dict
    created_at: str
    last_accessed_at: Optional[str]

    class Config:
        from_attributes = True


# ================== Dependency ==================

def require_agency_plan():
    """Dependency to ensure user has agency plan."""
    async def _require_agency(
        db: Session = Depends(get_db),
        user=Depends(get_current_account_user),
    ):
        if not agency_service.is_agency_account(db, user.account_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Agency plan required for multi-client features"
            )
        return user
    return _require_agency


# ================== Client Account Endpoints ==================

@router.get("/clients")
def list_clients(
    status: Optional[ClientStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name or industry"),
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """
    List all client accounts for the agency.
    Non-admin users only see clients they have access to.
    """
    clients = agency_service.get_client_accounts(
        db,
        user.account_id,
        user_id=user.id,
        status=status,
        search=search,
    )
    
    return {
        "clients": [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "industry": c.industry,
                "website": c.website,
                "logo_url": c.logo_url,
                "status": c.status.value,
                "primary_contact_name": c.primary_contact_name,
                "primary_contact_email": c.primary_contact_email,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "last_accessed_at": c.last_accessed_at.isoformat() if c.last_accessed_at else None,
            }
            for c in clients
        ],
        "total": len(clients),
    }


@router.post("/clients", status_code=status.HTTP_201_CREATED)
def create_client(
    body: ClientAccountCreate,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Create a new client account."""
    client = agency_service.create_client_account(
        db,
        user.account_id,
        name=body.name,
        industry=body.industry,
        website=body.website,
        primary_contact_name=body.primary_contact_name,
        primary_contact_email=body.primary_contact_email,
        internal_notes=body.internal_notes,
    )
    
    return {
        "id": client.id,
        "name": client.name,
        "slug": client.slug,
        "status": client.status.value,
        "created_at": client.created_at.isoformat(),
    }


@router.get("/clients/{client_id}")
def get_client(
    client_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Get details of a specific client account."""
    # Check access
    if not agency_service.check_client_access(db, client_id, user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this client"
        )
    
    client = agency_service.get_client_account(db, client_id, user.account_id)
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update last accessed
    agency_service.update_client_last_accessed(db, client_id)
    
    return {
        "id": client.id,
        "name": client.name,
        "slug": client.slug,
        "industry": client.industry,
        "website": client.website,
        "logo_url": client.logo_url,
        "status": client.status.value,
        "primary_contact_name": client.primary_contact_name,
        "primary_contact_email": client.primary_contact_email,
        "internal_notes": client.internal_notes,
        "settings": client.settings,
        "branding": client.branding,
        "created_at": client.created_at.isoformat() if client.created_at else None,
        "updated_at": client.updated_at.isoformat() if client.updated_at else None,
        "last_accessed_at": client.last_accessed_at.isoformat() if client.last_accessed_at else None,
    }


@router.patch("/clients/{client_id}")
def update_client(
    client_id: str,
    body: ClientAccountUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Update a client account."""
    # Check manage access
    if not agency_service.check_client_access(db, client_id, user.id, require_manage=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to manage this client"
        )
    
    updates = body.dict(exclude_unset=True)
    
    if "status" in updates and updates["status"]:
        updates["status"] = updates["status"]
    
    client = agency_service.update_client_account(
        db, client_id, user.account_id, updates
    )
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return {"message": "Client updated", "id": client.id}


@router.delete("/clients/{client_id}")
def archive_client(
    client_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Archive a client account (soft delete)."""
    # Check manage access
    if not agency_service.check_client_access(db, client_id, user.id, require_manage=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to manage this client"
        )
    
    success = agency_service.delete_client_account(db, client_id, user.account_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return {"message": "Client archived"}


# ================== Client Access Management ==================

@router.get("/clients/{client_id}/users")
def get_client_users(
    client_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Get users with access to a client."""
    if not agency_service.check_client_access(db, client_id, user.id, require_manage=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to manage this client"
        )
    
    users = agency_service.get_client_users(db, client_id)
    return {"users": users}


@router.post("/clients/{client_id}/users")
def grant_access(
    client_id: str,
    body: ClientAccessGrant,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Grant a user access to a client."""
    if not agency_service.check_client_access(db, client_id, user.id, require_manage=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to manage this client"
        )
    
    access = agency_service.grant_client_access(
        db, client_id, body.user_id,
        can_view=body.can_view,
        can_edit=body.can_edit,
        can_manage=body.can_manage,
    )
    
    return {"message": "Access granted", "access_id": access.id}


@router.delete("/clients/{client_id}/users/{user_id}")
def revoke_access(
    client_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Revoke a user's access to a client."""
    if not agency_service.check_client_access(db, client_id, user.id, require_manage=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to manage this client"
        )
    
    success = agency_service.revoke_client_access(db, client_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access record not found"
        )
    
    return {"message": "Access revoked"}


# ================== Cross-Client Analytics ==================

@router.get("/dashboard")
def agency_dashboard(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """
    Get agency-level dashboard with cross-client summary.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    summary = agency_service.get_cross_client_summary(
        db, user.account_id, from_date, to_date
    )
    
    return summary


@router.get("/benchmarks")
def client_benchmarks(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """
    Get performance benchmarks across all clients.
    """
    if not from_date:
        to_date = date.today()
        from_date = to_date - timedelta(days=30)
    
    benchmarks = agency_service.get_client_benchmarks(
        db, user.account_id, from_date, to_date
    )
    
    return {"benchmarks": benchmarks}


# ================== White-Label Configuration ==================

@router.get("/clients/{client_id}/branding")
def get_branding(
    client_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Get white-label branding configuration for a client."""
    if not agency_service.check_client_access(db, client_id, user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this client"
        )
    
    config = agency_service.get_white_label_config(db, client_id)
    return config


@router.patch("/clients/{client_id}/branding")
def update_branding(
    client_id: str,
    body: WhiteLabelUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """Update white-label branding for a client."""
    if not agency_service.check_client_access(db, client_id, user.id, require_manage=True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No permission to manage this client"
        )
    
    branding = body.dict(exclude_unset=True)
    
    client = agency_service.update_white_label_config(
        db, client_id, user.account_id, branding
    )
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return {"message": "Branding updated", "branding": client.branding}


# ================== Client Switching ==================

@router.post("/clients/{client_id}/switch")
def switch_to_client(
    client_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_agency_plan()),
):
    """
    Switch context to a specific client.
    Returns client details for frontend context switching.
    """
    if not agency_service.check_client_access(db, client_id, user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this client"
        )
    
    client = agency_service.get_client_account(db, client_id, user.account_id)
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update last accessed
    agency_service.update_client_last_accessed(db, client_id)
    
    return {
        "success": True,
        "client": {
            "id": client.id,
            "name": client.name,
            "slug": client.slug,
            "logo_url": client.logo_url,
            "branding": client.branding if client.settings.get("white_label") else None,
        }
    }
