"use client";

import { useState, useEffect, useCallback } from "react";
import SchoolAdminSidebar from "@/components/SchoolAdminSidebar";
interface SessionRecord {
  id: string;
  createdAt: string | null;
  expiresAt: string | null;
  ip: string;
  device: string;
}

export default function SchoolAdminSettingsPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const currentSessionId =
    typeof document !== "undefined"
      ? document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("__session_id="))
          ?.split("=")[1]
      : undefined;

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/auth/revoke-session");
      if (res.ok) setSessions(await res.json());
    } catch {
      /* ignore */
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await fetch("/api/auth/revoke-session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      /* ignore */
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    setRevoking("all");
    try {
      await fetch("/api/auth/revoke-session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      window.location.replace("/login");
    } catch {
      setRevoking(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-page)">
      <SchoolAdminSidebar />
      <main className="ml-60 flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-(--text-base)">Account Settings</h1>
            <p className="text-(--text-muted) text-sm mt-1">
              Manage your account security and active sessions.
            </p>
          </div>

          {/* Password */}
          <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) p-7 mb-6">
            <h2 className="text-lg font-bold text-(--text-base) mb-4">Password</h2>
            <div className="flex items-center justify-between p-4 bg-(--bg-page)/50 rounded-xl border border-(--border)">
              <div>
                <p className="font-bold text-(--text-base) text-sm">Account Password</p>
                <p className="text-xs text-(--text-muted)">Change your login password</p>
              </div>
              <a
                href="/auth/change-password"
                className="px-4 py-2 bg-(--bg-card) border border-(--border) text-(--text-base) text-sm font-bold rounded-lg hover:border-[rgba(45,212,191,0.5)] transition-colors"
              >
                Change Password
              </a>
            </div>
          </div>

          {/* Active sessions */}
          <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-(--text-base)">Active Sessions</h2>
                <p className="text-(--text-muted) text-sm mt-0.5">
                  Devices currently signed into your account
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSessions}
                  className="p-2 text-(--text-muted) hover:text-(--text-base) transition-colors"
                  title="Refresh"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
                <button
                  onClick={revokeAll}
                  disabled={revoking === "all"}
                  className="px-4 py-2 bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.3)] text-(--accent-red) text-sm font-bold rounded-lg hover:bg-[rgba(255,77,77,0.2)] transition-colors disabled:opacity-50"
                >
                  {revoking === "all" ? "Signing out..." : "Log Out All Devices"}
                </button>
              </div>
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-(--primary-green) text-2xl">
                  progress_activity
                </span>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-(--text-faint) text-sm text-center py-6">No active sessions found.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => {
                  const isCurrent = s.id === currentSessionId;
                  const created = s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString()
                    : "unknown";
                  const device = s.device.length > 60 ? s.device.slice(0, 60) + "…" : s.device;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        isCurrent
                          ? "bg-[rgba(45,212,191,0.04)] border-(--border-accent)"
                          : "bg-(--bg-page)/50 border-(--border)"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="material-symbols-outlined text-(--text-muted) text-xl mt-0.5 shrink-0">
                          devices
                        </span>
                        <div className="min-w-0">
                          <p className="text-(--text-base) text-sm font-medium truncate">{device}</p>
                          <p className="text-(--text-faint) text-xs mt-0.5">
                            IP {s.ip} &middot; Created {created}
                            {isCurrent && (
                              <span className="ml-2 text-(--primary-green) font-semibold">
                                (this device)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <button
                          onClick={() => revokeSession(s.id)}
                          disabled={revoking === s.id}
                          className="ml-4 shrink-0 px-3 py-1.5 text-xs font-bold text-(--text-muted) border border-(--border) rounded-lg hover:text-(--accent-red) hover:border-[rgba(255,77,77,0.4)] transition-colors disabled:opacity-50"
                        >
                          {revoking === s.id ? "..." : "Revoke"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
