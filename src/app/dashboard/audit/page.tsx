"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { formatTimestamp } from "@/lib/timestamps";
import { exportToCsv } from "@/lib/csv-export";

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const { activities, allUsers, loading } = useGlobalAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  const userMap = new Map(allUsers.map((u) => [u.id ?? u.uid, u.displayName]));

  const filtered = activities.filter(
    (a) =>
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase()) ||
      (userMap.get(a.userId) ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const typeIcon: Record<string, string> = {
    login: "login",
    logout: "logout",
    create: "add_circle",
    update: "edit",
    delete: "delete",
    enroll: "person_add",
    submit: "task_alt",
  };

  const typeColor: Record<string, string> = {
    login: "#13eca4",
    logout: "#f59e0b",
    create: "#3b82f6",
    update: "#8b5cf6",
    delete: "#ff4d4d",
    enroll: "#13eca4",
    submit: "#3b82f6",
  };

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Audit Log</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Platform-wide activity trail · {activities.length} events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCsv("audit-log", filtered.map((a) => ({
              user: userMap.get(a.userId) ?? "Unknown", type: a.type, description: a.description, timestamp: formatTimestamp(a.timestamp),
            })), [
              { key: "user", label: "User" }, { key: "type", label: "Type" },
              { key: "description", label: "Description" }, { key: "timestamp", label: "Timestamp" },
            ])}
            className="flex items-center gap-1.5 border border-(--border-medium) text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:border-[#13eca4] hover:text-[#13eca4] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Logs
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, or description..."
            className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg pl-10 pr-4 py-2 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
          />
        </div>

        {/* Activity Timeline */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.06)]">
            <h2 className="text-(--text-base) font-bold">Activity Timeline</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Showing {filtered.length} of {activities.length} events
            </p>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">No activity logs found</div>
            ) : (
              filtered.map((a) => {
                const icon = typeIcon[a.type] ?? "info";
                const color = typeColor[a.type] ?? "#13eca4";
                const userName = userMap.get(a.userId) ?? "Unknown User";
                const timestamp = formatTimestamp(a.timestamp);

                return (
                  <div
                    key={a.id}
                    className="px-6 py-4 flex items-start gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}15` }}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ color }}>
                        {icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">
                        <span className="font-bold text-(--text-base)">{userName}</span> {a.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ color, background: `${color}15` }}
                        >
                          {a.type}
                        </span>
                        <span className="text-xs text-slate-500">{timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
