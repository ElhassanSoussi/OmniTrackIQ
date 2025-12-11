"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, TrendingDown, TrendingUp, FileText, Settings } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import Link from "next/link";

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case "anomaly_spike":
      return <TrendingUp className="h-4 w-4 text-[#cf222e] dark:text-[#f85149]" />;
    case "anomaly_drop":
      return <TrendingDown className="h-4 w-4 text-[#9a6700] dark:text-[#d29922]" />;
    case "spend_threshold":
    case "roas_threshold":
    case "budget_alert":
      return <AlertTriangle className="h-4 w-4 text-[#9a6700] dark:text-[#d29922]" />;
    case "weekly_report":
    case "monthly_report":
      return <FileText className="h-4 w-4 text-[#0969da] dark:text-[#58a6ff]" />;
    default:
      return <Bell className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />;
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
        className="relative p-2 rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-[#57606a] dark:text-[#8b949e]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-[#cf222e] rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-gh-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
            <h3 className="font-semibold text-sm text-[#1f2328] dark:text-[#e6edf3]">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-[#238636] hover:text-[#2ea043] dark:text-[#3fb950] dark:hover:text-[#56d364] flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <Link
                href="/settings/notifications"
                className="p-1 hover:bg-[#eaeef2] dark:hover:bg-[#21262d] rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 text-[#57606a] dark:text-[#8b949e]" />
              </Link>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-[#57606a] dark:text-[#8b949e]">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-[#d0d7de] dark:text-[#30363d] mx-auto mb-2" />
                <p className="text-[#57606a] dark:text-[#8b949e] text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {notifications.slice(0, 10).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors ${
                      !notification.read_at ? "bg-[#ddf4ff] dark:bg-[#388bfd15]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertIcon(notification.alert_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${
                            !notification.read_at ? "text-[#1f2328] dark:text-[#e6edf3]" : "text-[#57606a] dark:text-[#8b949e]"
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read_at && (
                            <span className="h-2 w-2 bg-[#238636] dark:bg-[#3fb950] rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-xs text-[#57606a] dark:text-[#8b949e] truncate mt-0.5">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-[#6e7781] dark:text-[#6e7681] mt-1">
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
            <div className="px-4 py-2 border-t border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
              <Link
                href="/settings/notifications"
                className="text-xs text-[#0969da] hover:text-[#0550ae] dark:text-[#58a6ff] dark:hover:text-[#79c0ff] font-medium"
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
