"use client";

import { useMemo, useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { exportToCsv } from "@/lib/csv-export";

const DEPT_COLORS = ["#13eca4", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

const weekBars = [
  { day: "Mon", h: 40 },
  { day: "Tue", h: 60 },
  { day: "Wed", h: 55 },
  { day: "Thu", h: 80 },
  { day: "Fri", h: 75 },
  { day: "Sat", h: 90 },
  { day: "Sun", h: 65 },
];

const RANK_COLORS = [
  "text-amber-400 bg-amber-400/10",
  "text-(--text-muted) bg-slate-400/10",
  "text-orange-400 bg-orange-400/10",
  "text-(--text-faint) bg-slate-500/10",
];

export default function SchoolAnalyticsPage() {
  const { schools, allCourses, teachers, students, loading } = useGlobalAdminData();
  const [dateRange, setDateRange] = useState("30d");

  // Departments: group courses by category, show % of total courses
  const departments = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allCourses) {
      const cat = c.category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    const total = allCourses.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], i) => ({
        name,
        pct: Math.round((count / total) * 100),
        color: DEPT_COLORS[i % DEPT_COLORS.length],
      }));
  }, [allCourses]);

  const topDept = departments[0]?.name ?? "—";

  // Top performing schools sorted by healthScore
  const topSchools = useMemo(() => {
    return [...schools]
      .filter((s) => s.status === "active")
      .sort((a, b) => (b.healthScore ?? 0) - (a.healthScore ?? 0))
      .slice(0, 4)
      .map((s, i) => {
        const schoolTeachers = teachers.filter((t) => t.schoolId === s.id).length;
        return {
          rank: i + 1,
          name: s.name,
          dept: s.plan ?? s.type,
          teacher:
            schoolTeachers > 0
              ? `${schoolTeachers} teacher${schoolTeachers !== 1 ? "s" : ""}`
              : s.location,
          score: s.healthScore ?? 0,
          rankColor: RANK_COLORS[i] ?? RANK_COLORS[3],
        };
      });
  }, [schools, teachers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page) flex flex-col">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 px-8 py-6 border-b border-(--border-subtle)">
        <div>
          <h1 className="text-(--text-base) text-3xl font-black tracking-tight">
            Platform Performance Analytics
          </h1>
          <p className="text-(--text-muted) mt-1">
            {students.length.toLocaleString()} students across {schools.length} active school
            {schools.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-11 px-4 rounded-xl border border-(--border-subtle) bg-transparent text-(--text-muted) text-sm font-bold hover:bg-(--glass-bg) transition-colors focus:outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={() => exportToCsv("analytics-report", schools.map((s) => ({
              name: s.name, location: s.location, plan: s.plan, healthScore: s.healthScore, students: s.studentCount,
            })), [
              { key: "name", label: "School" }, { key: "location", label: "Location" },
              { key: "plan", label: "Plan" }, { key: "healthScore", label: "Health" },
              { key: "students", label: "Students" },
            ])}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>Export Report
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "person",
              label: "Total Students",
              value: students.length.toLocaleString(),
              badge: null,
              badgeUp: null,
            },
            {
              icon: "school",
              label: "Active Schools",
              value: String(schools.filter((s) => s.status === "active").length),
              badge: null,
              badgeUp: null,
            },
            {
              icon: "menu_book",
              label: "Total Courses",
              value: String(allCourses.length),
              badge: null,
              badgeUp: null,
            },
            {
              icon: "workspace_premium",
              label: "Top Department",
              value: topDept,
              badge: null,
              badgeUp: null,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-(--bg-card) rounded-2xl p-5 border border-(--border-subtle) flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined p-2 bg-[rgba(19,236,164,0.08)] text-[#13eca4] rounded-lg text-[20px]">
                  {s.icon}
                </span>
              </div>
              <p className="text-(--text-muted) text-sm font-medium mt-1">{s.label}</p>
              <p className="text-(--text-base) text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-(--text-base) font-bold text-lg">Student Engagement Trends</h3>
                <p className="text-(--text-faint) text-xs mt-0.5">
                  Illustrative — requires analytics pipeline
                </p>
              </div>
            </div>
            <div className="h-56 flex items-end gap-2 relative">
              {weekBars.map((b, i) => (
                <div
                  key={b.day}
                  className="flex-1 flex flex-col gap-1 items-center justify-end h-full"
                >
                  <div
                    className={`w-full rounded-t relative group ${i === 5 ? "bg-[rgba(19,236,164,0.4)]" : "bg-[rgba(19,236,164,0.15)]"}`}
                    style={{ height: `${b.h}%` }}
                  >
                    <div
                      className={`absolute bottom-0 w-full h-1 bg-[#13eca4] ${i === 5 ? "h-2" : ""}`}
                    />
                  </div>
                </div>
              ))}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map((l) => (
                  <div key={l} className="border-b border-(--border-subtle) w-full h-0" />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-bold text-(--text-faint) uppercase">
              {weekBars.map((b) => (
                <span key={b.day}>{b.day}</span>
              ))}
            </div>
          </div>

          {/* Dept Distribution Bars */}
          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6 flex flex-col">
            <h3 className="text-(--text-base) font-bold text-lg mb-1">Course Distribution</h3>
            <p className="text-(--text-faint) text-xs mb-5">By department category</p>
            {departments.length === 0 ? (
              <p className="text-(--text-faint) text-sm flex-1 flex items-center justify-center">
                No course data yet
              </p>
            ) : (
              <div className="flex-1 flex flex-col justify-center gap-5">
                {departments.map((d) => (
                  <div key={d.name} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-(--text-muted)">{d.name}</span>
                      <span className="text-(--text-base) font-bold">{d.pct}%</span>
                    </div>
                    <div className="w-full bg-(--input-bg) h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.pct}%`, background: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Schools Table */}
        <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden pb-6">
          <div className="px-6 py-5 border-b border-(--border-subtle) flex justify-between items-center">
            <h3 className="text-(--text-base) font-bold text-lg">Top Performing Schools</h3>
            <a
              href="/dashboard/schools"
              className="text-[#13eca4] text-sm font-semibold hover:underline"
            >
              View All
            </a>
          </div>
          {topSchools.length === 0 ? (
            <div className="px-6 py-12 text-center text-(--text-faint) text-sm">
              No active schools yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[rgba(255,255,255,0.02)] text-(--text-faint) text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">School</th>
                    <th className="px-6 py-4">Staff</th>
                    <th className="px-6 py-4">Health Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                  {topSchools.map((c) => (
                    <tr key={c.name} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                      <td className="px-6 py-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${c.rankColor}`}
                        >
                          {c.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-(--text-base) font-bold">{c.name}</p>
                        <p className="text-xs text-(--text-faint) capitalize">{c.dept}</p>
                      </td>
                      <td className="px-6 py-4 text-(--text-muted)">{c.teacher}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-(--text-base) font-bold">{c.score}</span>
                          <div className="w-12 bg-(--input-bg) h-1.5 rounded-full">
                            <div
                              className="bg-[#13eca4] h-full rounded-full"
                              style={{ width: `${Math.min(c.score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
