"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";

// Message types
export type MessageType =
  | "connected"
  | "subscribe"
  | "unsubscribe"
  | "subscribed"
  | "unsubscribed"
  | "ping"
  | "pong"
  | "metrics_update"
  | "notification"
  | "sync_status"
  | "anomaly_alert"
  | "error";

// Available channels
export type Channel = "metrics" | "notifications" | "sync_status" | "anomalies";

// Message interfaces
export interface WebSocketMessage {
  type: MessageType;
  timestamp?: string;
  channel?: Channel;
  [key: string]: unknown;
}

export interface MetricsUpdateMessage extends WebSocketMessage {
  type: "metrics_update";
  metrics: {
    revenue?: number;
    spend?: number;
    roas?: number;
    orders?: number;
    [key: string]: unknown;
  };
}

export interface NotificationMessage extends WebSocketMessage {
  type: "notification";
  title: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
}

export interface SyncStatusMessage extends WebSocketMessage {
  type: "sync_status";
  platform: string;
  status: "started" | "in_progress" | "completed" | "failed";
  details?: {
    progress?: number;
    records?: number;
    error?: string;
  };
}

export interface AnomalyAlertMessage extends WebSocketMessage {
  type: "anomaly_alert";
  anomaly: {
    metric: string;
    type: string;
    severity: string;
    date: string;
    actual_value: number;
    expected_value: number;
    deviation_percent: number;
  };
}

// Connection state
export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

// Hook options
interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMetricsUpdate?: (data: MetricsUpdateMessage) => void;
  onNotification?: (data: NotificationMessage) => void;
  onSyncStatus?: (data: SyncStatusMessage) => void;
  onAnomalyAlert?: (data: AnomalyAlertMessage) => void;
  onError?: (error: string) => void;
}

// Hook return type
interface UseWebSocketReturn {
  connectionState: ConnectionState;
  subscribedChannels: Set<Channel>;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: Channel) => void;
  unsubscribe: (channel: Channel) => void;
  sendPing: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const PING_INTERVAL = 30000; // 30 seconds

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onMetricsUpdate,
    onNotification,
    onSyncStatus,
    onAnomalyAlert,
    onError,
  } = options;

  const { token, isAuthenticated } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [subscribedChannels, setSubscribedChannels] = useState<Set<Channel>>(new Set());

  // Clean up intervals and timeouts
  const cleanUp = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token || !isAuthenticated) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    cleanUp();
    setConnectionState("connecting");

    const wsUrl = `${WS_URL}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionState("connected");
      reconnectAttemptsRef.current = 0;

      // Start ping interval
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, PING_INTERVAL);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            console.log("WebSocket connected:", data);
            break;

          case "subscribed":
            if (data.channel) {
              setSubscribedChannels((prev) => new Set([...prev, data.channel as Channel]));
            }
            break;

          case "unsubscribed":
            if (data.channel) {
              setSubscribedChannels((prev) => {
                const next = new Set(prev);
                next.delete(data.channel as Channel);
                return next;
              });
            }
            break;

          case "metrics_update":
            onMetricsUpdate?.(data as MetricsUpdateMessage);
            break;

          case "notification":
            onNotification?.(data as NotificationMessage);
            break;

          case "sync_status":
            onSyncStatus?.(data as SyncStatusMessage);
            break;

          case "anomaly_alert":
            onAnomalyAlert?.(data as AnomalyAlertMessage);
            break;

          case "error":
            onError?.(data.message as string || "Unknown error");
            break;

          case "pong":
            // Keepalive response, no action needed
            break;

          default:
            console.log("Unknown WebSocket message:", data);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onerror = () => {
      setConnectionState("error");
      onError?.("WebSocket connection error");
    };

    ws.onclose = (event) => {
      setConnectionState("disconnected");
      setSubscribedChannels(new Set());
      cleanUp();

      // Attempt reconnection
      if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        console.log(
          `WebSocket reconnecting (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        onError?.("Max reconnection attempts reached");
      }
    };

    wsRef.current = ws;
  }, [
    token,
    isAuthenticated,
    cleanUp,
    reconnect,
    reconnectInterval,
    maxReconnectAttempts,
    onMetricsUpdate,
    onNotification,
    onSyncStatus,
    onAnomalyAlert,
    onError,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    cleanUp();
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent reconnection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [cleanUp, maxReconnectAttempts]);

  // Subscribe to a channel
  const subscribe = useCallback((channel: Channel) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", channel }));
    }
  }, []);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: Channel) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", channel }));
    }
  }, []);

  // Send ping manually
  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && isAuthenticated && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, token, connect, disconnect]);

  return {
    connectionState,
    subscribedChannels,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendPing,
  };
}

// Hook for subscribing to specific channels with auto-subscribe
export function useWebSocketChannel<T extends WebSocketMessage>(
  channel: Channel,
  onMessage: (data: T) => void
) {
  const callbacks = {
    onMetricsUpdate: channel === "metrics" ? (onMessage as (data: MetricsUpdateMessage) => void) : undefined,
    onNotification: channel === "notifications" ? (onMessage as (data: NotificationMessage) => void) : undefined,
    onSyncStatus: channel === "sync_status" ? (onMessage as (data: SyncStatusMessage) => void) : undefined,
    onAnomalyAlert: channel === "anomalies" ? (onMessage as (data: AnomalyAlertMessage) => void) : undefined,
  };

  const ws = useWebSocket(callbacks);

  useEffect(() => {
    if (ws.connectionState === "connected" && !ws.subscribedChannels.has(channel)) {
      ws.subscribe(channel);
    }
  }, [ws.connectionState, ws.subscribedChannels, channel, ws.subscribe]);

  return ws;
}
