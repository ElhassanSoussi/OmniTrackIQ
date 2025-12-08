"""
Service for saved view management.
"""
import json
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.saved_view import SavedView, ViewType
from app.schemas.saved_view import SavedViewCreate, SavedViewUpdate, SavedViewConfig


def get_saved_views(
    db: Session,
    account_id: str,
    user_id: str,
    view_type: Optional[ViewType] = None,
    include_shared: bool = True,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[int, List[SavedView]]:
    """Get all saved views for an account (user's own + shared)."""
    query = db.query(SavedView).filter(SavedView.account_id == account_id)
    
    if include_shared:
        # User's own views + team shared views
        query = query.filter(
            (SavedView.user_id == user_id) | (SavedView.is_shared == "true")
        )
    else:
        query = query.filter(SavedView.user_id == user_id)
    
    if view_type:
        query = query.filter(SavedView.view_type == view_type)
    
    total = query.count()
    items = query.order_by(SavedView.created_at.desc()).offset(offset).limit(limit).all()
    
    return total, items


def get_saved_view(
    db: Session,
    view_id: str,
    account_id: str,
    user_id: str,
) -> Optional[SavedView]:
    """Get a specific saved view."""
    view = db.query(SavedView).filter(
        SavedView.id == view_id,
        SavedView.account_id == account_id,
    ).first()
    
    if not view:
        return None
    
    # Check access: owner or shared view
    if view.user_id != user_id and view.is_shared != "true":
        return None
    
    return view


def create_saved_view(
    db: Session,
    account_id: str,
    user_id: str,
    data: SavedViewCreate,
) -> SavedView:
    """Create a new saved view."""
    # If setting as default, unset other defaults for this user
    if data.is_default:
        db.query(SavedView).filter(
            SavedView.account_id == account_id,
            SavedView.user_id == user_id,
            SavedView.is_default == "true",
        ).update({SavedView.is_default: "false"})
    
    view = SavedView(
        account_id=account_id,
        user_id=user_id,
        name=data.name,
        view_type=data.view_type,
        description=data.description,
        config_json=json.dumps(data.config.model_dump()),
        is_shared="true" if data.is_shared else "private",
        is_default="true" if data.is_default else "false",
    )
    
    db.add(view)
    db.commit()
    db.refresh(view)
    return view


def update_saved_view(
    db: Session,
    view: SavedView,
    user_id: str,
    data: SavedViewUpdate,
) -> Optional[SavedView]:
    """Update a saved view. Only owner can update."""
    if view.user_id != user_id:
        return None
    
    if data.name is not None:
        view.name = data.name
    
    if data.description is not None:
        view.description = data.description
    
    if data.config is not None:
        view.config_json = json.dumps(data.config.model_dump())
    
    if data.is_shared is not None:
        view.is_shared = "true" if data.is_shared else "private"
    
    if data.is_default is not None:
        if data.is_default:
            # Unset other defaults for this user
            db.query(SavedView).filter(
                SavedView.account_id == view.account_id,
                SavedView.user_id == user_id,
                SavedView.id != view.id,
                SavedView.is_default == "true",
            ).update({SavedView.is_default: "false"})
        view.is_default = "true" if data.is_default else "false"
    
    db.commit()
    db.refresh(view)
    return view


def delete_saved_view(
    db: Session,
    view: SavedView,
    user_id: str,
) -> bool:
    """Delete a saved view. Only owner can delete."""
    if view.user_id != user_id:
        return False
    
    db.delete(view)
    db.commit()
    return True


def get_default_view(
    db: Session,
    account_id: str,
    user_id: str,
) -> Optional[SavedView]:
    """Get user's default view."""
    return db.query(SavedView).filter(
        SavedView.account_id == account_id,
        SavedView.user_id == user_id,
        SavedView.is_default == "true",
    ).first()


def view_to_response(view: SavedView) -> dict:
    """Convert a SavedView model to response dict."""
    config = json.loads(view.config_json) if view.config_json else {}
    return {
        "id": view.id,
        "name": view.name,
        "view_type": view.view_type,
        "description": view.description,
        "config": SavedViewConfig(**config),
        "is_shared": view.is_shared == "true",
        "is_default": view.is_default == "true",
        "created_at": view.created_at,
        "updated_at": view.updated_at,
        "user_id": view.user_id,
    }
