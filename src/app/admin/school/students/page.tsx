"use client";

import { useState } from "react";
import { useSchoolAdminData } from "@/hooks/useAdminData";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const { students, classrooms, loading } = useSchoolAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  const filtered = students.filter(
    (s) =>
      (s.displayName?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (s.email?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-14 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Students</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="bg-transparent border-none text-white text-sm placeholder-slate-500 focus:outline-none ml-2 w-40"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#13eca4] mb-1">
              <span className="material-symbols-outlined text-[16px]">groups</span>
              <span className="text-xs font-bold uppercase tracking-wider">Student Body</span>
            </div>
            <h1 className="text-white text-4xl font-black leading-tight">Student Management</h1>
            <p className="text-slate-400 mt-1 max-w-2xl">View and manage all enrolled students across {classrooms.length} classrooms.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Students", value: students.length, icon: "groups", iconColor: "#13eca4" },
            { label: "Classrooms", value: classrooms.length, icon: "school", iconColor: "#3b82f6" },
            { label: "Avg. per Classroom", value: classrooms.length > 0 ? Math.round(students.length / classrooms.length) : 0, icon: "bar_chart", iconColor: "#8b5cf6" },
            { label: "Active Learners", value: students.length, icon: "trending_up", iconColor: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a2e27] p-6 rounded-2xl border border-[rgba(19,236,164,0.07)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">{s.label}</span>
                <span className="material-symbols-outlined p-2 rounded-lg bg-[rgba(19,236,164,0.08)] text-[20px]" style={{ color: s.iconColor }}>{s.icon}</span>
              </div>
              <span className="text-white text-3xl font-bold">{s.value.toLocaleString()}</span>
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
                placeholder="Search by name or email..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
              />
            </div>
            <span className="text-slate-500 text-sm">Showing {filtered.length} of {students.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)] text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">XP</th>
                  <th className="px-6 py-4">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No students found</td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[#13eca4] font-bold text-sm">
                            {s.displayName?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                          </div>
                          <span className="text-white font-semibold">{s.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{s.email ?? "--"}</td>
                      <td className="px-6 py-4">
                        <span className="text-[#13eca4] font-bold">Lvl {s.level ?? 1}</span>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold">{(s.xp ?? 0).toLocaleString()} XP</td>
                      <td className="px-6 py-4 text-slate-300">{s.badges?.length ?? 0} badges</td>
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
