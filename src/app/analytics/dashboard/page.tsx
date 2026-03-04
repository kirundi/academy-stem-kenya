"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import type { Activity } from "@/lib/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const ROLE_COLORS: Record<string, string> = {
  student: "#13eca4",
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

const STATUS_COLOR: Record<string, string> = {
  active: "#10b981",
  pending: "#f59e0b",
  review: "#3b82f6",
  suspended: "#ef4444",
  rejected: "#ef4444",
};

function formatActivity(activity: Activity & { id: string }) {
  return {
    icon: activity.type === "course_complete" ? "school"
      : activity.type === "lesson_complete" ? "check_circle"
      : activity.type === "badge_earned" ? "emoji_events"
      : activity.type === "submission" ? "assignment"
      : "circle",
    color: activity.type === "course_complete" ? "#10b981"
      : activity.type === "lesson_complete" ? "#3b82f6"
      : activity.type === "badge_earned" ? "#f59e0b"
      : "#a855f7",
  };
}

function formatTs(ts: unknown) {
  if (!ts) return "";
  const sec = (ts as { seconds?: number })?.seconds;
  if (!sec) return "";
  return new Date(sec * 1000).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

export default function AnalyticsDashboard() {
  const { appUser } = useAuthContext();
  const { schools, allUsers, allCourses, activities, loading, error } = useGlobalAdminData();

  const displayName = appUser?.displayName ?? "Analytics";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#a855f7]">
          progress_activity
        </span>
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

  // Derived stats
  const totalStudents = allUsers.filter((u) => u.role === "student").length;
  const totalTeachers = allUsers.filter((u) => u.role === "teacher").length;
  const activeSchools = schools.filter((s) => s.status === "active").length;
  const publishedCourses = allCourses.filter((c) => c.status === "published" || !c.status).length;
  const pendingCourses = allCourses.filter((c) => c.status === "pending_review").length;
  const draftCourses = allCourses.filter((c) => c.status === "draft").length;

  // School status breakdown
  const schoolStatusCounts = schools.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  // Role distribution (top roles only)
  const roleCounts = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});
  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Plan breakdown
  const planCounts = schools.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1;
    return acc;
  }, {});
  const PLAN_COLOR: Record<string, string> = { premium: "#f59e0b", standard: "#3b82f6", community: "#10b981" };

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Platform Analytics</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Read-only · Live data</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[rgba(168,85,247,0.2)] flex items-center justify-center text-[#a855f7] font-bold text-sm">
          {getInitials(displayName)}
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Schools", value: schools.length, icon: "domain", color: "#a855f7", sub: `${activeSchools} active` },
            { label: "Total Students", value: totalStudents, icon: "school", color: "#13eca4", sub: `${totalTeachers} teachers` },
            { label: "Published Courses", value: publishedCourses, icon: "menu_book", color: "#3b82f6", sub: `${pendingCourses} pending review` },
            { label: "All Users", value: allUsers.length, icon: "group", color: "#f59e0b", sub: `${draftCourses} draft courses` },
          ].map(({ label, value, icon, color, sub }) => (
            <div
              key={label}
              className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-5 flex items-start gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
              </div>
              <div>
                <p className="text-(--text-base) font-bold text-2xl leading-none">{value.toLocaleString()}</p>
                <p className="text-(--text-muted) text-xs mt-0.5">{label}</p>
                <p className="text-(--text-faint) text-[10px] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* School status breakdown */}
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
            <h2 className="text-(--text-base) font-bold text-sm mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[18px]">domain</span>
              School Status
            </h2>
            <div className="space-y-3">
              {Object.entries(schoolStatusCounts).map(([status, count]) => {
                const color = STATUS_COLOR[status] ?? "#64748b";
                const pct = schools.length > 0 ? Math.round((count / schools.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-(--text-muted) capitalize">{status}</span>
                      <span className="font-bold" style={{ color }}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(schoolStatusCounts).length === 0 && (
                <p className="text-(--text-faint) text-xs">No school data yet.</p>
              )}
            </div>
          </div>

          {/* Course breakdown */}
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
            <h2 className="text-(--text-base) font-bold text-sm mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[18px]">school</span>
              Course Status
            </h2>
            <div className="space-y-3">
              {[
                { label: "Published", count: publishedCourses, color: "#10b981" },
                { label: "Pending Review", count: pendingCourses, color: "#f59e0b" },
                { label: "Draft", count: draftCourses, color: "#64748b" },
              ].map(({ label, count, color }) => {
                const pct = allCourses.length > 0 ? Math.round((count / allCourses.length) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-(--text-muted)">{label}</span>
                      <span className="font-bold" style={{ color }}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/5">
              <h3 className="text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-3">Subscription Plans</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(planCounts).map(([plan, count]) => (
                  <div key={plan} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: PLAN_COLOR[plan] ?? "#64748b" }} />
                    <span className="text-(--text-muted) text-xs capitalize">{plan}</span>
                    <span className="text-(--text-base) text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User role distribution */}
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
            <h2 className="text-(--text-base) font-bold text-sm mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[18px]">group</span>
              User Roles
            </h2>
            <div className="space-y-2.5">
              {topRoles.map(([role, count]) => {
                const color = ROLE_COLORS[role] ?? "#64748b";
                const pct = allUsers.length > 0 ? Math.round((count / allUsers.length) * 100) : 0;
                return (
                  <div key={role} className="flex items-center gap-3">
                    <div
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 w-28 text-center truncate"
                      style={{ background: `${color}18`, color }}
                    >
                      {role}
                    </div>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-(--text-base) font-bold text-xs shrink-0 w-8 text-right">{count}</span>
                  </div>
                );
              })}
              {topRoles.length === 0 && (
                <p className="text-(--text-faint) text-xs">No user data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Schools table + Activity feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top schools by student count */}
          <div className="lg:col-span-2 bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-(--text-base) font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a855f7] text-[18px]">leaderboard</span>
                Schools by Students
              </h2>
            </div>
            {schools.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-(--text-faint) block mb-2">domain_disabled</span>
                <p className="text-(--text-faint) text-sm">No schools yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {[...schools]
                  .sort((a, b) => (b.studentCount ?? 0) - (a.studentCount ?? 0))
                  .slice(0, 8)
                  .map((school, i) => {
                    const statusColor = STATUS_COLOR[school.status] ?? "#64748b";
                    return (
                      <div key={school.id} className="flex items-center gap-4 px-6 py-3">
                        <span className="text-(--text-faint) font-mono text-xs w-5 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-(--text-base) text-sm font-medium truncate">{school.name}</p>
                          <p className="text-(--text-faint) text-xs">{school.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-(--text-base) font-bold text-sm">{(school.studentCount ?? 0).toLocaleString()}</p>
                          <p className="text-(--text-faint) text-[10px]">students</p>
                        </div>
                        <div
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: `${statusColor}18`, color: statusColor }}
                        >
                          {school.status}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-(--text-base) font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a855f7] text-[18px]">timeline</span>
                Recent Activity
              </h2>
            </div>
            {activities.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-(--text-faint) block mb-2">notifications_none</span>
                <p className="text-(--text-faint) text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[420px] divide-y divide-white/[0.04]">
                {activities.slice(0, 20).map((activity) => {
                  const { icon, color } = formatActivity(activity);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 px-5 py-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${color}18` }}
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ color }}>{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-(--text-muted) text-xs leading-relaxed line-clamp-2">{activity.description}</p>
                        <p className="text-(--text-faint) text-[10px] mt-0.5">{formatTs(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
