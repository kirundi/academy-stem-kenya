"use client";

import { useSchoolAdminData } from "@/hooks/useAdminData";

export default function SchoolAnalyticsPage() {
  const { teachers, students, classrooms, loading } = useSchoolAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  // Derive analytics from real data
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClassrooms = classrooms.length;
  const avgProgress = classrooms.length > 0
    ? Math.round(classrooms.reduce((sum, c) => sum + (c.avgProgress ?? 0), 0) / classrooms.length)
    : 0;

  // Department breakdown from teacher subjects
  const deptMap = new Map<string, number>();
  teachers.forEach((t) => {
    const dept = t.department ?? "General";
    deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
  });
  const departments = Array.from(deptMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map((entry, i) => {
      const colors = ["#13eca4", "#3b82f6", "#8b5cf6", "#f59e0b"];
      return { name: entry[0], count: entry[1], pct: totalTeachers > 0 ? Math.round((entry[1] / totalTeachers) * 100) : 0, color: colors[i % colors.length] };
    });

  // Classroom leaderboard by avgProgress
  const topClassrooms = [...classrooms]
    .sort((a, b) => (b.avgProgress ?? 0) - (a.avgProgress ?? 0))
    .slice(0, 5);

  const teacherMap = new Map(teachers.map((t) => [t.id, t.displayName]));

  // Simulated weekly bars based on classrooms count
  const weekBars = [
    { day: "Mon", h: 40 }, { day: "Tue", h: 60 }, { day: "Wed", h: 55 },
    { day: "Thu", h: 80 }, { day: "Fri", h: 75 }, { day: "Sat", h: 90 }, { day: "Sun", h: 65 },
  ];

  return (
    <div className="min-h-screen bg-[#10221c] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgba(19,236,164,0.1)] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#13eca4] text-[18px]">analytics</span>
            </div>
            <span className="text-white font-bold">STEM Learn Admin</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <span className="text-[#13eca4] font-semibold border-b-2 border-[#13eca4] pb-0.5">Dashboard</span>
            <a href="#" className="text-slate-400 hover:text-[#13eca4] transition-colors font-medium">Departments</a>
            <a href="/admin/school/classrooms" className="text-slate-400 hover:text-[#13eca4] transition-colors font-medium">Classrooms</a>
            <a href="/admin/school/teachers" className="text-slate-400 hover:text-[#13eca4] transition-colors font-medium">Teachers</a>
            <a href="#" className="text-slate-400 hover:text-[#13eca4] transition-colors font-medium">Reports</a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input placeholder="Search analytics..." className="bg-transparent border-none text-white text-sm placeholder-slate-500 focus:outline-none ml-2 w-36" />
          </div>
          <button className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-[rgba(19,236,164,0.1)] border-2 border-[rgba(19,236,164,0.2)]" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 border-r border-[rgba(255,255,255,0.06)] p-4 flex flex-col gap-4 shrink-0">
          <div className="flex flex-col gap-1">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-3 mb-2">Main Menu</p>
            {[
              { icon: "dashboard",  label: "Overview",    active: true,  href: "#" },
              { icon: "trending_up",label: "Performance", active: false, href: "#" },
              { icon: "groups",     label: "Engagement",  active: false, href: "#" },
              { icon: "leaderboard",label: "Leaderboard", active: false, href: "#" },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active ? "bg-[rgba(19,236,164,0.1)] text-[#13eca4]" : "text-slate-400 hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-auto p-4 rounded-xl bg-[rgba(19,236,164,0.05)] border border-[rgba(19,236,164,0.15)]">
            <p className="text-[#13eca4] text-xs font-bold mb-1">PRO TIP</p>
            <p className="text-slate-400 text-xs leading-relaxed">Monthly board reports are ready to export. Check the summary tab.</p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 px-8 py-6 border-b border-[rgba(255,255,255,0.06)]">
            <div>
              <h1 className="text-white text-3xl font-black tracking-tight">School-Wide Performance Analytics</h1>
              <p className="text-slate-400 mt-1">Monitoring {totalStudents.toLocaleString()} students across {totalClassrooms} classrooms.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 h-11 px-4 rounded-xl border border-[rgba(255,255,255,0.1)] text-slate-300 text-sm font-bold hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>Last 30 Days
              </button>
              <button className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">download</span>Export Report
              </button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "person",             label: "Total Students",   value: totalStudents.toLocaleString(), badge: `${totalStudents} enrolled`, badgeUp: true },
                { icon: "speed",              label: "Avg. Progress",    value: `${avgProgress}%`, badge: avgProgress > 50 ? "On Track" : "Needs Attention", badgeUp: avgProgress > 50 },
                { icon: "check_circle",       label: "Classrooms",       value: String(totalClassrooms), badge: `${totalClassrooms} active`, badgeUp: true },
                { icon: "workspace_premium",  label: "Teachers",         value: String(totalTeachers), badge: `${totalTeachers} active`, badgeUp: null },
              ].map((s) => (
                <div key={s.label} className="bg-[#1a2e27] rounded-2xl p-5 border border-[rgba(19,236,164,0.07)] flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined p-2 bg-[rgba(19,236,164,0.08)] text-[#13eca4] rounded-lg text-[20px]">{s.icon}</span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${s.badgeUp === true ? "text-emerald-500" : s.badgeUp === false ? "text-rose-500" : "text-slate-400"}`}>
                      {s.badgeUp !== null && <span className="material-symbols-outlined text-[12px]">{s.badgeUp ? "trending_up" : "trending_down"}</span>}
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mt-1">{s.label}</p>
                  <p className="text-white text-3xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.07)] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-lg">Student Engagement Trends</h3>
                  <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">more_horiz</span></button>
                </div>
                <div className="h-56 flex items-end gap-2 relative">
                  {weekBars.map((b, i) => (
                    <div key={b.day} className="flex-1 flex flex-col gap-1 items-center justify-end h-full">
                      <div
                        className={`w-full rounded-t relative group ${i === 5 ? "bg-[rgba(19,236,164,0.4)]" : "bg-[rgba(19,236,164,0.15)]"}`}
                        style={{ height: `${b.h}%` }}
                      >
                        <div className={`absolute bottom-0 w-full h-1 bg-[#13eca4] ${i === 5 ? "h-2" : ""}`} />
                        {i === 5 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0d1f1a] border border-[rgba(19,236,164,0.3)] text-white text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
                            92%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map((l) => (
                      <div key={l} className="border-b border-[rgba(255,255,255,0.04)] w-full h-0" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-500 uppercase">
                  {weekBars.map((b) => <span key={b.day}>{b.day}</span>)}
                </div>
              </div>

              {/* Dept Completion Bars */}
              <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.07)] p-6 flex flex-col">
                <h3 className="text-white font-bold text-lg mb-6">Teachers by Department</h3>
                <div className="flex-1 flex flex-col justify-center gap-5">
                  {departments.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center">No department data available</p>
                  ) : (
                    departments.map((d) => (
                      <div key={d.name} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">{d.name}</span>
                          <span className="text-white font-bold">{d.count} ({d.pct}%)</span>
                        </div>
                        <div className="w-full bg-[rgba(255,255,255,0.06)] h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.07)] overflow-hidden pb-6">
              <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Top Performing Classrooms</h3>
                <a href="/admin/school/classrooms" className="text-[#13eca4] text-sm font-semibold hover:underline">View All</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[rgba(255,255,255,0.02)] text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">Classroom</th>
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4">Avg. Progress</th>
                      <th className="px-6 py-4 text-right">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                    {topClassrooms.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No classrooms to display</td>
                      </tr>
                    ) : (
                      topClassrooms.map((c, idx) => {
                        const rankColors = [
                          "text-amber-400 bg-amber-400/10",
                          "text-slate-400 bg-slate-400/10",
                          "text-orange-400 bg-orange-400/10",
                          "text-slate-500 bg-slate-500/10",
                          "text-slate-500 bg-slate-500/10",
                        ];
                        return (
                          <tr key={c.id} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                            <td className="px-6 py-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${rankColors[idx]}`}>{idx + 1}</div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-white font-bold">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.subject}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-300">{teacherMap.get(c.teacherId) ?? "Unassigned"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{c.avgProgress ?? 0}%</span>
                                <div className="w-12 bg-[rgba(255,255,255,0.06)] h-1.5 rounded-full">
                                  <div className="bg-[#13eca4] h-full rounded-full" style={{ width: `${c.avgProgress ?? 0}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-white font-semibold">{c.enrolled ?? 0}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
