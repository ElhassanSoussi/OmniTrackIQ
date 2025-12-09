import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

export interface Notification {
  id: string;
  alert_type: string;
  channel: string;
  title: string;
  message: string | null;
  reference_id: string | null;
  sent_at: string;
  read_at: string | null;
}

export interface NotificationList {
  items: Notification[];
  total: number;
  unread_count: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (limit = 20, offset = 0) => {
    try {
      const data = await apiFetch<NotificationList>(
        `/notifications?limit=${limit}&offset=${offset}`
      );
      if (data) {
        setNotifications(data.items);
        setUnreadCount(data.unread_count);
        setTotal(data.total);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    try {
      await apiFetch("/notifications/read", {
        method: "POST",
        body: JSON.stringify({ notification_ids: notificationIds || null }),
      });
      
      // Update local state
      if (notificationIds) {
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id)
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      } else {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(() => markAsRead(), [markAsRead]);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 60 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    total,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
