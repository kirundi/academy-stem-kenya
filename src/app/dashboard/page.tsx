"use client";

import StatCard from "@/components/StatCard";
import { useGlobalAdminData } from "@/hooks/useAdminData";

const planColors: Record<string, string> = {
  premium: "#13eca4",
  standard: "#3b82f6",
  community: "#8b5cf6",
};

const healthColor = (h: number) => {
  if (h >= 80) return "#13eca4";
  if (h >= 60) return "#f59e0b";
  return "#ff4d4d";
};

export default function GlobalAdminDashboard() {
  const { schools, allUsers, allCourses, teachers, students, loading } = useGlobalAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  // Compute plan breakdown
  const planCounts: Record<string, number> = {};
  schools.forEach((s) => {
    const plan = s.plan ?? "community";
    planCounts[plan] = (planCounts[plan] ?? 0) + 1;
  });
  const planBreakdown = [
    { plan: "Premium", key: "premium", color: "#13eca4" },
    { plan: "Standard", key: "standard", color: "#3b82f6" },
    { plan: "Community", key: "community", color: "#8b5cf6" },
  ].map((p) => ({
    ...p,
    count: planCounts[p.key] ?? 0,
    pct: schools.length > 0 ? Math.round(((planCounts[p.key] ?? 0) / schools.length) * 100) : 0,
  }));

  // Compute average health
  const avgHealth = schools.length > 0
    ? Math.round(schools.reduce((sum, s) => sum + (s.healthScore ?? 0), 0) / schools.length)
    : 0;

  // Schools needing attention
  const needsAttention = schools.filter((s) => (s.healthScore ?? 0) < 60);

  // Location-based grouping for regions
  const locationMap = new Map<string, { schools: number; students: number }>();
  schools.forEach((s) => {
    const loc = s.location ?? "Unknown";
    const existing = locationMap.get(loc) ?? { schools: 0, students: 0 };
    existing.schools += 1;
    existing.students += Number(s.studentCount) || 0;
    locationMap.set(loc, existing);
  });
  const topRegions = Array.from(locationMap.entries())
    .sort((a, b) => b[1].schools - a[1].schools)
    .slice(0, 5)
    .map(([region, data]) => ({ region, ...data }));

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Global Overview</h1>
          <p className="text-slate-400 text-xs mt-0.5">Platform-wide metrics · STEM Impact Academy</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.12)] text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:border-[#13eca4] hover:text-[#13eca4] transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Onboard School
          </button>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="domain" iconColor="#13eca4" label="Partner Schools" value={schools.length} change={`${schools.length} total`} changeType="positive" />
          <StatCard icon="group" iconColor="#3b82f6" label="Total Students" value={students.length.toLocaleString()} change={`${students.length} enrolled`} changeType="positive" />
          <StatCard icon="school" iconColor="#8b5cf6" label="Educators" value={teachers.length.toLocaleString()} change={`${teachers.length} active`} changeType="positive" />
          <StatCard icon="task_alt" iconColor="#f59e0b" label="Total Courses" value={allCourses.length.toLocaleString()} change={`${allCourses.length} available`} changeType="positive" />
        </div>

        {/* Platform Health Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">Platform Health</h2>
              <span className="text-xs text-[#13eca4] font-bold bg-[rgba(19,236,164,0.1)] px-3 py-1 rounded-full">
                {needsAttention.length === 0 ? "All Systems Operational" : `${needsAttention.length} Need Attention`}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Avg. School Health", value: `${avgHealth}%`, color: "#13eca4" },
                { label: "Total Users", value: allUsers.length.toLocaleString(), color: "#3b82f6" },
                { label: "Total Courses", value: String(allCourses.length), color: "#8b5cf6" },
                { label: "Teachers", value: String(teachers.length), color: "#f59e0b" },
              ].map((m) => (
                <div key={m.label} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
                  <p className="text-2xl font-bold mb-1" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-slate-500 text-xs">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6">
            <h2 className="text-white font-bold mb-4">Schools by Plan</h2>
            <div className="space-y-3">
              {planBreakdown.map((p) => (
                <div key={p.plan}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: p.color }} className="font-semibold">{p.plan}</span>
                    <span className="text-slate-400">{p.count} schools ({p.pct}%)</span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full">
                    <div className="h-2 rounded-full" style={{ background: p.color, width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Region Stats */}
        <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6 mb-8">
          <h2 className="text-white font-bold mb-4">Top Regions</h2>
          {topRegions.length === 0 ? (
            <p className="text-slate-500 text-sm">No regional data available yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topRegions.map((r) => (
                <div key={r.region} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 hover:bg-[rgba(19,236,164,0.04)] transition-colors cursor-pointer">
                  <p className="text-white font-bold">{r.region}</p>
                  <p className="text-[#13eca4] text-xl font-bold my-1">{r.schools}</p>
                  <p className="text-slate-500 text-xs">{r.schools} schools · {r.students.toLocaleString()} students</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schools Table */}
        <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.06)] flex items-center justify-between">
            <h2 className="text-white font-bold">Partner Schools</h2>
            <div className="flex items-center gap-2">
              {needsAttention.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.15)] rounded-lg px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
                  <span className="text-xs text-[#ff4d4d] font-semibold">{needsAttention.length} Needs Attention</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Search schools..."
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder-slate-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#13eca4] w-44"
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-[rgba(255,255,255,0.05)]">
                <th className="px-6 py-3 text-left font-medium">School</th>
                <th className="px-4 py-3 text-center font-medium">Plan</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Health</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No schools registered yet</td>
                </tr>
              ) : (
                schools.slice(0, 10).map((s, i) => {
                  const plan = (s.plan ?? "community").charAt(0).toUpperCase() + (s.plan ?? "community").slice(1);
                  const hc = healthColor(s.healthScore ?? 0);
                  return (
                    <tr key={s.id} className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[rgba(19,236,164,0.08)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-[#13eca4]">domain</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{s.name}</p>
                            <p className="text-slate-500 text-xs">{s.location ?? "Kenya"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: planColors[s.plan] ?? "#8b5cf6", background: `${planColors[s.plan] ?? "#8b5cf6"}18` }}>
                          {plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs font-bold capitalize ${s.status === "active" ? "text-emerald-500" : s.status === "review" ? "text-amber-500" : "text-slate-400"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full max-w-15">
                            <div className="h-1.5 rounded-full" style={{ background: hc, width: `${s.healthScore ?? 0}%` }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: hc }}>{s.healthScore ?? 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-slate-400 hover:text-[#13eca4] transition-colors text-xs font-semibold mr-3">
                          Audit
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <p className="text-slate-500 text-xs">Showing {Math.min(schools.length, 10)} of {schools.length} schools</p>
            <a href="/dashboard/schools" className="text-[#13eca4] text-xs font-semibold hover:opacity-80 transition-opacity">
              View All Schools &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
