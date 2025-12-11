"""Product events service for analytics tracking."""
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.product_event import ProductEvent, ALLOWED_EVENT_NAMES

logger = logging.getLogger("omnitrackiq.events")

# Maximum size for properties JSON (prevent abuse)
MAX_PROPERTIES_SIZE = 4096  # 4KB

# Rate limit: max events per user/IP per minute
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_EVENTS = 100

# In-memory rate limit tracking (simple implementation)
# TODO: Replace with Redis for production multi-instance deployments
_rate_limit_cache: Dict[str, List[datetime]] = {}


def _check_rate_limit(identifier: str) -> bool:
    """
    Simple in-memory rate limiting.
    Returns True if within limit, False if exceeded.
    
    TODO: For production with multiple instances, use Redis:
    - INCR key with EXPIRE for sliding window
    - Or use a proper rate limiting library like slowapi with Redis backend
    """
    now = datetime.utcnow()
    window_start = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    
    # Clean up old entries
    if identifier in _rate_limit_cache:
        _rate_limit_cache[identifier] = [
            ts for ts in _rate_limit_cache[identifier]
            if ts > window_start
        ]
    else:
        _rate_limit_cache[identifier] = []
    
    # Check limit
    if len(_rate_limit_cache[identifier]) >= RATE_LIMIT_MAX_EVENTS:
        return False
    
    # Add current request
    _rate_limit_cache[identifier].append(now)
    return True


def _truncate_properties(properties: Dict[str, Any]) -> Dict[str, Any]:
    """Truncate properties if they exceed the size limit."""
    if not properties:
        return {}
    
    try:
        json_str = json.dumps(properties)
        if len(json_str) <= MAX_PROPERTIES_SIZE:
            return properties
        
        # Truncate by removing keys until under limit
        truncated = {}
        current_size = 2  # {}
        
        for key, value in properties.items():
            key_value_str = json.dumps({key: value})
            entry_size = len(key_value_str) - 2  # minus {}
            
            if current_size + entry_size + 1 < MAX_PROPERTIES_SIZE:  # +1 for comma
                truncated[key] = value
                current_size += entry_size + 1
            else:
                # Add truncation marker
                truncated["_truncated"] = True
                break
        
        return truncated
    except (TypeError, ValueError):
        return {"_error": "properties_not_serializable"}


def validate_event_name(event_name: str) -> bool:
    """Check if event name is in the whitelist."""
    return event_name in ALLOWED_EVENT_NAMES


def track_event(
    db: Session,
    event_name: str,
    properties: Optional[Dict[str, Any]] = None,
    workspace_id: Optional[str] = None,
    user_id: Optional[str] = None,
    rate_limit_key: Optional[str] = None,
) -> Optional[ProductEvent]:
    """
    Track a product event.
    
    Args:
        db: Database session
        event_name: Name of the event (must be in whitelist)
        properties: Optional event properties
        workspace_id: Optional workspace ID (for authenticated events)
        user_id: Optional user ID (for authenticated events)
        rate_limit_key: Key for rate limiting (user_id, IP, etc.)
    
    Returns:
        Created ProductEvent or None if rate limited/invalid
    """
    # Validate event name
    if not validate_event_name(event_name):
        logger.warning(f"Invalid event name rejected: {event_name}")
        return None
    
    # Check rate limit
    if rate_limit_key and not _check_rate_limit(rate_limit_key):
        logger.warning(f"Rate limit exceeded for: {rate_limit_key}")
        return None
    
    # Truncate properties if needed
    safe_properties = _truncate_properties(properties or {})
    
    try:
        # Use raw SQL to avoid potential ORM issues with nullable columns
        event_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        db.execute(
            text("""
                INSERT INTO product_events (id, workspace_id, user_id, event_name, properties, created_at)
                VALUES (:id, :workspace_id, :user_id, :event_name, :properties, :created_at)
            """),
            {
                "id": event_id,
                "workspace_id": workspace_id,
                "user_id": user_id,
                "event_name": event_name,
                "properties": json.dumps(safe_properties),
                "created_at": created_at,
            }
        )
        db.commit()
        
        logger.debug(f"Tracked event: {event_name} for user={user_id}, workspace={workspace_id}")
        
        # Return a simple object representation
        event = ProductEvent()
        event.id = event_id
        event.workspace_id = workspace_id
        event.user_id = user_id
        event.event_name = event_name
        event.properties = safe_properties
        return event
        
    except Exception as e:
        logger.error(f"Failed to track event {event_name}: {str(e)}")
        db.rollback()
        return None


def get_events(
    db: Session,
    workspace_id: Optional[str] = None,
    user_id: Optional[str] = None,
    event_name: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    limit: int = 100,
) -> List[ProductEvent]:
    """
    Query product events with filters.
    For internal analytics dashboards.
    """
    query = db.query(ProductEvent)
    
    if workspace_id:
        query = query.filter(ProductEvent.workspace_id == workspace_id)
    if user_id:
        query = query.filter(ProductEvent.user_id == user_id)
    if event_name:
        query = query.filter(ProductEvent.event_name == event_name)
    if from_date:
        query = query.filter(ProductEvent.created_at >= from_date)
    if to_date:
        query = query.filter(ProductEvent.created_at <= to_date)
    
    return query.order_by(ProductEvent.created_at.desc()).limit(limit).all()


def get_event_counts(
    db: Session,
    workspace_id: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
) -> Dict[str, int]:
    """Get event counts grouped by event name."""
    from sqlalchemy import func
    
    query = db.query(
        ProductEvent.event_name,
        func.count(ProductEvent.id).label("count")
    )
    
    if workspace_id:
        query = query.filter(ProductEvent.workspace_id == workspace_id)
    if from_date:
        query = query.filter(ProductEvent.created_at >= from_date)
    if to_date:
        query = query.filter(ProductEvent.created_at <= to_date)
    
    results = query.group_by(ProductEvent.event_name).all()
    return {row.event_name: row.count for row in results}
