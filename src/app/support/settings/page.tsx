"use client";

import { useState, useEffect, useCallback } from "react";
import SupportSidebar from "@/components/SupportSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

interface SessionRecord {
  id: string;
  createdAt: string | null;
  expiresAt: string | null;
  lastSeenAt: string | null;
  ip: string;
  device: string;
}

type SettingsTab = "account" | "notifications" | "security";

const ACCENT = "#3b82f6";
const ACCENT_BG = "rgba(59,130,246,0.1)";

const NOTIFICATIONS = [
  { label: "System alerts", desc: "Critical platform errors or outages requiring attention" },
  { label: "Maintenance windows", desc: "Scheduled downtime and maintenance notices" },
  { label: "Platform updates", desc: "New features, announcements, and release notes" },
];

export default function SupportSettingsPage() {
  const { appUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [notifs, setNotifs] = useState([true, true, false]);

  const currentSessionId =
    typeof document !== "undefined"
      ? document.cookie.split(";").find((c) => c.trim().startsWith("__session_id="))?.split("=")[1]
      : undefined;

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/auth/revoke-session");
      if (res.ok) setSessions(await res.json());
    } catch { /* ignore */ }
    finally { setSessionsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "security") fetchSessions();
  }, [activeTab, fetchSessions]);

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await fetch("/api/auth/revoke-session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch { /* ignore */ }
    finally { setRevoking(null); }
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
    } catch { setRevoking(null); }
  };

  const tabs: { key: SettingsTab; icon: string; label: string }[] = [
    { key: "account", icon: "person", label: "Account" },
    { key: "notifications", icon: "notifications", label: "Notifications" },
    { key: "security", icon: "shield", label: "Security" },
  ];

  return (
    <div className="flex h-screen bg-(--bg-page) overflow-hidden">
      <SupportSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-[rgba(59,130,246,0.08)] px-6 py-3">
          <h1 className="text-lg font-bold text-(--text-base)">Settings</h1>
          <p className="text-(--text-muted) text-xs">Manage your support account</p>
        </header>

        <div className="flex flex-col md:flex-row max-w-5xl mx-auto w-full px-4 py-8 gap-8">
          <aside className="w-full md:w-56 flex flex-col gap-4 shrink-0">
            <div>
              <h2 className="text-(--text-base) text-xl font-bold">Settings</h2>
              <p className="text-(--text-muted) text-sm mt-0.5">Manage your account</p>
            </div>
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors"
                  style={activeTab === tab.key ? { background: ACCENT_BG, color: ACCENT } : { color: "#94a3b8" }}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section className="flex-1 flex flex-col gap-7">
            {activeTab === "account" && (
              <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) p-7">
                <h3 className="text-xl font-bold text-(--text-base) mb-6">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider">Full Name</label>
                    <input className="w-full bg-(--bg-page) border border-(--border) rounded-lg text-(--text-base) px-4 py-2.5 text-sm outline-none" defaultValue={appUser?.displayName ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider">Email</label>
                    <input className="w-full bg-(--bg-page) border border-(--border) rounded-lg text-(--text-muted) px-4 py-2.5 text-sm cursor-not-allowed" value={appUser?.email ?? ""} readOnly />
                  </div>
                </div>
                <div className="mt-5 p-4 rounded-xl border" style={{ background: `${ACCENT}10`, borderColor: `${ACCENT}30` }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: ACCENT }}>Support Role — Read-only</p>
                  <p className="text-(--text-muted) text-xs">Support accounts have view-only access. Contact a platform admin to make user changes.</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
                    className="px-6 py-2.5 font-bold rounded-lg text-(--text-base) hover:opacity-90 transition-opacity"
                    style={{ background: ACCENT }}
                  >
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) p-7">
                <h3 className="text-xl font-bold text-(--text-base) mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {NOTIFICATIONS.map((item, i) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-(--bg-page)/50 rounded-xl border border-(--border)">
                      <div>
                        <p className="font-bold text-(--text-base) text-sm">{item.label}</p>
                        <p className="text-xs text-(--text-muted)">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{ background: notifs[i] ? ACCENT : "#334155" }}
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" style={{ transform: notifs[i] ? "translateX(24px)" : "translateX(4px)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) p-7">
                  <h3 className="text-xl font-bold text-(--text-base) mb-6">Password</h3>
                  <div className="flex items-center justify-between p-4 bg-(--bg-page)/50 rounded-xl border border-(--border)">
                    <div>
                      <p className="font-bold text-(--text-base)">Account Password</p>
                      <p className="text-sm text-(--text-muted)">Change your login password</p>
                    </div>
                    <a href="/auth/change-password" className="px-4 py-2 bg-(--bg-card) border border-(--border) text-(--text-base) text-sm font-bold rounded-lg hover:border-[rgba(59,130,246,0.5)] transition-colors">
                      Change Password
                    </a>
                  </div>
                </div>

                <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) p-7">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-(--text-base)">Active Sessions</h3>
                      <p className="text-(--text-muted) text-sm mt-0.5">Devices currently signed in</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={fetchSessions} className="p-2 text-(--text-muted) hover:text-(--text-base) transition-colors">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                      <button onClick={revokeAll} disabled={revoking === "all"} className="px-4 py-2 bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.3)] text-(--accent-red) text-sm font-bold rounded-lg hover:bg-[rgba(255,77,77,0.2)] transition-colors disabled:opacity-50">
                        {revoking === "all" ? "Signing out..." : "Log Out All Devices"}
                      </button>
                    </div>
                  </div>
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="material-symbols-outlined animate-spin text-2xl" style={{ color: ACCENT }}>progress_activity</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-(--text-faint) text-sm text-center py-6">No active sessions found.</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((s) => {
                        const isCurrent = s.id === currentSessionId;
                        return (
                          <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${isCurrent ? "bg-[rgba(59,130,246,0.04)]" : "bg-(--bg-page)/50 border-(--border)"}`} style={isCurrent ? { borderColor: `${ACCENT}30` } : {}}>
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="material-symbols-outlined text-(--text-muted) text-xl mt-0.5 shrink-0">devices</span>
                              <div className="min-w-0">
                                <p className="text-(--text-base) text-sm font-medium truncate">{s.device.length > 60 ? s.device.slice(0, 60) + "…" : s.device}</p>
                                <p className="text-(--text-faint) text-xs mt-0.5">
                                  IP {s.ip} · {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "unknown"}
                                  {isCurrent && <span className="ml-2 font-semibold" style={{ color: ACCENT }}>(this device)</span>}
                                </p>
                              </div>
                            </div>
                            {!isCurrent && (
                              <button onClick={() => revokeSession(s.id)} disabled={revoking === s.id} className="ml-4 shrink-0 px-3 py-1.5 text-xs font-bold text-(--text-muted) border border-(--border) rounded-lg hover:text-(--accent-red) hover:border-[rgba(255,77,77,0.4)] transition-colors disabled:opacity-50">
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
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
