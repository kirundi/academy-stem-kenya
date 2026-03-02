"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY = "#13eca4";

type Filter = "All Themes" | "Renewable Energy" | "Robotics" | "Space Tech";

const challenges = [
  {
    id: "solar",
    title: "Solar Future Hackathon",
    icon: "wb_sunny",
    theme: "Renewable Energy",
    tags: [{ label: "Live", color: "bg-emerald-500" }, { label: "Global", color: "bg-slate-700/80" }],
    desc: "Design a sustainable energy microgrid for a rural community using only renewable resources.",
    timeLabel: "Ends in: 4d 12h",
    enrolled: false,
    upcoming: false,
  },
  {
    id: "automation",
    title: "Automation Pioneers",
    icon: "precision_manufacturing",
    theme: "Robotics",
    tags: [{ label: "Live", color: "bg-emerald-500" }, { label: "School", color: "bg-[#13eca4] text-[#0d1f1a]" }],
    desc: null,
    timeLabel: "Ends in: 2d 6h",
    enrolled: true,
    activeStudents: 24,
    totalStudents: 28,
    submitted: 18,
    lateAccess: true,
    upcoming: false,
  },
  {
    id: "mars",
    title: "Mars Colony Logistics",
    icon: "rocket",
    theme: "Space Tech",
    tags: [{ label: "Upcoming", color: "bg-amber-500" }, { label: "Global", color: "bg-slate-700/80" }],
    desc: "Calculate supply chain requirements for a 100-person base on the Martian surface over one year.",
    timeLabel: "Opens in: 2 days",
    enrolled: false,
    upcoming: true,
  },
];

const enrollments = [
  { group: "Advanced Physics - Grade 11", students: 28, challenge: "Automation Pioneers", progress: 85, submitted: "18 / 28", lateAccess: true },
  { group: "Intro to Robotics - Grade 9", students: 22, challenge: "Automation Pioneers", progress: 40, submitted: "4 / 22", lateAccess: false },
];

export default function TeacherChallengesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All Themes");
  const [lateAccess, setLateAccess] = useState<Record<string, boolean>>({ "Advanced Physics - Grade 11": true, "Intro to Robotics - Grade 9": false });
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set(["automation"]));

  const filters: Filter[] = ["All Themes", "Renewable Energy", "Robotics", "Space Tech"];
  const filtered = activeFilter === "All Themes" ? challenges : challenges.filter((c) => c.theme === activeFilter);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a1a16] text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-[rgba(19,236,164,0.1)] flex items-center justify-between px-8 shrink-0 bg-[#0d1f1a]">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold">Teacher Challenge Manager</h2>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex gap-4">
            <button className="text-sm font-medium text-[#13eca4] border-b-2 border-[#13eca4] pb-4 mt-4">Browse Challenges</button>
            <button className="text-sm font-medium text-slate-500 hover:text-white transition-colors pb-4 mt-4">Management View</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg text-sm w-56 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#13eca4]/50"
              placeholder="Find hackathons..."
            />
          </div>
          <button className="bg-[#13eca4] text-[#0d1f1a] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-105 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            Create School Challenge
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Filters & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeFilter === f
                      ? "bg-[#13eca4]/20 text-[#13eca4] border-[#13eca4]/30"
                      : "bg-[#1a2e30] text-slate-400 border-slate-700 hover:border-[#13eca4]/30"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">12 Live Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="text-slate-400">4 Upcoming</span>
              </div>
            </div>
          </div>

          {/* Challenge Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                className={`bg-[#0d1f1a] border rounded-xl overflow-hidden transition-all group ${
                  c.enrolled
                    ? "border-[#13eca4]/40 shadow-lg shadow-[#13eca4]/5"
                    : c.upcoming
                    ? "border-slate-700/50 opacity-80"
                    : "border-[rgba(19,236,164,0.15)] hover:shadow-xl hover:shadow-[#13eca4]/5"
                }`}
              >
                {/* Card header banner */}
                <div className="h-32 bg-linear-to-br from-[#13eca4]/25 to-[#102022] relative">
                  {c.upcoming && <div className="absolute inset-0 bg-[#102022]/60 grayscale" />}
                  <div className="absolute inset-0 flex items-center justify-center opacity-15">
                    <span className="material-symbols-outlined text-[#13eca4]" style={{ fontSize: "90px" }}>{c.icon}</span>
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {c.tags.map((tag) => (
                      <span key={tag.label} className={`${tag.color} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-base ${!c.upcoming ? "group-hover:text-[#13eca4] transition-colors" : ""}`}>{c.title}</h3>
                    <span className="material-symbols-outlined text-[#13eca4] text-xl">{c.icon}</span>
                  </div>

                  {c.enrolled ? (
                    /* Management view */
                    <div className="bg-[#142a25] rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Management View</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Late Submissions</span>
                          <button
                            onClick={() => {}}
                            className={`w-8 h-4 rounded-full relative transition-colors ${c.lateAccess ? "bg-[#13eca4]" : "bg-slate-600"}`}
                          >
                            <div className={`absolute top-0.5 size-3 bg-white rounded-full transition-transform ${c.lateAccess ? "right-0.5" : "left-0.5"}`} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Active Students</span>
                          <span className="font-bold">{c.activeStudents} / {c.totalStudents}</span>
                        </div>
                        <div className="w-full bg-[#0d1f1a] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#13eca4] h-full rounded-full" style={{ width: `${((c.activeStudents ?? 0) / (c.totalStudents ?? 1)) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Started Project</span>
                          <span className="font-bold">{c.submitted} Submitted</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    c.desc && <p className="text-sm text-slate-400 mb-5 line-clamp-2">{c.desc}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs border-t border-[rgba(19,236,164,0.08)] pt-3">
                      <span className="text-slate-500 italic">Theme: {c.theme}</span>
                      <span className={`font-medium ${c.upcoming ? "text-amber-400" : "text-white"}`}>{c.timeLabel}</span>
                    </div>
                    <div className="flex gap-2">
                      {c.enrolled ? (
                        <>
                          <button className="flex-1 bg-[#1a2e30] text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
                            View Student Work
                          </button>
                          <button className="px-3 border border-[rgba(19,236,164,0.2)] text-slate-400 rounded-lg hover:bg-[#142a25]">
                            <span className="material-symbols-outlined text-sm pt-1">settings</span>
                          </button>
                        </>
                      ) : c.upcoming ? (
                        <>
                          <button className="flex-1 bg-[#1a2e30] text-slate-500 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                            Pre-enroll Closed
                          </button>
                          <button className="px-3 border border-slate-700 text-slate-500 rounded-lg">
                            <span className="material-symbols-outlined text-sm pt-1">notifications</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEnrolledIds((prev) => { const n = new Set(prev); n.add(c.id); return n; })}
                            className="flex-1 bg-[#13eca4] text-[#0d1f1a] py-2 rounded-lg text-sm font-bold hover:brightness-105 transition-all"
                          >
                            {enrolledIds.has(c.id) ? "Enrolled ✓" : "Enroll Class"}
                          </button>
                          <button className="px-3 bg-[#1a2e30] text-slate-400 rounded-lg hover:bg-slate-700">
                            <span className="material-symbols-outlined text-sm pt-1">visibility</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enrollment Management Table */}
          <div className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.08)] flex items-center justify-between">
              <h3 className="font-bold text-sm">Active Enrollments Management</h3>
              <button className="text-[#13eca4] text-xs font-bold hover:underline">Download Report</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#142a25]/50 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                    {["Student Group / Class", "Challenge", "Progress", "Submissions", "Late Access", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(19,236,164,0.06)]">
                  {enrollments.map((e) => (
                    <tr key={e.group}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{e.group}</div>
                        <div className="text-xs text-slate-400">{e.students} Students</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{e.challenge}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-[#1a2e30] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${e.progress}%`, backgroundColor: e.progress >= 70 ? PRIMARY : "#f59e0b" }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{e.submitted}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setLateAccess((prev) => ({ ...prev, [e.group]: !prev[e.group] }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${lateAccess[e.group] ? "bg-[#13eca4]" : "bg-slate-600"}`}
                        >
                          <div className={`absolute top-0.5 size-4 bg-white rounded-full transition-transform ${lateAccess[e.group] ? "right-0.5" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-[#13eca4] hover:opacity-80 material-symbols-outlined text-lg">edit_square</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
