"""Saved views CRUD endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.saved_view import ViewType
from app.schemas.saved_view import (
    SavedViewCreate,
    SavedViewUpdate,
    SavedViewResponse,
    SavedViewListResponse,
)
from app.services.saved_view_service import (
    get_saved_views,
    get_saved_view,
    create_saved_view,
    update_saved_view,
    delete_saved_view,
    get_default_view,
    view_to_response,
)

router = APIRouter()


@router.get("", response_model=SavedViewListResponse)
def list_saved_views(
    view_type: Optional[ViewType] = Query(None, description="Filter by view type"),
    include_shared: bool = Query(True, description="Include team shared views"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """List all saved views for the current user."""
    total, items = get_saved_views(
        db,
        account_id=user.account_id,
        user_id=user.id,
        view_type=view_type,
        include_shared=include_shared,
        limit=limit,
        offset=offset,
    )
    
    return {
        "items": [view_to_response(v) for v in items],
        "total": total,
    }


@router.get("/default", response_model=Optional[SavedViewResponse])
def get_user_default_view(
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get the user's default saved view."""
    view = get_default_view(db, account_id=user.account_id, user_id=user.id)
    if not view:
        return None
    return view_to_response(view)


@router.get("/{view_id}", response_model=SavedViewResponse)
def get_single_view(
    view_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get a specific saved view."""
    view = get_saved_view(db, view_id=view_id, account_id=user.account_id, user_id=user.id)
    if not view:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved view not found",
        )
    return view_to_response(view)


@router.post("", response_model=SavedViewResponse, status_code=status.HTTP_201_CREATED)
def create_new_view(
    data: SavedViewCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Create a new saved view."""
    view = create_saved_view(
        db,
        account_id=user.account_id,
        user_id=user.id,
        data=data,
    )
    return view_to_response(view)


@router.put("/{view_id}", response_model=SavedViewResponse)
def update_existing_view(
    view_id: str,
    data: SavedViewUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Update a saved view. Only the owner can update."""
    view = get_saved_view(db, view_id=view_id, account_id=user.account_id, user_id=user.id)
    if not view:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved view not found",
        )
    
    updated = update_saved_view(db, view=view, user_id=user.id, data=data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the view owner can update it",
        )
    
    return view_to_response(updated)


@router.delete("/{view_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_view(
    view_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Delete a saved view. Only the owner can delete."""
    view = get_saved_view(db, view_id=view_id, account_id=user.account_id, user_id=user.id)
    if not view:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved view not found",
        )
    
    deleted = delete_saved_view(db, view=view, user_id=user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the view owner can delete it",
        )
    
    return None
