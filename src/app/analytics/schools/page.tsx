"use client";

import { useGlobalAdminData } from "@/hooks/useAdminData";

const STATUS_COLOR: Record<string, string> = {
  active: "#10b981",
  pending: "#f59e0b",
  review: "#3b82f6",
  suspended: "#ef4444",
  rejected: "#ef4444",
};

function formatDate(ts: unknown) {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  if (!sec) return "—";
  return new Date(sec * 1000).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export default function AnalyticsSchoolsPage() {
  const { schools, allUsers, loading, error } = useGlobalAdminData();

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

  const activeSchools = schools.filter((s) => s.status === "active");
  const pendingSchools = schools.filter((s) => s.status === "pending");

  const schoolsWithCounts = schools.map((school) => {
    const studentCount = allUsers.filter(
      (u) => u.schoolId === school.id && u.role === "student"
    ).length;
    const teacherCount = allUsers.filter(
      (u) => u.schoolId === school.id && u.role === "teacher"
    ).length;
    return { ...school, studentCount, teacherCount };
  });

  // Sort by student count descending
  schoolsWithCounts.sort((a, b) => b.studentCount - a.studentCount);

  const statsByStatus = Object.entries(
    schools.reduce((acc: Record<string, number>, s) => {
      const key = s.status ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Schools Analytics</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">{schools.length} schools · {activeSchools.length} active</p>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Schools", value: schools.length, icon: "domain", color: "#a855f7" },
            { label: "Active", value: activeSchools.length, icon: "check_circle", color: "#10b981" },
            { label: "Pending", value: pendingSchools.length, icon: "pending", color: "#f59e0b" },
            { label: "Avg Students", value: schools.length > 0 ? Math.round(allUsers.filter((u) => u.role === "student").length / schools.length) : 0, icon: "people", color: "#3b82f6" },
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

        {/* Status breakdown */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
          <h2 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a855f7] text-[20px]">donut_small</span>
            School Status Breakdown
          </h2>
          <div className="flex flex-wrap gap-3">
            {statsByStatus.map(([status, count]) => {
              const color = STATUS_COLOR[status] ?? "#64748b";
              const pct = schools.length > 0 ? Math.round((count / schools.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3 p-3 rounded-xl border flex-1 min-w-[140px]" style={{ borderColor: `${color}25`, background: `${color}08` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color }}>domain</span>
                  </div>
                  <div>
                    <p className="text-(--text-base) font-bold text-lg leading-none">{count}</p>
                    <p className="text-(--text-muted) text-xs capitalize">{status} · {pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schools table */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(168,85,247,0.08)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a855f7] text-[20px]">table_chart</span>
            <h2 className="text-(--text-base) font-bold">All Schools</h2>
            <span className="ml-auto text-(--text-faint) text-xs">{schools.length} total</span>
          </div>

          {schools.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-(--text-faint) mb-3 block">domain_disabled</span>
              <p className="text-(--text-muted) text-sm">No schools registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-(--border-subtle)">
                    <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">School</th>
                    <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">Students</th>
                    <th className="text-right px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">Teachers</th>
                    <th className="text-left px-6 py-3 text-(--text-muted) font-semibold text-xs uppercase tracking-wide">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                  {schoolsWithCounts.map((school) => {
                    const statusColor = STATUS_COLOR[school.status ?? "pending"] ?? "#64748b";
                    return (
                      <tr key={school.id} className="hover:bg-[rgba(168,85,247,0.03)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center text-[#a855f7] shrink-0">
                              <span className="material-symbols-outlined text-[16px]">domain</span>
                            </div>
                            <div>
                              <p className="text-(--text-base) font-medium">{school.name}</p>
                              <p className="text-(--text-faint) text-xs font-mono">{school.id.slice(0, 12)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ background: `${statusColor}18`, color: statusColor }}
                          >
                            {school.status ?? "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-(--text-base) font-bold">{school.studentCount}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-(--text-base) font-bold">{school.teacherCount}</span>
                        </td>
                        <td className="px-6 py-4 text-(--text-muted) text-xs">
                          {formatDate((school as unknown as Record<string, unknown>).createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
