"use client";

import { useEffect, useState } from "react";
import SupportSidebar from "@/components/SupportSidebar";

interface InviteRow {
  id: string;
  email: string;
  displayName: string;
  role: string;
  invitedBy: string;
  invitedByName: string;
  invitedAt: { seconds?: number } | string | null;
  expiresAt: string | null;
  status: "pending" | "accepted" | "expired";
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#f59e0b" },
  accepted: { label: "Accepted", color: "#10b981" },
  expired: { label: "Expired", color: "#64748b" },
};

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School Admin",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
  parent: "Parent",
  support: "Support",
  observer: "Observer",
  content_reviewer: "Content Reviewer",
  analytics_viewer: "Analytics Viewer",
  mentor: "Mentor",
};

function formatDate(val: unknown): string {
  if (!val) return "—";
  // ISO string
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return "—";
  }
  // Firestore timestamp object
  const sec = (val as { seconds?: number })?.seconds;
  if (sec) {
    return new Date(sec * 1000).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return "—";
}

export default function SupportInvitesPage() {
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/invites");
        if (res.status === 403) {
          setError("Access denied. Support accounts do not have permission to view invites.");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error ?? "Failed to load invites");
          return;
        }
        const data = await res.json();
        setInvites(data as InviteRow[]);
      } catch {
        setError("Failed to fetch invites. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pending = invites.filter((i) => i.status === "pending");
  const expired = invites.filter((i) => i.status === "expired");
  const accepted = invites.filter((i) => i.status === "accepted");

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <SupportSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(59,130,246,0.1)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Invites</h1>
            <p className="text-slate-400 text-xs mt-0.5">Pending and sent invites (read-only)</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.2)]">
            <span className="material-symbols-outlined text-[#3b82f6] text-[16px]">mail</span>
            <span className="text-[#3b82f6] text-xs font-semibold">{invites.length} total</span>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#3b82f6]">
                progress_activity
              </span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 bg-(--bg-card) rounded-2xl border border-[rgba(239,68,68,0.2)]">
              <span className="material-symbols-outlined text-[56px] text-red-400 mb-3">
                lock
              </span>
              <p className="text-(--text-base) font-semibold mb-1">Unable to load invites</p>
              <p className="text-slate-400 text-sm text-center max-w-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Pending", value: pending.length, color: "#f59e0b", icon: "schedule" },
                  { label: "Expired", value: expired.length, color: "#64748b", icon: "timer_off" },
                  {
                    label: "Accepted",
                    value: accepted.length,
                    color: "#10b981",
                    icon: "how_to_reg",
                  },
                ].map(({ label, value, color, icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(59,130,246,0.08)]"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18` }}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ color }}
                      >
                        {icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-(--text-base) font-bold text-2xl leading-none">{value}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-(--bg-card) rounded-2xl border border-[rgba(59,130,246,0.08)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(59,130,246,0.08)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">
                    mail
                  </span>
                  <h2 className="text-(--text-base) font-bold">All Invites</h2>
                  <span className="ml-2 text-xs text-slate-500 bg-[rgba(59,130,246,0.08)] px-2 py-0.5 rounded-full">
                    Read-only
                  </span>
                </div>

                {invites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <span className="material-symbols-outlined text-[56px] text-slate-600 mb-3">
                      mail
                    </span>
                    <p className="text-(--text-base) font-semibold mb-1">No invites found</p>
                    <p className="text-slate-400 text-sm">No invites have been sent yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-(--border-subtle)">
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Name
                          </th>
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Email
                          </th>
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Role
                          </th>
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Invited By
                          </th>
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Sent
                          </th>
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Expires
                          </th>
                          <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                        {invites.map((invite) => {
                          const statusConf = STATUS_CONFIG[invite.status] ?? {
                            label: invite.status,
                            color: "#64748b",
                          };

                          return (
                            <tr
                              key={invite.id}
                              className="hover:bg-[rgba(59,130,246,0.03)] transition-colors"
                            >
                              <td className="px-6 py-3 text-(--text-base) font-medium text-xs">
                                {invite.displayName}
                              </td>
                              <td className="px-6 py-3 text-slate-400 text-xs">
                                {invite.email}
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.12)] text-[#3b82f6]">
                                  {ROLE_LABELS[invite.role] ?? invite.role}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-slate-400 text-xs">
                                {invite.invitedByName}
                              </td>
                              <td className="px-6 py-3 text-slate-400 text-xs">
                                {formatDate(invite.invitedAt)}
                              </td>
                              <td className="px-6 py-3 text-slate-400 text-xs">
                                {formatDate(invite.expiresAt)}
                              </td>
                              <td className="px-6 py-3">
                                <span
                                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                  style={{
                                    background: `${statusConf.color}18`,
                                    color: statusConf.color,
                                  }}
                                >
                                  {statusConf.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
