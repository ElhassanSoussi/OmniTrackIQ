"""
WebSocket service for real-time updates in OmniTrackIQ.

Provides live updates for dashboard metrics, notifications, and data sync status.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Set, Optional, Any
from dataclasses import dataclass, field
from enum import Enum

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class MessageType(str, Enum):
    """Types of WebSocket messages."""
    # Client -> Server
    SUBSCRIBE = "subscribe"
    UNSUBSCRIBE = "unsubscribe"
    PING = "ping"
    
    # Server -> Client
    METRICS_UPDATE = "metrics_update"
    NOTIFICATION = "notification"
    SYNC_STATUS = "sync_status"
    ANOMALY_ALERT = "anomaly_alert"
    ERROR = "error"
    PONG = "pong"
    SUBSCRIBED = "subscribed"
    UNSUBSCRIBED = "unsubscribed"


class Channel(str, Enum):
    """Available subscription channels."""
    METRICS = "metrics"          # Real-time metrics updates
    NOTIFICATIONS = "notifications"  # User notifications
    SYNC_STATUS = "sync_status"  # Integration sync status
    ANOMALIES = "anomalies"      # Anomaly alerts


@dataclass
class Connection:
    """Represents a WebSocket connection."""
    websocket: WebSocket
    user_id: str
    account_id: str
    channels: Set[str] = field(default_factory=set)
    connected_at: datetime = field(default_factory=datetime.utcnow)
    last_ping: datetime = field(default_factory=datetime.utcnow)


class ConnectionManager:
    """
    Manages WebSocket connections and message broadcasting.
    
    Thread-safe singleton for managing all active WebSocket connections.
    """
    
    _instance: Optional['ConnectionManager'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize connection manager state."""
        # Active connections by connection ID
        self._connections: Dict[str, Connection] = {}
        # Map account_id -> set of connection IDs
        self._account_connections: Dict[str, Set[str]] = {}
        # Map channel -> set of connection IDs
        self._channel_subscriptions: Dict[str, Set[str]] = {}
        # Lock for thread safety
        self._lock = asyncio.Lock()
    
    def _get_connection_id(self, websocket: WebSocket) -> str:
        """Generate unique connection ID."""
        return str(id(websocket))
    
    async def connect(
        self, 
        websocket: WebSocket, 
        user_id: str, 
        account_id: str
    ) -> str:
        """
        Accept a new WebSocket connection.
        
        Returns the connection ID.
        """
        await websocket.accept()
        
        conn_id = self._get_connection_id(websocket)
        connection = Connection(
            websocket=websocket,
            user_id=user_id,
            account_id=account_id,
        )
        
        async with self._lock:
            self._connections[conn_id] = connection
            
            # Track by account
            if account_id not in self._account_connections:
                self._account_connections[account_id] = set()
            self._account_connections[account_id].add(conn_id)
        
        logger.info(f"WebSocket connected: user={user_id}, account={account_id}")
        
        # Send welcome message
        await self._send_message(websocket, {
            "type": "connected",
            "connection_id": conn_id,
            "available_channels": [c.value for c in Channel],
        })
        
        return conn_id
    
    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        conn_id = self._get_connection_id(websocket)
        
        async with self._lock:
            if conn_id not in self._connections:
                return
            
            connection = self._connections[conn_id]
            
            # Remove from account tracking
            account_id = connection.account_id
            if account_id in self._account_connections:
                self._account_connections[account_id].discard(conn_id)
                if not self._account_connections[account_id]:
                    del self._account_connections[account_id]
            
            # Remove from channel subscriptions
            for channel in connection.channels:
                if channel in self._channel_subscriptions:
                    self._channel_subscriptions[channel].discard(conn_id)
            
            del self._connections[conn_id]
            
            logger.info(f"WebSocket disconnected: user={connection.user_id}")
    
    async def subscribe(self, websocket: WebSocket, channel: str) -> bool:
        """Subscribe a connection to a channel."""
        conn_id = self._get_connection_id(websocket)
        
        if channel not in [c.value for c in Channel]:
            await self._send_message(websocket, {
                "type": MessageType.ERROR.value,
                "message": f"Invalid channel: {channel}",
            })
            return False
        
        async with self._lock:
            if conn_id not in self._connections:
                return False
            
            connection = self._connections[conn_id]
            connection.channels.add(channel)
            
            if channel not in self._channel_subscriptions:
                self._channel_subscriptions[channel] = set()
            self._channel_subscriptions[channel].add(conn_id)
        
        await self._send_message(websocket, {
            "type": MessageType.SUBSCRIBED.value,
            "channel": channel,
        })
        
        logger.debug(f"Connection {conn_id} subscribed to {channel}")
        return True
    
    async def unsubscribe(self, websocket: WebSocket, channel: str) -> bool:
        """Unsubscribe a connection from a channel."""
        conn_id = self._get_connection_id(websocket)
        
        async with self._lock:
            if conn_id not in self._connections:
                return False
            
            connection = self._connections[conn_id]
            connection.channels.discard(channel)
            
            if channel in self._channel_subscriptions:
                self._channel_subscriptions[channel].discard(conn_id)
        
        await self._send_message(websocket, {
            "type": MessageType.UNSUBSCRIBED.value,
            "channel": channel,
        })
        
        return True
    
    async def _send_message(self, websocket: WebSocket, data: dict):
        """Send a message to a specific WebSocket."""
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.warning(f"Failed to send WebSocket message: {e}")
    
    async def broadcast_to_account(
        self, 
        account_id: str, 
        message_type: MessageType,
        data: dict,
        channel: Optional[str] = None
    ):
        """
        Broadcast a message to all connections for an account.
        
        If channel is specified, only sends to connections subscribed to that channel.
        """
        message = {
            "type": message_type.value,
            "timestamp": datetime.utcnow().isoformat(),
            **data
        }
        
        async with self._lock:
            conn_ids = self._account_connections.get(account_id, set()).copy()
        
        for conn_id in conn_ids:
            async with self._lock:
                connection = self._connections.get(conn_id)
                if not connection:
                    continue
                
                # Check channel subscription if specified
                if channel and channel not in connection.channels:
                    continue
                
                websocket = connection.websocket
            
            await self._send_message(websocket, message)
    
    async def broadcast_to_channel(
        self,
        channel: str,
        message_type: MessageType,
        data: dict,
        account_id: Optional[str] = None
    ):
        """
        Broadcast a message to all subscribers of a channel.
        
        If account_id is specified, only sends to connections for that account.
        """
        message = {
            "type": message_type.value,
            "channel": channel,
            "timestamp": datetime.utcnow().isoformat(),
            **data
        }
        
        async with self._lock:
            conn_ids = self._channel_subscriptions.get(channel, set()).copy()
        
        for conn_id in conn_ids:
            async with self._lock:
                connection = self._connections.get(conn_id)
                if not connection:
                    continue
                
                # Filter by account if specified
                if account_id and connection.account_id != account_id:
                    continue
                
                websocket = connection.websocket
            
            await self._send_message(websocket, message)
    
    async def handle_message(self, websocket: WebSocket, data: dict):
        """Process an incoming message from a client."""
        msg_type = data.get("type")
        
        if msg_type == MessageType.PING.value:
            conn_id = self._get_connection_id(websocket)
            async with self._lock:
                if conn_id in self._connections:
                    self._connections[conn_id].last_ping = datetime.utcnow()
            await self._send_message(websocket, {"type": MessageType.PONG.value})
        
        elif msg_type == MessageType.SUBSCRIBE.value:
            channel = data.get("channel")
            if channel:
                await self.subscribe(websocket, channel)
        
        elif msg_type == MessageType.UNSUBSCRIBE.value:
            channel = data.get("channel")
            if channel:
                await self.unsubscribe(websocket, channel)
        
        else:
            await self._send_message(websocket, {
                "type": MessageType.ERROR.value,
                "message": f"Unknown message type: {msg_type}",
            })
    
    def get_stats(self) -> dict:
        """Get WebSocket connection statistics."""
        return {
            "total_connections": len(self._connections),
            "accounts_connected": len(self._account_connections),
            "channel_subscriptions": {
                channel: len(conn_ids) 
                for channel, conn_ids in self._channel_subscriptions.items()
            },
        }


# Global connection manager instance
manager = ConnectionManager()


# Helper functions for broadcasting from other parts of the app

async def notify_metrics_update(account_id: str, metrics: dict):
    """Notify account about metrics update."""
    await manager.broadcast_to_channel(
        channel=Channel.METRICS.value,
        message_type=MessageType.METRICS_UPDATE,
        data={"metrics": metrics},
        account_id=account_id,
    )


async def notify_sync_status(account_id: str, platform: str, status: str, details: dict = None):
    """Notify account about integration sync status."""
    await manager.broadcast_to_channel(
        channel=Channel.SYNC_STATUS.value,
        message_type=MessageType.SYNC_STATUS,
        data={
            "platform": platform,
            "status": status,
            "details": details or {},
        },
        account_id=account_id,
    )


async def notify_anomaly_detected(account_id: str, anomaly: dict):
    """Notify account about detected anomaly."""
    await manager.broadcast_to_channel(
        channel=Channel.ANOMALIES.value,
        message_type=MessageType.ANOMALY_ALERT,
        data={"anomaly": anomaly},
        account_id=account_id,
    )


async def send_notification(account_id: str, title: str, message: str, level: str = "info"):
    """Send a notification to account."""
    await manager.broadcast_to_channel(
        channel=Channel.NOTIFICATIONS.value,
        message_type=MessageType.NOTIFICATION,
        data={
            "title": title,
            "message": message,
            "level": level,
        },
        account_id=account_id,
    )
