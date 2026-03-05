"use client";

import { useGlobalAdminData } from "@/hooks/useAdminData";

export default function ReportsPage() {
  const { schools, allUsers, allCourses, teachers, students, loading } = useGlobalAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  // Compute plan breakdown
  const planCounts: Record<string, number> = {};
  schools.forEach((s) => {
    const plan = s.plan ?? "community";
    planCounts[plan] = (planCounts[plan] ?? 0) + 1;
  });

  // Compute average health
  const avgHealth =
    schools.length > 0
      ? Math.round(schools.reduce((sum, s) => sum + (s.healthScore ?? 0), 0) / schools.length)
      : 0;

  // Location stats
  const locationMap = new Map<string, { schools: number; students: number; teachers: number }>();
  schools.forEach((s) => {
    const loc = s.location ?? "Unknown";
    const existing = locationMap.get(loc) ?? { schools: 0, students: 0, teachers: 0 };
    existing.schools += 1;
    existing.students += Number(s.studentCount) || 0;
    locationMap.set(loc, existing);
  });
  const regionData = Array.from(locationMap.entries()).sort((a, b) => b[1].schools - a[1].schools);

  // Course category breakdown
  const categoryMap = new Map<string, number>();
  allCourses.forEach((c) => {
    const cat = c.category ?? "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
  });
  const categoryData = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);

  const reportCards = [
    { icon: "domain", color: "var(--primary-green)", label: "Total Schools", value: schools.length },
    { icon: "group", color: "#3b82f6", label: "Total Students", value: students.length },
    { icon: "school", color: "#8b5cf6", label: "Total Teachers", value: teachers.length },
    { icon: "library_books", color: "#f59e0b", label: "Total Courses", value: allCourses.length },
    { icon: "people", color: "#ec4899", label: "Total Users", value: allUsers.length },
    {
      icon: "health_and_safety",
      color: "var(--primary-green)",
      label: "Avg. Health Score",
      value: `${avgHealth}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Reports</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Platform analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-(--border-medium) text-(--text-muted) text-sm font-semibold px-4 py-2 rounded-lg hover:border-(--primary-green) hover:text-(--primary-green) transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Full Report
          </button>
          <button className="flex items-center gap-1.5 border border-(--border-medium) text-(--text-muted) text-sm font-semibold px-4 py-2 rounded-lg hover:border-(--primary-green) hover:text-(--primary-green) transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Summary Stats */}
        <section>
          <h2 className="text-(--text-base) font-bold text-xl mb-4">Platform Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {reportCards.map((r) => (
              <div
                key={r.label}
                className="bg-(--bg-card) p-5 rounded-2xl border border-(--border-subtle) text-center"
              >
                <span
                  className="material-symbols-outlined text-[28px] mb-2 block"
                  style={{ color: r.color }}
                >
                  {r.icon}
                </span>
                <p className="text-(--text-base) text-2xl font-bold">
                  {typeof r.value === "number" ? r.value.toLocaleString() : r.value}
                </p>
                <p className="text-(--text-faint) text-xs mt-1">{r.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plan Distribution */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
            <h2 className="text-(--text-base) font-bold mb-4">Schools by Plan</h2>
            <div className="space-y-4">
              {[
                { plan: "Premium", key: "premium", color: "var(--primary-green)" },
                { plan: "Standard", key: "standard", color: "#3b82f6" },
                { plan: "Community", key: "community", color: "#8b5cf6" },
              ].map((p) => {
                const count = planCounts[p.key] ?? 0;
                const pct = schools.length > 0 ? Math.round((count / schools.length) * 100) : 0;
                return (
                  <div key={p.plan}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color: p.color }} className="font-semibold">
                        {p.plan}
                      </span>
                      <span className="text-(--text-muted)">
                        {count} schools ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 bg-(--input-bg) rounded-full">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ background: p.color, width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
            <h2 className="text-(--text-base) font-bold mb-4">Courses by Category</h2>
            {categoryData.length === 0 ? (
              <p className="text-(--text-faint) text-sm">No courses available yet.</p>
            ) : (
              <div className="space-y-4">
                {categoryData.slice(0, 5).map(([cat, count], i) => {
                  const colors = ["#2dd4bf", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];
                  const pct =
                    allCourses.length > 0 ? Math.round((count / allCourses.length) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span
                          style={{ color: colors[i % colors.length] }}
                          className="font-semibold"
                        >
                          {cat}
                        </span>
                        <span className="text-(--text-muted)">
                          {count} courses ({pct}%)
                        </span>
                      </div>
                      <div className="h-3 bg-(--input-bg) rounded-full">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ background: colors[i % colors.length], width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Regional Report Table */}
        <section className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(45,212,191,0.06)]">
            <h2 className="text-(--text-base) font-bold">Regional Breakdown</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-(--text-faint) text-xs border-b border-(--border-subtle)">
                <th className="px-6 py-3 text-left font-medium">Region</th>
                <th className="px-4 py-3 text-center font-medium">Schools</th>
                <th className="px-4 py-3 text-center font-medium">Reported Students</th>
                <th className="px-4 py-3 text-center font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {regionData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-(--text-faint)">
                    No regional data available
                  </td>
                </tr>
              ) : (
                regionData.map(([region, data], i) => {
                  const pct =
                    schools.length > 0 ? Math.round((data.schools / schools.length) * 100) : 0;
                  return (
                    <tr
                      key={region}
                      className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(45,212,191,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-(--primary-green) text-[18px]">
                            location_on
                          </span>
                          <span className="text-(--text-base) font-semibold">{region}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-(--text-base) font-semibold">
                        {data.schools}
                      </td>
                      <td className="px-4 py-4 text-center text-(--text-muted)">
                        {data.students.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="flex-1 h-1.5 bg-(--input-bg) rounded-full max-w-15">
                            <div
                              className="h-1.5 rounded-full bg-(--primary-green)"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-(--primary-green)">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        {/* User Role Distribution */}
        <section className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
          <h2 className="text-(--text-base) font-bold mb-4">User Role Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { role: "Students", count: students.length, color: "#3b82f6", icon: "group" },
              { role: "Teachers", count: teachers.length, color: "var(--primary-green)", icon: "school" },
              {
                role: "School Admins",
                count: allUsers.filter((u) => u.role === "school_admin").length,
                color: "#f59e0b",
                icon: "admin_panel_settings",
              },
              {
                role: "Admins",
                count: allUsers.filter((u) => u.role === "admin" || u.role === "super_admin")
                  .length,
                color: "var(--accent-red)",
                icon: "security",
              },
            ].map((r) => {
              const pct = allUsers.length > 0 ? Math.round((r.count / allUsers.length) * 100) : 0;
              return (
                <div key={r.role} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: r.color }}
                    >
                      {r.icon}
                    </span>
                    <span className="text-(--text-base) font-semibold text-sm">{r.role}</span>
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ color: r.color }}>
                    {r.count.toLocaleString()}
                  </p>
                  <div className="h-2 bg-(--input-bg) rounded-full mt-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ background: r.color, width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-(--text-faint) text-xs mt-1">{pct}% of all users</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
