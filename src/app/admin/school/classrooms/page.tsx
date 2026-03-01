"use client";

import { useState } from "react";
import { useSchoolAdminData } from "@/hooks/useAdminData";

export default function ClassroomsPage() {
  const [search, setSearch] = useState("");
  const [prefix, setPrefix] = useState("TECH-");
  const [pendingPrefix, setPendingPrefix] = useState("TECH-");
  const [codeMode, setCodeMode] = useState("Alphanumeric (8 chars)");
  const [editedCodes, setEditedCodes] = useState<Record<string, string>>({});
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
      (teacherMap.get(c.teacherId) ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCodes = classrooms.filter((c) => c.joinCode && c.joinCode.trim() !== "").length;
  const expiredCodes = classrooms.filter((c) => !c.joinCode || c.joinCode.trim() === "").length;

  const getCodeForClassroom = (id: string, defaultCode: string) =>
    editedCodes[id] !== undefined ? editedCodes[id] : defaultCode;

  const regenerateCode = (id: string) => {
    setEditedCodes((prev) => {
      const code = prefix + crypto.randomUUID().substring(0, 4).toUpperCase();
      return { ...prev, [id]: code };
    });
  };

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teachers or classes..."
              className="w-full bg-[#1a2e27] border-none rounded-lg py-1.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#13eca4]"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Class
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            Classroom Setup &amp; Code Configuration
          </h1>
          <p className="text-slate-400 text-base">
            Manage and distribute unique access codes for teacher classrooms across the district.
          </p>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] p-6 rounded-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Total Classrooms</p>
            <p className="text-3xl font-bold text-white">{classrooms.length}</p>
            <div className="mt-2 text-xs text-[#13eca4] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +4 this month
            </div>
          </div>
          <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] p-6 rounded-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Active Codes</p>
            <p className="text-3xl font-bold text-white">{activeCodes}</p>
            <div className="mt-2 text-xs text-[#13eca4] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              {classrooms.length > 0 ? `${Math.round((activeCodes / classrooms.length) * 100)}%` : "0%"} utilization
            </div>
          </div>
          <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] p-6 rounded-xl">
            <p className="text-slate-400 text-sm font-medium mb-1">Expired Codes</p>
            <p className="text-3xl font-bold text-red-400">{expiredCodes}</p>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              Renewal required
            </div>
          </div>
        </section>

        {/* Global Configuration */}
        <section className="bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13eca4]">settings_suggest</span>
              Global Configuration
            </h2>
            <button
              onClick={() => { setPendingPrefix("TECH-"); setPrefix("TECH-"); setCodeMode("Alphanumeric (8 chars)"); }}
              className="text-[#13eca4] text-sm font-medium hover:underline"
            >
              Reset Defaults
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Set Custom School Prefix</label>
              <div className="flex gap-2">
                <input
                  value={pendingPrefix}
                  onChange={(e) => setPendingPrefix(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#10221c] border border-[rgba(19,236,164,0.15)] rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:ring-1 focus:ring-[#13eca4]"
                />
                <button
                  onClick={() => setPrefix(pendingPrefix)}
                  className="bg-[rgba(19,236,164,0.15)] text-[#13eca4] px-3 py-2 rounded-lg text-sm font-bold border border-[rgba(19,236,164,0.25)] hover:bg-[rgba(19,236,164,0.25)] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Auto-generation Mode</label>
              <select
                value={codeMode}
                onChange={(e) => setCodeMode(e.target.value)}
                className="w-full bg-[#10221c] border border-[rgba(19,236,164,0.15)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#13eca4]"
              >
                <option>Alphanumeric (8 chars)</option>
                <option>Numeric (6 chars)</option>
                <option>Word-based (Random)</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <button className="w-full bg-[#13eca4] text-[#10221c] h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-base">bolt</span>
                Bulk Generate Codes
              </button>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <h3 className="font-bold text-white">Classrooms &amp; Code Registry</h3>
            <div className="flex gap-2">
              <button className="bg-[#10221c] p-2 rounded-lg border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.3)] transition-colors">
                <span className="material-symbols-outlined text-base text-slate-400">filter_list</span>
              </button>
              <button className="bg-[#10221c] p-2 rounded-lg border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.3)] transition-colors">
                <span className="material-symbols-outlined text-base text-slate-400">download</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase bg-[rgba(0,0,0,0.2)]">
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Classroom Name</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Class Code</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No classrooms found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const code = getCodeForClassroom(c.id, c.joinCode ?? "");
                    const isExpired = !code || code.trim() === "";
                    const teacherName = teacherMap.get(c.teacherId) ?? "Unassigned";
                    const teacherInitials = teacherName !== "Unassigned"
                      ? teacherName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                      : "?";

                    return (
                      <tr key={c.id} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[#13eca4] text-xs font-bold shrink-0">
                              {teacherInitials}
                            </div>
                            <span className="text-sm font-medium text-white">
                              {teacherName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{c.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-400">{c.grade}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group">
                            <input
                              value={isExpired ? "EXPIRED" : code}
                              onChange={(e) => setEditedCodes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                              className={`w-28 border-none rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 ${
                                isExpired
                                  ? "bg-red-900/20 text-red-400 focus:ring-red-500"
                                  : "bg-[rgba(0,0,0,0.2)] text-[#13eca4] focus:ring-[#13eca4]"
                              }`}
                            />
                            {isExpired ? (
                              <span className="text-red-400">
                                <span className="material-symbols-outlined text-base">warning</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => regenerateCode(c.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#13eca4]"
                              >
                                <span className="material-symbols-outlined text-base">refresh</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-900/20 text-red-400 border border-red-900/40">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[rgba(19,236,164,0.15)] text-[#13eca4] border border-[rgba(19,236,164,0.25)]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-[#13eca4] transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filtered.length} of {classrooms.length} classrooms</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="bg-[#10221c] border border-[rgba(19,236,164,0.1)] rounded px-1.5 py-0.5 text-xs text-slate-300">
                  <option>10</option>
                  <option defaultValue="20">20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 flex items-center justify-center rounded border border-[rgba(19,236,164,0.1)] hover:bg-[#1a2e27] transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="font-medium text-slate-200">1</span>
                <button className="w-6 h-6 flex items-center justify-center rounded border border-[rgba(19,236,164,0.1)] hover:bg-[#1a2e27] transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
