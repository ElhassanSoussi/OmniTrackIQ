"""Product events router for analytics tracking."""
import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from app.routers.deps import get_db, get_current_user_optional
from app.models.user import User
from app.models.product_event import ALLOWED_EVENT_NAMES
from app.services import events_service
from app.security.rate_limit import limiter

logger = logging.getLogger("omnitrackiq.events")

router = APIRouter()


class TrackEventRequest(BaseModel):
    """Request body for tracking an event."""
    event_name: str = Field(..., description="Name of the event to track")
    properties: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional event properties (max 4KB)"
    )
    
    @validator("event_name")
    def validate_event_name(cls, v):
        if v not in ALLOWED_EVENT_NAMES:
            raise ValueError(f"Invalid event name. Allowed: {', '.join(sorted(ALLOWED_EVENT_NAMES))}")
        return v
    
    @validator("properties")
    def validate_properties(cls, v):
        # Basic validation - service will handle truncation
        if not isinstance(v, dict):
            raise ValueError("Properties must be a dictionary")
        return v


class TrackEventResponse(BaseModel):
    """Response for track event endpoint."""
    success: bool
    event_id: Optional[str] = None
    message: Optional[str] = None


class AllowedEventsResponse(BaseModel):
    """Response listing all allowed event names."""
    events: list[str]


@router.post("/track", response_model=TrackEventResponse, summary="Track a product event")
@limiter.limit("100/minute")
async def track_event(
    request: Request,
    body: TrackEventRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Track a product event for analytics.
    
    - Accepts both authenticated and unauthenticated requests
    - For authenticated users: workspace_id and user_id are derived from the session
    - For unauthenticated: workspace_id and user_id will be null
    - Event names must be from the allowed whitelist
    - Properties are limited to 4KB and will be truncated if larger
    
    Rate limited to 100 requests per minute per IP.
    """
    # Extract user context if authenticated
    workspace_id = None
    user_id = None
    
    if current_user:
        user_id = current_user.id
        workspace_id = current_user.account_id
    
    # Get client IP for rate limiting unauthenticated requests
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_key = user_id or client_ip
    
    # Add request context to properties
    enriched_properties = {
        **body.properties,
        "_path": str(request.headers.get("referer", "")),
        "_user_agent": str(request.headers.get("user-agent", ""))[:200],  # Truncate UA
    }
    
    # Track the event
    event = events_service.track_event(
        db=db,
        event_name=body.event_name,
        properties=enriched_properties,
        workspace_id=workspace_id,
        user_id=user_id,
        rate_limit_key=rate_limit_key,
    )
    
    if event:
        return TrackEventResponse(success=True, event_id=event.id)
    else:
        # Don't expose internal details, just indicate failure
        return TrackEventResponse(
            success=False,
            message="Event could not be tracked. Please try again."
        )


@router.get("/allowed", response_model=AllowedEventsResponse, summary="List allowed event names")
async def get_allowed_events():
    """
    Get the list of allowed event names.
    Useful for frontend validation and documentation.
    """
    return AllowedEventsResponse(events=sorted(ALLOWED_EVENT_NAMES))
