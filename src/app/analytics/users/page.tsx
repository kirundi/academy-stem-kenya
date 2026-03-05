"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";

const ROLE_COLORS: Record<string, string> = {
  student: "#2dd4bf",
  teacher: "#3b82f6",
  school_admin: "#f59e0b",
  editor: "#ec4899",
  admin: "#8b5cf6",
  super_admin: "#ef4444",
  parent: "#8b5cf6",
  mentor: "#10b981",
  support: "#3b82f6",
  observer: "#06b6d4",
  content_reviewer: "#f59e0b",
  analytics_viewer: "#a855f7",
};

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School Admin",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
  parent: "Parent",
  mentor: "Mentor",
  support: "Support",
  observer: "Observer",
  content_reviewer: "Content Reviewer",
  analytics_viewer: "Analytics Viewer",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(ts: unknown) {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  if (!sec) return "—";
  return new Date(sec * 1000).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export default function AnalyticsUsersPage() {
  const { allUsers, loading, error } = useGlobalAdminData();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#a855f7]">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-3">
        <span className="material-symbols-outlined text-[48px] text-red-400">error</span>
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  // Role distribution
  const roleCounts = allUsers.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const roleEntries = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);

  const filtered = allUsers.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesSearch =
      !searchQuery ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Users Analytics</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">{allUsers.length} total users across all roles</p>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: allUsers.length, icon: "group", color: "#a855f7" },
            { label: "Students", value: roleCounts.student ?? 0, icon: "school", color: "var(--primary-green)" },
            { label: "Teachers", value: roleCounts.teacher ?? 0, icon: "person_book", color: "#3b82f6" },
            { label: "Staff", value: allUsers.filter((u) => !["student", "parent"].includes(u.role)).length, icon: "badge", color: "#f59e0b" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
              </div>
              <div>
                <p className="text-(--text-base) font-bold text-2xl leading-none">{value}</p>
                <p className="text-(--text-muted) text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Role distribution */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
          <h2 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a855f7] text-[20px]">bar_chart</span>
            User Distribution by Role
          </h2>
          <div className="space-y-3">
            {roleEntries.map(([role, count]) => {
              const color = ROLE_COLORS[role] ?? "#64748b";
              const pct = allUsers.length > 0 ? (count / allUsers.length) * 100 : 0;
              return (
                <div key={role} className="flex items-center gap-4">
                  <div className="w-32 text-xs text-(--text-muted) text-right shrink-0">{ROLE_LABELS[role] ?? role}</div>
                  <div className="flex-1 h-6 bg-(--bg-page) rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 1)}%`, background: color }}
                    />
                  </div>
                  <div className="w-12 text-right shrink-0">
                    <span className="text-(--text-base) font-bold text-sm">{count}</span>
                  </div>
                  <div className="w-12 text-right shrink-0">
                    <span className="text-(--text-faint) text-xs">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User list with filter */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(168,85,247,0.08)] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[20px]">manage_accounts</span>
              <h2 className="text-(--text-base) font-bold">All Users</h2>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-faint) text-[16px]">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users…"
                  className="bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg pl-8 pr-3 py-1.5 text-(--text-base) text-xs placeholder:text-(--text-faint) focus:outline-none focus:border-[rgba(168,85,247,0.4)]"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg px-3 py-1.5 text-(--text-base) text-xs focus:outline-none"
              >
                <option value="all">All roles</option>
                {Object.keys(ROLE_LABELS).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">School</th>
                  <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                {filtered.slice(0, visibleCount).map((u) => {
                  const color = ROLE_COLORS[u.role] ?? "#64748b";
                  return (
                    <tr key={u.id} className="hover:bg-[rgba(168,85,247,0.03)] transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${color}18`, color }}>
                            {getInitials(u.displayName ?? u.email ?? "?")}
                          </div>
                          <div>
                            <p className="text-(--text-base) font-medium text-xs">{u.displayName}</p>
                            <p className="text-(--text-faint) text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-(--text-muted) text-xs font-mono">
                        {u.schoolId ? u.schoolId.slice(0, 12) + "…" : "—"}
                      </td>
                      <td className="px-6 py-3 text-(--text-muted) text-xs">
                        {formatDate((u as unknown as Record<string, unknown>).createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > visibleCount && (
              <div className="text-center py-3">
                <p className="text-(--text-faint) text-xs mb-2">Showing {visibleCount} of {filtered.length} users</p>
                <button
                  onClick={() => setVisibleCount((v) => v + 100)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(168,85,247,0.1)] text-[#a855f7] hover:bg-[rgba(168,85,247,0.2)] transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-(--text-faint) mb-2 block">person_off</span>
                <p className="text-(--text-muted) text-sm">No users match your filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
