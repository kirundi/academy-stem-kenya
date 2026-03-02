"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY = "#13eca4";

const roleOptions = ["Project Lead", "Lead Coder", "Hardware Designer", "Data Analyst"];

const initialTeamMembers = [
  { id: "julian", name: "Julian Rivera", role: "Project Lead", initials: "JR", color: PRIMARY },
  { id: "sophia", name: "Sophia Chen", role: "Lead Coder", initials: "SC", color: "#60a5fa" },
  { id: "marcus", name: "Marcus Thorne", role: "Hardware Designer", initials: "MT", color: "#f59e0b" },
];

const unassignedPool = ["Alex Kim", "Bella Lopez", "Chris Wu", "Dani Pratt", "Evan Foster", "Fiona Osei", "George Ndiaye", "Hana Wanjiru", "Ivan Mwangi", "Jane Otieno", "Kevin Mutua", "Lena Achieng", "Mia Kimani", "Noel Omondi"];

type TeamMember = { id: string; name: string; role: string; initials: string; color: string };

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const memberColors = [PRIMARY, "#60a5fa", "#f59e0b", "#a78bfa", "#f87171", "#34d399"];

export default function TeacherTeamSetupPage() {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("Advanced Robotics Pathway v2.4");
  const [objective, setObjective] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [unassigned, setUnassigned] = useState<string[]>(unassignedPool.slice(5));
  const [showAll, setShowAll] = useState(false);
  const [permissions, setPermissions] = useState({
    stepByStep: true,
    progressReports: true,
    customRoles: false,
  });
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);

  const visibleUnassigned = showAll ? unassigned : unassigned.slice(0, 5);

  const removeTeamMember = (id: string) => {
    const m = teamMembers.find((x) => x.id === id);
    if (m) setUnassigned((prev) => [...prev, m.name]);
    setTeamMembers((prev) => prev.filter((x) => x.id !== id));
  };

  const addFromPool = (name: string) => {
    const colorIdx = teamMembers.length % memberColors.length;
    setTeamMembers((prev) => [
      ...prev,
      { id: name.toLowerCase().replace(" ", "-"), name, role: roleOptions[0], initials: getInitials(name), color: memberColors[colorIdx] },
    ]);
    setUnassigned((prev) => prev.filter((n) => n !== name));
  };

  const updateRole = (id: string, role: string) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const handleLaunch = async () => {
    setLaunching(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLaunching(false);
    setLaunched(true);
  };

  return (
    <div className="flex min-h-screen bg-[#0a1a16]">
      {/* ── LEFT SIDEBAR ────────────────────────────────── */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.1)] sticky top-0 h-screen overflow-y-auto">
        {/* Current context */}
        <div className="px-4 py-5 border-b border-[rgba(19,236,164,0.1)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Current Context</p>
          <div className="p-3 bg-[#13eca4]/10 rounded-xl border border-[#13eca4]/20">
            <h4 className="text-sm font-bold text-[#13eca4]">Robotics 101</h4>
            <p className="text-xs text-slate-400 mt-0.5">Grade 10 – Section A</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {[
            { label: "Overview", icon: "dashboard", active: false, href: "/school/teacher/dashboard" },
            { label: "Class Roster", icon: "group", active: false, href: "/school/teacher/classroom" },
            { label: "Project Setup", icon: "add_circle", active: true, href: "/school/teacher/team-setup" },
            { label: "Team Management", icon: "groups", active: false, href: "/school/teacher/groups" },
            { label: "Settings", icon: "settings", active: false, href: "/school/teacher/settings" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.active
                  ? "bg-[#13eca4] text-[#0d1f1a] font-bold"
                  : "text-slate-400 hover:bg-[#1a2e30] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Progress card */}
        <div className="m-4 p-4 bg-[#142a25] rounded-xl border border-[rgba(19,236,164,0.12)]">
          <p className="text-[10px] text-slate-500 mb-2">Collaboration Progress</p>
          <div className="w-full bg-[#1a2e30] h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-[#13eca4] h-full rounded-full" style={{ width: "66.6%" }} />
          </div>
          <p className="text-[10px] text-slate-400">12/18 teams finalised</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main className="flex-1 p-6 lg:p-8 max-w-4xl">
        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Link href="/school/teacher/classroom" className="hover:text-[#13eca4] transition-colors">Classes</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-[#13eca4] cursor-pointer transition-colors">Robotics 101</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white font-semibold">Project Creator</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">Create Collaborative Project</h1>
          <p className="text-slate-400 mt-2 text-sm">Assemble teams and assign high-impact STEM roles for the upcoming competition.</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Section 1: Project Foundation ── */}
          <div className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#13eca4] p-2 bg-[#13eca4]/10 rounded-xl text-xl">description</span>
              <h2 className="text-lg font-bold text-white">1. Project Foundation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Mars Rover Prototype"
                  className="w-full bg-[#142a25] border border-[rgba(19,236,164,0.2)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Assigned Course</label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-[#142a25] border border-[rgba(19,236,164,0.2)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                >
                  <option>Advanced Robotics Pathway v2.4</option>
                  <option>AI &amp; Neural Networks Basics</option>
                  <option>Rapid Prototyping Module</option>
                </select>
              </div>
              <div className="col-span-full flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Mission Objective</label>
                <textarea
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Define what the teams need to accomplish together…"
                  className="w-full bg-[#142a25] border border-[rgba(19,236,164,0.2)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Team Formation ── */}
          <div className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#13eca4] p-2 bg-[#13eca4]/10 rounded-xl text-xl">groups</span>
                <h2 className="text-lg font-bold text-white">2. Team Formation &amp; Roles</h2>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#13eca4]/10 hover:bg-[#13eca4]/20 text-[#13eca4] rounded-xl text-xs font-bold transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Team
              </button>
            </div>

            {/* Team Alpha card */}
            <div className="border border-[rgba(19,236,164,0.15)] rounded-xl overflow-hidden mb-5">
              <div className="bg-[#142a25] px-4 py-3 flex items-center justify-between border-b border-[rgba(19,236,164,0.1)]">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-[#13eca4]" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-white">Team Alpha – Mars Unit</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">{teamMembers.length} Students Assigned</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-[#142a25] rounded-xl border border-[rgba(19,236,164,0.1)]">
                    <div
                      className="size-10 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1f1a] shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{m.name}</p>
                      <select
                        value={m.role}
                        onChange={(e) => updateRole(m.id, e.target.value)}
                        className="text-xs bg-transparent border-none p-0 focus:outline-none text-[#13eca4] font-medium cursor-pointer w-full"
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r} className="bg-[#0d1f1a]">{r}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeTeamMember(m.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
                {/* Add slot */}
                <button
                  onClick={() => {
                    if (unassigned.length > 0) addFromPool(unassigned[0]);
                  }}
                  className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[rgba(19,236,164,0.2)] rounded-xl text-slate-400 hover:border-[#13eca4] hover:text-[#13eca4] transition-all"
                >
                  <span className="material-symbols-outlined text-xl">person_add</span>
                  <span className="text-[10px] font-bold mt-1 uppercase">Add Student</span>
                </button>
              </div>
            </div>

            {/* Unassigned pool */}
            <div className="border border-dashed border-[rgba(19,236,164,0.12)] rounded-xl p-4 text-center">
              <p className="text-slate-400 text-sm mb-3 italic">Unassigned Students ({unassigned.length})</p>
              <div className="flex flex-wrap justify-center gap-2">
                {visibleUnassigned.map((name) => (
                  <button
                    key={name}
                    onClick={() => addFromPool(name)}
                    className="px-3 py-1 bg-[#142a25] rounded-full text-xs font-medium border border-[rgba(19,236,164,0.15)] text-slate-300 cursor-pointer hover:bg-[#13eca4]/10 hover:border-[#13eca4]/30 hover:text-[#13eca4] transition-all"
                  >
                    {name}
                  </button>
                ))}
                {unassigned.length > 5 && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="text-[#13eca4] text-xs font-bold hover:underline ml-2"
                  >
                    {showAll ? "Show Less" : `Show All ${unassigned.length}…`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 3: Authorization & Permissions ── */}
          <div className="bg-[#13eca4]/5 border border-[#13eca4]/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-[#13eca4] p-2 bg-[#13eca4]/10 rounded-xl text-xl">security</span>
              <h2 className="text-lg font-bold text-white">3. Authorization &amp; Permissions</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { key: "stepByStep" as keyof typeof permissions, label: "Enable step-by-step collaborative course guidance" },
                { key: "progressReports" as keyof typeof permissions, label: "Auto-generate weekly progress reports for teachers" },
                { key: "customRoles" as keyof typeof permissions, label: "Allow teams to customise their internal roles" },
              ].map((perm) => (
                <label key={perm.key} className="flex items-center gap-3 cursor-pointer group">
                  {/* Toggle switch */}
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={permissions[perm.key]}
                      onChange={(e) => setPermissions((prev) => ({ ...prev, [perm.key]: e.target.checked }))}
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                        permissions[perm.key] ? "bg-[#13eca4]" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          permissions[perm.key] ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-slate-200 group-hover:text-white transition-colors">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pb-12">
            <button className="px-6 py-3 bg-[#1a2e30] text-slate-300 rounded-xl font-bold hover:bg-[#283739] transition-colors text-sm">
              Save Draft
            </button>
            <button
              onClick={handleLaunch}
              disabled={launching || launched}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                launched
                  ? "bg-green-700/40 border border-green-500/30 text-green-400 cursor-default"
                  : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-110 shadow-lg shadow-[#13eca4]/20 disabled:opacity-60"
              }`}
            >
              {launching ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : launched ? (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Project Launched!
                </>
              ) : (
                <>
                  Launch Project
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
