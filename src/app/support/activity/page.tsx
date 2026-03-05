"use client";

import { useState } from "react";
import SupportSidebar from "@/components/SupportSidebar";
import { useCollection } from "@/hooks/useFirestore";
import { orderBy, limit } from "firebase/firestore";
import type { Activity } from "@/lib/types";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  admin_invite: { label: "Admin Invite", color: "#3b82f6" },
  role_change: { label: "Role Change", color: "#a855f7" },
  course_approved: { label: "Course Approved", color: "#10b981" },
  course_rejected: { label: "Course Rejected", color: "#ef4444" },
  invite_revoked: { label: "Invite Revoked", color: "#f59e0b" },
  invite_resent: { label: "Invite Resent", color: "#06b6d4" },
};

const FILTER_TYPES = [
  "all",
  "admin_invite",
  "role_change",
  "course_approved",
  "course_rejected",
  "invite_revoked",
  "invite_resent",
] as const;

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  const date = sec ? new Date(sec * 1000) : ts instanceof Date ? ts : null;
  if (!date) return "—";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportActivityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: activities, loading } = useCollection<Activity>(
    "activities",
    [orderBy("timestamp", "desc"), limit(200)],
    true
  );

  const filtered = activities.filter((a) => {
    const matchesType = filterType === "all" || a.type === filterType;
    const matchesSearch =
      !searchQuery ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-(--bg-page)">
        <SupportSidebar />
        <main className="ml-60 flex-1 overflow-y-auto flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#3b82f6]">
            progress_activity
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <SupportSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(59,130,246,0.1)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Activity Log</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">Recent platform-wide activity</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.2)]">
            <span className="material-symbols-outlined text-[#3b82f6] text-[16px]">timeline</span>
            <span className="text-[#3b82f6] text-xs font-semibold">
              {activities.length} events
            </span>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by description or user ID…"
                className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl pl-9 pr-4 py-2.5 text-(--text-base) text-sm placeholder:text-(--text-faint) focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-(--bg-card) border border-(--border-subtle) rounded-xl px-3 py-2.5 text-(--text-base) text-sm focus:outline-none focus:border-[rgba(59,130,246,0.4)]"
            >
              {FILTER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All Types" : TYPE_CONFIG[t]?.label ?? t}
                </option>
              ))}
            </select>
          </div>

          {/* Activity list */}
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(59,130,246,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(59,130,246,0.08)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">
                timeline
              </span>
              <h2 className="text-(--text-base) font-bold">Events</h2>
              <span className="ml-auto text-xs text-(--text-faint)">
                Showing {filtered.length} of {activities.length}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-[56px] text-(--text-faint) mb-3">
                  timeline
                </span>
                <p className="text-(--text-base) font-semibold mb-1">No activity found</p>
                <p className="text-(--text-muted) text-sm">
                  {searchQuery || filterType !== "all"
                    ? "Try adjusting your filters."
                    : "No platform activity recorded yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(255,255,255,0.03)]">
                {filtered.map((a) => {
                  const typeConf = TYPE_CONFIG[a.type];
                  const color = typeConf?.color ?? "#64748b";
                  const label = typeConf?.label ?? a.type;

                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-[rgba(59,130,246,0.03)] transition-colors"
                    >
                      {/* Dot */}
                      <div className="mt-1 shrink-0">
                        <div
                          className="w-2 h-2 rounded-full mt-1"
                          style={{ background: color }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${color}18`, color }}
                          >
                            {label}
                          </span>
                          <span className="text-(--text-faint) text-xs font-mono truncate max-w-50">
                            {a.userId ? a.userId.slice(0, 16) + "…" : "system"}
                          </span>
                        </div>
                        <p className="text-(--text-base) text-sm mt-1 line-clamp-2">
                          {a.description}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="shrink-0 text-right">
                        <span className="text-(--text-faint) text-xs">
                          {formatDate(
                            (a as unknown as Record<string, unknown>).timestamp
                          )}
                        </span>
                      </div>
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
