"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY = "#13eca4";

const teamMembers = [
  { id: "alex", name: "Alex Johnson", role: "Team Lead", initials: "AJ", color: PRIMARY },
  { id: "jordan", name: "Jordan Smith", role: "Developer", initials: "JS", color: "#60a5fa" },
  { id: "sam", name: "Sam Lee", role: "Quality Assurance", initials: "SL", color: "#f59e0b" },
];

const codeLines = [
  {
    ln: 1,
    tokens: [
      { t: "class", c: "keyword" },
      { t: " MarsRover:", c: "def" },
    ],
  },
  { ln: 2, tokens: [{ t: "    def __init__(self, battery=100):", c: "def" }] },
  { ln: 3, tokens: [{ t: "        self.battery = battery", c: "var" }] },
  { ln: 4, tokens: [{ t: "        self.position = [0, 0]", c: "var" }] },
  { ln: 5, tokens: [{ t: "        self.log = []", c: "var" }] },
  { ln: 6, tokens: [{ t: "", c: "plain" }] },
  { ln: 7, tokens: [{ t: "    def move(self, direction, steps=1):", c: "def" }] },
  { ln: 8, tokens: [{ t: "        if self.battery < 10:", c: "keyword" }] },
  { ln: 9, tokens: [{ t: '            raise LowBatteryError("Cannot move")', c: "string" }] },
  { ln: 10, tokens: [{ t: "        self._update_position(direction, steps)", c: "var" }] },
  { ln: 11, tokens: [{ t: "        self.battery -= steps * 2", c: "var" }] },
  { ln: 12, tokens: [{ t: '        self.log.append(f"{direction} x{steps}")', c: "string" }] },
  { ln: 13, tokens: [{ t: "", c: "plain" }] },
  { ln: 14, tokens: [{ t: "    def _update_position(self, direction, steps):", c: "def" }] },
  {
    ln: 15,
    tokens: [{ t: '        if direction == "N": self.position[1] += steps', c: "keyword" }],
  },
  {
    ln: 16,
    tokens: [{ t: '        elif direction == "S": self.position[1] -= steps', c: "keyword" }],
  },
  {
    ln: 17,
    tokens: [{ t: '        elif direction == "E": self.position[0] += steps', c: "keyword" }],
  },
  {
    ln: 18,
    tokens: [{ t: '        elif direction == "W": self.position[0] -= steps', c: "keyword" }],
  },
];

const tokenStyle: Record<string, string> = {
  keyword: "text-[#ff79c6]",
  def: "text-[#50fa7b]",
  var: "text-[#f8f8f2]",
  string: "text-[#f1fa8c]",
  plain: "text-[#f8f8f2]",
};

const reflections = [
  {
    q: "How did you approach the initial brainstorming and architecture decisions?",
    a: "We started with a whiteboard session mapping out all rover subsystems. Jordan proposed the event-driven architecture which dramatically simplified the movement logic and battery management integration.",
  },
  {
    q: "What was the most complex algorithm you implemented and how did you solve it?",
    a: "The pathfinding using A* was our biggest challenge. Sam identified that our initial heuristic was causing backtracking loops. After three iterations we achieved 98% path optimisation in our test environments.",
  },
];

const gradeSliders = [
  { key: "collective", label: "Collective Performance", defaultVal: 92 },
  { key: "collab", label: "Collaboration & Documentation", defaultVal: 88 },
];

type Tab = "files" | "reflection" | "changelog";

export default function TeacherGradingPanelPage() {
  const [activeTab, setActiveTab] = useState<Tab>("files");
  const [sliders, setSliders] = useState<Record<string, number>>({ collective: 92, collab: 88 });
  const [notes, setNotes] = useState<Record<string, string>>({ alex: "", jordan: "", sam: "" });
  const [finalGrade, setFinalGrade] = useState("90");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const avgGrade = Math.round((sliders.collective + sliders.collab) / 2);

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPublishing(false);
    setPublished(true);
  };

  return (
    <div className="flex min-h-screen bg-[#0a1a16] text-white">
      {/* ── MAIN LEFT COLUMN ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link
              href="/school/teacher/classroom"
              className="hover:text-[#13eca4] transition-colors"
            >
              Classes
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-[#13eca4] cursor-pointer transition-colors">
              Robotics 101
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#13eca4] font-semibold">Mars Rover – Team Alpha</span>
          </nav>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(19,236,164,0.3)] text-[#13eca4] text-xs font-bold hover:bg-[#13eca4]/10 transition-colors">
            <span className="material-symbols-outlined text-sm">folder_shared</span>
            Shared Repository
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Title block */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight">Team Alpha: Mars Rover</h1>
              <span className="px-2.5 py-1 rounded-full bg-[#13eca4]/15 border border-[#13eca4]/40 text-[#13eca4] text-xs font-bold uppercase tracking-wider">
                Team Submission
              </span>
            </div>
            {/* Member avatars */}
            <div className="flex items-center gap-4 mt-2">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1f1a]"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-[rgba(19,236,164,0.1)] mb-6">
            {(
              [
                { key: "files", label: "Project Files", icon: "code" },
                { key: "reflection", label: "Collective Reflection", icon: "chat" },
                { key: "changelog", label: "Team Changelog", icon: "history" },
              ] as Array<{ key: Tab; label: string; icon: string }>
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? "border-[#13eca4] text-[#13eca4]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "files" && (
            <div className="rounded-2xl overflow-hidden border border-[rgba(19,236,164,0.15)] bg-[#0d2016]">
              {/* File header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#142a25] border-b border-[rgba(19,236,164,0.1)]">
                <span className="material-symbols-outlined text-[#13eca4] text-lg">code</span>
                <span className="text-sm font-bold text-white">RoverController.py</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">Python 3.11</span>
              </div>
              {/* Code block */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <tbody>
                    {codeLines.map((line) => (
                      <tr key={line.ln} className="hover:bg-[#13eca4]/5">
                        <td className="select-none text-slate-600 text-right pr-4 pl-4 py-0.5 w-10 border-r border-[rgba(19,236,164,0.05)]">
                          {line.ln}
                        </td>
                        <td className="pl-4 py-0.5 whitespace-pre">
                          {line.tokens.map((tok, i) => (
                            <span key={i} className={tokenStyle[tok.c] ?? "text-slate-300"}>
                              {tok.t}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reflection" && (
            <div className="flex flex-col gap-6">
              {reflections.map((r, i) => (
                <div
                  key={i}
                  className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-2xl p-5"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Q{i + 1}: {r.q}
                  </p>
                  <blockquote className="border-l-2 border-[#13eca4]/40 pl-4 text-sm text-slate-200 italic leading-relaxed">
                    {r.a}
                  </blockquote>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#13eca4]/10 border border-[#13eca4]/30 text-[10px] font-bold text-[#13eca4] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Consensus Achieved
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "changelog" && (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              No changelog entries yet.
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT GRADING SIDEBAR ─────────────────────────────── */}
      <aside className="w-110 shrink-0 flex flex-col bg-[#0d1f1a] border-l border-[rgba(19,236,164,0.1)] h-screen overflow-y-auto">
        {/* Sidebar header */}
        <div className="px-5 py-4 bg-[#13eca4]/10 border-b border-[#13eca4]/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13eca4] text-xl">grading</span>
            <h2 className="text-base font-black text-white">Team Grade</h2>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 flex flex-col gap-6">
          {/* Sliders */}
          <div className="flex flex-col gap-5">
            {gradeSliders.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    {s.label}
                  </label>
                  <span className="text-sm font-black" style={{ color: PRIMARY }}>
                    {sliders[s.key]}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliders[s.key]}
                  onChange={(e) =>
                    setSliders((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                  }
                  className="w-full accent-[#13eca4] cursor-pointer"
                />
              </div>
            ))}
            <p className="text-[11px] text-slate-400 italic">
              This grade will be applied to all team members.
            </p>
          </div>

          {/* Individual Contributions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Individual Contributions
            </h3>
            <div className="flex flex-col gap-4">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#142a25] rounded-xl border border-[rgba(19,236,164,0.12)] p-4"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="size-7 rounded-full flex items-center justify-center text-[9px] font-bold text-[#0d1f1a]"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">{m.name}</p>
                      <p className="text-[10px] text-slate-500">{m.role}</p>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={`Notes on ${m.name.split(" ")[0]}'s contribution…`}
                    value={notes[m.id]}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    className="w-full bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-[#13eca4]/50 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Final Grade */}
          <div className="bg-[#142a25] rounded-xl border border-[rgba(19,236,164,0.2)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Calculated Average
                </p>
                <p className="text-lg font-black text-white">
                  {avgGrade}
                  <span className="text-sm text-slate-400">/100</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Final Team Grade
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={finalGrade}
                    onChange={(e) => setFinalGrade(e.target.value)}
                    className="w-16 bg-[#0d1f1a] border border-[rgba(19,236,164,0.3)] rounded-lg px-2 py-1.5 text-sm font-black text-white text-center focus:outline-none focus:border-[#13eca4] transition-colors"
                  />
                  <span className="text-lg font-black text-[#13eca4]">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pb-6">
            <button className="flex-1 py-3 rounded-xl border border-[rgba(19,236,164,0.3)] text-[#13eca4] text-sm font-bold hover:bg-[#13eca4]/10 transition-colors">
              Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || published}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                published
                  ? "bg-green-700/40 border border-green-500/30 text-green-400 cursor-default"
                  : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-110 shadow-lg shadow-[#13eca4]/20 disabled:opacity-60"
              }`}
            >
              {publishing ? (
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
              ) : published ? (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Published
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">publish</span>
                  Publish to All Members
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
