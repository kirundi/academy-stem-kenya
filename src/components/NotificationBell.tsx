"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course_published": return "rocket_launch";
      case "submission": return "assignment_turned_in";
      case "grade": return "grade";
      case "badge": return "workspace_premium";
      case "announcement": return "campaign";
      default: return "notifications";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-(--bg-elevated) text-(--text-faint) hover:bg-(--hover-subtle) hover:text-primary-green transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 rounded-full bg-primary-green text-[#0d1f22] text-[10px] font-black px-1 shadow-lg shadow-primary-green/30">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-12 w-80 bg-(--bg-card) border border-(--border-medium) rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-subtle)">
            <h3 className="text-(--text-base) text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-primary-green text-xs font-bold hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-(--border-medium) border-t-[#13eca4] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-(--text-faint)">
                <span className="material-symbols-outlined text-3xl mb-2">notifications_off</span>
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => { if (!notification.read) markAsRead(notification.id); }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-(--hover-subtle) ${
                    !notification.read ? "bg-[rgba(19,236,164,0.04)]" : ""
                  }`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      !notification.read
                        ? "bg-primary-green/15 text-primary-green"
                        : "bg-(--bg-elevated) text-(--text-faint)"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!notification.read ? "text-(--text-base) font-medium" : "text-(--text-muted)"}`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-(--text-faint) mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 w-2 h-2 rounded-full bg-primary-green mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-(--border-subtle) px-4 py-2">
              <button
                onClick={() => { setIsOpen(false); markAllAsRead(); }}
                className="w-full text-center text-primary-green text-xs font-bold py-1 hover:underline"
              >
                Mark All as Read &amp; Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
