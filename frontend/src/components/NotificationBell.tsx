"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, TrendingDown, TrendingUp, FileText, Settings } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import Link from "next/link";

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case "anomaly_spike":
      return <TrendingUp className="h-4 w-4 text-red-400" />;
    case "anomaly_drop":
      return <TrendingDown className="h-4 w-4 text-amber-400" />;
    case "spend_threshold":
    case "roas_threshold":
    case "budget_alert":
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    case "weekly_report":
    case "monthly_report":
      return <FileText className="h-4 w-4 text-blue-400" />;
    default:
      return <Bell className="h-4 w-4 text-zinc-400" />;
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead([notification.id]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <Link
                href="/settings/notifications"
                className="p-1 hover:bg-zinc-800 rounded"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-zinc-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {notifications.slice(0, 10).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors ${
                      !notification.read_at ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertIcon(notification.alert_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${
                            !notification.read_at ? "text-white" : "text-zinc-300"
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read_at && (
                            <span className="h-2 w-2 bg-emerald-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-zinc-600 mt-1">
                          {formatTime(notification.sent_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-zinc-800">
              <Link
                href="/settings/notifications"
                className="text-xs text-emerald-400 hover:text-emerald-300"
                onClick={() => setIsOpen(false)}
              >
                Manage notification settings →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
