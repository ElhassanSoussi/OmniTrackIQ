"""
Agency service for multi-client management.
Handles client accounts, access control, and cross-client operations.
"""
import re
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Any
from collections import defaultdict

from sqlalchemy import func, and_, desc
from sqlalchemy.orm import Session

from app.models.client_account import ClientAccount, ClientUserAccess, ClientStatus
from app.models.account import Account, AccountPlan
from app.models.user import User, UserRole
from app.models.ad_spend import AdSpend
from app.models.order import Order


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def is_agency_account(db: Session, account_id: str) -> bool:
    """Check if account has agency plan."""
    account = db.query(Account).filter(Account.id == account_id).first()
    return account and account.plan == AccountPlan.AGENCY


def get_client_accounts(
    db: Session,
    agency_account_id: str,
    user_id: Optional[str] = None,
    status: Optional[ClientStatus] = None,
    search: Optional[str] = None,
) -> List[ClientAccount]:
    """
    Get all client accounts for an agency.
    Optionally filter by user access, status, or search term.
    """
    query = db.query(ClientAccount).filter(
        ClientAccount.agency_account_id == agency_account_id
    )
    
    # Filter by user access if not admin
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role not in [UserRole.OWNER, UserRole.ADMIN]:
            # Non-admin users only see clients they have explicit access to
            accessible_ids = db.query(ClientUserAccess.client_account_id).filter(
                ClientUserAccess.user_id == user_id,
                ClientUserAccess.can_view == True
            ).subquery()
            query = query.filter(ClientAccount.id.in_(accessible_ids))
    
    if status:
        query = query.filter(ClientAccount.status == status)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ClientAccount.name.ilike(search_term)) |
            (ClientAccount.industry.ilike(search_term))
        )
    
    return query.order_by(desc(ClientAccount.last_accessed_at), ClientAccount.name).all()


def get_client_account(
    db: Session,
    client_id: str,
    agency_account_id: str,
) -> Optional[ClientAccount]:
    """Get a specific client account."""
    return db.query(ClientAccount).filter(
        ClientAccount.id == client_id,
        ClientAccount.agency_account_id == agency_account_id
    ).first()


def get_client_by_slug(
    db: Session,
    slug: str,
    agency_account_id: str,
) -> Optional[ClientAccount]:
    """Get a client account by slug."""
    return db.query(ClientAccount).filter(
        ClientAccount.slug == slug,
        ClientAccount.agency_account_id == agency_account_id
    ).first()


def create_client_account(
    db: Session,
    agency_account_id: str,
    name: str,
    industry: Optional[str] = None,
    website: Optional[str] = None,
    primary_contact_name: Optional[str] = None,
    primary_contact_email: Optional[str] = None,
    internal_notes: Optional[str] = None,
) -> ClientAccount:
    """Create a new client account for an agency."""
    # Generate unique slug
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    
    while get_client_by_slug(db, slug, agency_account_id):
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    client = ClientAccount(
        agency_account_id=agency_account_id,
        name=name,
        slug=slug,
        industry=industry,
        website=website,
        primary_contact_name=primary_contact_name,
        primary_contact_email=primary_contact_email,
        internal_notes=internal_notes,
        status=ClientStatus.PENDING_SETUP,
    )
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    return client


def update_client_account(
    db: Session,
    client_id: str,
    agency_account_id: str,
    updates: Dict[str, Any],
) -> Optional[ClientAccount]:
    """Update a client account."""
    client = get_client_account(db, client_id, agency_account_id)
    if not client:
        return None
    
    allowed_fields = [
        "name", "industry", "website", "logo_url", "status",
        "primary_contact_name", "primary_contact_email", "internal_notes",
        "settings", "branding"
    ]
    
    for field, value in updates.items():
        if field in allowed_fields and hasattr(client, field):
            setattr(client, field, value)
    
    # Update slug if name changed
    if "name" in updates:
        base_slug = slugify(updates["name"])
        slug = base_slug
        counter = 1
        
        while True:
            existing = get_client_by_slug(db, slug, agency_account_id)
            if not existing or existing.id == client_id:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        client.slug = slug
    
    db.commit()
    db.refresh(client)
    
    return client


def delete_client_account(
    db: Session,
    client_id: str,
    agency_account_id: str,
) -> bool:
    """Delete a client account (or archive it)."""
    client = get_client_account(db, client_id, agency_account_id)
    if not client:
        return False
    
    # Soft delete by archiving
    client.status = ClientStatus.ARCHIVED
    db.commit()
    
    return True


def update_client_last_accessed(
    db: Session,
    client_id: str,
) -> None:
    """Update the last accessed timestamp for a client."""
    client = db.query(ClientAccount).filter(ClientAccount.id == client_id).first()
    if client:
        client.last_accessed_at = datetime.utcnow()
        db.commit()


# ================== User Access Management ==================

def get_client_users(
    db: Session,
    client_id: str,
) -> List[Dict[str, Any]]:
    """Get all users with access to a client."""
    access_records = db.query(ClientUserAccess).filter(
        ClientUserAccess.client_account_id == client_id
    ).all()
    
    result = []
    for access in access_records:
        user = access.user
        result.append({
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "can_view": access.can_view,
            "can_edit": access.can_edit,
            "can_manage": access.can_manage,
            "granted_at": access.created_at,
        })
    
    return result


def grant_client_access(
    db: Session,
    client_id: str,
    user_id: str,
    can_view: bool = True,
    can_edit: bool = False,
    can_manage: bool = False,
) -> ClientUserAccess:
    """Grant a user access to a client account."""
    # Check if access already exists
    existing = db.query(ClientUserAccess).filter(
        ClientUserAccess.client_account_id == client_id,
        ClientUserAccess.user_id == user_id
    ).first()
    
    if existing:
        existing.can_view = can_view
        existing.can_edit = can_edit
        existing.can_manage = can_manage
        db.commit()
        return existing
    
    access = ClientUserAccess(
        client_account_id=client_id,
        user_id=user_id,
        can_view=can_view,
        can_edit=can_edit,
        can_manage=can_manage,
    )
    
    db.add(access)
    db.commit()
    db.refresh(access)
    
    return access


def revoke_client_access(
    db: Session,
    client_id: str,
    user_id: str,
) -> bool:
    """Revoke a user's access to a client account."""
    access = db.query(ClientUserAccess).filter(
        ClientUserAccess.client_account_id == client_id,
        ClientUserAccess.user_id == user_id
    ).first()
    
    if access:
        db.delete(access)
        db.commit()
        return True
    
    return False


def check_client_access(
    db: Session,
    client_id: str,
    user_id: str,
    require_edit: bool = False,
    require_manage: bool = False,
) -> bool:
    """Check if a user has access to a client account."""
    # First check if user is owner/admin of the agency
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.role in [UserRole.OWNER, UserRole.ADMIN]:
        return True
    
    access = db.query(ClientUserAccess).filter(
        ClientUserAccess.client_account_id == client_id,
        ClientUserAccess.user_id == user_id
    ).first()
    
    if not access or not access.can_view:
        return False
    
    if require_manage and not access.can_manage:
        return False
    
    if require_edit and not access.can_edit:
        return False
    
    return True


# ================== Cross-Client Analytics ==================

def get_cross_client_summary(
    db: Session,
    agency_account_id: str,
    date_from: date,
    date_to: date,
) -> Dict[str, Any]:
    """
    Get summary metrics across all clients.
    Useful for agency-level dashboards.
    """
    # Get all active client IDs
    clients = db.query(ClientAccount).filter(
        ClientAccount.agency_account_id == agency_account_id,
        ClientAccount.status == ClientStatus.ACTIVE
    ).all()
    
    if not clients:
        return {
            "total_clients": 0,
            "total_spend": 0,
            "total_revenue": 0,
            "overall_roas": 0,
            "clients": [],
        }
    
    client_ids = [c.id for c in clients]
    
    # Note: In production, we'd need to link ad_spend/orders to client_accounts
    # For now, simulate with agency_account_id data
    
    # Get aggregated spend
    spend_query = db.query(
        func.sum(AdSpend.cost).label("total_spend"),
        func.sum(AdSpend.impressions).label("total_impressions"),
        func.sum(AdSpend.clicks).label("total_clicks"),
        func.sum(AdSpend.conversions).label("total_conversions"),
    ).filter(
        AdSpend.account_id == agency_account_id,
        AdSpend.date.between(date_from, date_to)
    ).first()
    
    # Get revenue
    revenue_query = db.query(
        func.sum(Order.total_amount).label("total_revenue"),
        func.count(Order.id).label("total_orders"),
    ).filter(
        Order.account_id == agency_account_id,
        Order.date_time.between(date_from, date_to)
    ).first()
    
    total_spend = float(spend_query.total_spend or 0)
    total_revenue = float(revenue_query.total_revenue or 0)
    
    # Build per-client summary (simulated)
    client_summaries = []
    for client in clients:
        # In production, query per-client data
        client_summaries.append({
            "id": client.id,
            "name": client.name,
            "slug": client.slug,
            "industry": client.industry,
            "status": client.status.value,
            "last_accessed": client.last_accessed_at.isoformat() if client.last_accessed_at else None,
        })
    
    return {
        "total_clients": len(clients),
        "active_clients": len([c for c in clients if c.status == ClientStatus.ACTIVE]),
        "total_spend": round(total_spend, 2),
        "total_revenue": round(total_revenue, 2),
        "overall_roas": round(total_revenue / total_spend, 2) if total_spend > 0 else 0,
        "total_impressions": int(spend_query.total_impressions or 0),
        "total_clicks": int(spend_query.total_clicks or 0),
        "total_conversions": int(spend_query.total_conversions or 0),
        "total_orders": int(revenue_query.total_orders or 0),
        "clients": client_summaries,
        "date_range": {"from": str(date_from), "to": str(date_to)},
    }


def get_client_benchmarks(
    db: Session,
    agency_account_id: str,
    date_from: date,
    date_to: date,
) -> List[Dict[str, Any]]:
    """
    Get performance benchmarks across all clients.
    Allows comparing clients against each other.
    """
    clients = db.query(ClientAccount).filter(
        ClientAccount.agency_account_id == agency_account_id,
        ClientAccount.status == ClientStatus.ACTIVE
    ).all()
    
    if not clients:
        return []
    
    # Calculate average metrics across all clients
    # In production, this would query per-client data
    
    benchmarks = []
    for client in clients:
        # Simulated data - in production, query actual client data
        benchmarks.append({
            "client_id": client.id,
            "client_name": client.name,
            "industry": client.industry,
            "metrics": {
                "spend": 0,
                "revenue": 0,
                "roas": 0,
                "cpa": 0,
                "ctr": 0,
            },
            "vs_average": {
                "roas": 0,
                "cpa": 0,
                "ctr": 0,
            },
            "rank": 0,
        })
    
    return benchmarks


# ================== White-Label Reports ==================

def get_white_label_config(
    db: Session,
    client_id: str,
) -> Dict[str, Any]:
    """Get white-label configuration for a client."""
    client = db.query(ClientAccount).filter(ClientAccount.id == client_id).first()
    
    if not client:
        return {}
    
    return {
        "enabled": client.settings.get("white_label", False),
        "branding": client.branding,
        "client_name": client.name,
        "logo_url": client.logo_url or client.branding.get("logo_url"),
    }


def update_white_label_config(
    db: Session,
    client_id: str,
    agency_account_id: str,
    branding: Dict[str, Any],
) -> Optional[ClientAccount]:
    """Update white-label branding for a client."""
    client = get_client_account(db, client_id, agency_account_id)
    
    if not client:
        return None
    
    # Merge with existing branding
    current_branding = client.branding or {}
    current_branding.update(branding)
    client.branding = current_branding
    
    # Enable white-label in settings
    settings = client.settings or {}
    settings["white_label"] = True
    client.settings = settings
    
    db.commit()
    db.refresh(client)
    
    return client
