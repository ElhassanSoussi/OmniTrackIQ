"""
WebSocket routes for real-time updates.

Provides WebSocket endpoint for live dashboard updates, notifications,
and integration sync status.
"""
import logging
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
import jwt

from app.routers.deps import get_db
from app.config import settings
from app.models.user import User
from app.services.websocket_service import manager, Channel

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    """Validate JWT token and return user."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except jwt.PyJWTError as e:
        logger.warning(f"WebSocket auth failed: {e}")
        return None


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
):
    """
    WebSocket endpoint for real-time updates.
    
    ## Authentication
    
    Pass your JWT token as a query parameter:
    ```
    ws://api.omnitrackiq.com/ws?token=<your-jwt-token>
    ```
    
    ## Channels
    
    After connecting, subscribe to channels to receive updates:
    
    - **metrics**: Real-time metric updates
    - **notifications**: User notifications
    - **sync_status**: Integration sync status
    - **anomalies**: Anomaly alerts
    
    ## Message Format
    
    ### Subscribe to a channel:
    ```json
    {"type": "subscribe", "channel": "metrics"}
    ```
    
    ### Unsubscribe from a channel:
    ```json
    {"type": "unsubscribe", "channel": "metrics"}
    ```
    
    ### Ping (keep-alive):
    ```json
    {"type": "ping"}
    ```
    
    ## Server Messages
    
    ### Metrics update:
    ```json
    {
        "type": "metrics_update",
        "channel": "metrics",
        "timestamp": "2025-12-08T12:00:00Z",
        "metrics": {...}
    }
    ```
    
    ### Notification:
    ```json
    {
        "type": "notification",
        "channel": "notifications",
        "timestamp": "2025-12-08T12:00:00Z",
        "title": "Sync Complete",
        "message": "Facebook Ads sync completed successfully",
        "level": "success"
    }
    ```
    
    ### Anomaly alert:
    ```json
    {
        "type": "anomaly_alert",
        "channel": "anomalies", 
        "timestamp": "2025-12-08T12:00:00Z",
        "anomaly": {...}
    }
    ```
    """
    # Get database session for authentication
    from app.db import SessionLocal
    db = SessionLocal()
    
    try:
        # Authenticate user
        user = await get_user_from_token(token, db)
        if not user or not user.account_id:
            await websocket.close(code=4001, reason="Authentication failed")
            return
        
        # Connect
        conn_id = await manager.connect(websocket, user.id, user.account_id)
        
        try:
            while True:
                # Receive and process messages
                data = await websocket.receive_json()
                await manager.handle_message(websocket, data)
                
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: user={user.id}")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            await manager.disconnect(websocket)
    
    finally:
        db.close()


@router.get("/ws/stats")
async def websocket_stats():
    """
    Get WebSocket connection statistics.
    
    Returns the number of active connections and channel subscriptions.
    """
    return manager.get_stats()


@router.get("/ws/channels")
async def list_channels():
    """
    List available WebSocket channels.
    
    Returns all channels that can be subscribed to.
    """
    return {
        "channels": [
            {
                "name": Channel.METRICS.value,
                "description": "Real-time metrics updates when data changes",
            },
            {
                "name": Channel.NOTIFICATIONS.value,
                "description": "User notifications and alerts",
            },
            {
                "name": Channel.SYNC_STATUS.value,
                "description": "Integration sync progress and status",
            },
            {
                "name": Channel.ANOMALIES.value,
                "description": "Real-time anomaly detection alerts",
            },
        ]
    }
