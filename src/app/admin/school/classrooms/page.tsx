"use client";

import { useState } from "react";
import { useSchoolAdminData } from "@/hooks/useAdminData";

export default function ClassroomsPage() {
  const [search, setSearch] = useState("");
  const { classrooms, teachers, loading } = useSchoolAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  const teacherMap = new Map(teachers.map((t) => [t.id, t.displayName]));

  const filtered = classrooms.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.grade?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-14 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Classrooms</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Classroom
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#13eca4] mb-1">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span className="text-xs font-bold uppercase tracking-wider">Learning Spaces</span>
            </div>
            <h1 className="text-white text-4xl font-black leading-tight">Classroom Management</h1>
            <p className="text-slate-400 mt-1 max-w-2xl">Manage {classrooms.length} classrooms and their course assignments.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Classrooms", value: classrooms.length, icon: "school", iconColor: "#13eca4" },
            { label: "Total Enrolled", value: classrooms.reduce((sum, c) => sum + (c.enrolled ?? 0), 0), icon: "groups", iconColor: "#3b82f6" },
            { label: "Avg. Class Size", value: classrooms.length > 0 ? Math.round(classrooms.reduce((sum, c) => sum + (c.enrolled ?? 0), 0) / classrooms.length) : 0, icon: "bar_chart", iconColor: "#8b5cf6" },
            { label: "Avg. Progress", value: classrooms.length > 0 ? `${Math.round(classrooms.reduce((sum, c) => sum + (c.avgProgress ?? 0), 0) / classrooms.length)}%` : "0%", icon: "trending_up", iconColor: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a2e27] p-6 rounded-2xl border border-[rgba(19,236,164,0.07)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">{s.label}</span>
                <span className="material-symbols-outlined p-2 rounded-lg bg-[rgba(19,236,164,0.08)] text-[20px]" style={{ color: s.iconColor }}>{s.icon}</span>
              </div>
              <span className="text-white text-3xl font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</span>
            </div>
          ))}
        </section>

        {/* Table */}
        <section className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.07)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search classrooms..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
              />
            </div>
            <span className="text-slate-500 text-sm">{filtered.length} of {classrooms.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)] text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Classroom</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Enrolled</th>
                  <th className="px-6 py-4">Join Code</th>
                  <th className="px-6 py-4">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No classrooms found</td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[rgba(19,236,164,0.08)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-[#13eca4]">school</span>
                          </div>
                          <span className="text-white font-semibold">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{c.subject}</td>
                      <td className="px-6 py-4 text-slate-300">{c.grade}</td>
                      <td className="px-6 py-4 text-slate-300">{teacherMap.get(c.teacherId) ?? "Unassigned"}</td>
                      <td className="px-6 py-4 text-white font-semibold">{c.enrolled ?? 0} / {c.capacity ?? "--"}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-[rgba(19,236,164,0.1)] text-[#13eca4] px-2 py-1 rounded">{c.joinCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full max-w-[60px]">
                            <div className="h-1.5 rounded-full bg-[#13eca4]" style={{ width: `${c.avgProgress ?? 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-[#13eca4]">{c.avgProgress ?? 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
