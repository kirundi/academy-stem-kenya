"use client";

import { useState } from "react";

type Scope = "global" | "regional" | "school" | "invite";

const schools = [
  "Oakridge Tech High",
  "Nova Science Academy",
  "St. Mary's STEM",
  "Central Digital School",
  "Riverside Secondary",
];

const scopeOptions: { key: Scope; icon: string; label: string; sub: string }[] = [
  { key: "global", icon: "public", label: "Global", sub: "All registered schools" },
  { key: "regional", icon: "map", label: "Regional", sub: "Target specific territories" },
  { key: "school", icon: "school", label: "School-Specific", sub: "Choose individual schools" },
  { key: "invite", icon: "lock", label: "Invite Only", sub: "Private competition mode" },
];

export default function AdminChallengeCreator() {
  const [scope, setScope] = useState<Scope>("global");
  const [lateSubmissions, setLateSubmissions] = useState(true);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [title, setTitle] = useState("Climate Action 2024");
  const [theme, setTheme] = useState("Sustainability & Renewable Energy");
  const [startDate, setStartDate] = useState("2024-11-10");
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState("48");
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const toggleSchool = (s: string) =>
    setSelectedSchools((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const filteredSchools = schools.filter((s) =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsPublishing(false);
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a1a16] text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-[rgba(19,236,164,0.12)] bg-[#0d1f1a]">
        <div className="flex items-center gap-8">
          <span className="font-black text-lg tracking-tight">Challenge Creator</span>
          <nav className="flex items-center gap-1 bg-[#1a2e30]/60 p-1 rounded-lg">
            {["Challenges", "Users", "Schools", "Analytics"].map((item) => (
              <button
                key={item}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${item === "Challenges" ? "bg-[#13eca4]/20 text-[#13eca4]" : "text-slate-400 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handlePublish}
          disabled={isPublishing || published}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${
            published
              ? "bg-green-600/30 border border-green-500/30 text-green-400"
              : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-105"
          }`}
        >
          {isPublishing ? (
            <span className="material-symbols-outlined animate-spin text-lg">
              progress_activity
            </span>
          ) : published ? (
            <>
              <span className="material-symbols-outlined text-lg">check_circle</span> Published!
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">publish</span> Publish Now
            </>
          )}
        </button>
      </header>

      <div className="px-8 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8">
          {/* ─── LEFT: FORM ─── */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Section 1: Challenge Details */}
            <section className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">info</span>
                Challenge Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Challenge Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                    placeholder="e.g. Climate Action 2024"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Hackathon Theme
                  </label>
                  <input
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                    placeholder="e.g. Renewable Energy"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Timer Configuration */}
            <section className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">timer</span>
                Timer Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full md:w-48 bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors"
                />
              </div>
              <div className="flex items-start gap-6 p-4 bg-[#1a2e30] rounded-xl border border-[rgba(19,236,164,0.1)]">
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Allow Late Submissions</p>
                  <p className="text-xs text-slate-400">
                    Students can submit up to 15 minutes past the deadline with a point penalty.
                  </p>
                  {lateSubmissions && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      15% point penalty will apply
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setLateSubmissions(!lateSubmissions)}
                  className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${lateSubmissions ? "bg-[#13eca4]" : "bg-slate-600"}`}
                >
                  <span
                    className={`absolute top-1 size-5 bg-white rounded-full shadow transition-all ${lateSubmissions ? "left-6" : "left-1"}`}
                  />
                </button>
              </div>
            </section>

            {/* Section 3: Challenge Brief */}
            <section className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">article</span>
                Challenge Brief &amp; Resources
              </h2>
              {/* Toolbar */}
              <div className="flex items-center gap-1 mb-3 p-2 bg-[#1a2e30] rounded-t-lg border border-[rgba(19,236,164,0.1)] border-b-0 flex-wrap">
                {[
                  "format_bold",
                  "format_italic",
                  "format_list_bulleted",
                  "link",
                  "image",
                  "H1",
                  "H2",
                  "code",
                ].map((icon) => (
                  <button
                    key={icon}
                    className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-white transition-colors text-xs font-bold min-w-8"
                  >
                    {icon.startsWith("format_") || ["link", "image", "code"].includes(icon) ? (
                      <span className="material-symbols-outlined text-base">{icon}</span>
                    ) : (
                      icon
                    )}
                  </button>
                ))}
              </div>
              <textarea
                rows={10}
                defaultValue={`## The Problem\n\nDesign a resilient renewable energy grid for a simulated coastal city of 50,000 residents. \n\nYou must incorporate at least three different renewable energy sources:\n- Wind turbines\n- Solar arrays\n- Hydroelectric generation\n\n## Evaluation Criteria\nSolutions will be judged on cost-efficiency, environmental impact, and resilience.`}
                className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.1)] rounded-b-lg px-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/40 transition-colors resize-none font-mono leading-relaxed"
              />
            </section>
          </div>

          {/* ─── RIGHT: SIDEBAR ─── */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Participation Scope */}
              <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Participation Scope
                </h3>
                <div className="space-y-3">
                  {scopeOptions.map((opt) => (
                    <div key={opt.key}>
                      <button
                        onClick={() => setScope(opt.key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          scope === opt.key
                            ? "border-[#13eca4]/50 bg-[#13eca4]/10 text-white"
                            : "border-[rgba(19,236,164,0.1)] text-slate-400 hover:border-[rgba(19,236,164,0.2)] hover:text-slate-300"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${scope === opt.key ? "bg-[#13eca4]/20 text-[#13eca4]" : "bg-[#1a2e30]"}`}
                        >
                          <span className="material-symbols-outlined text-base">{opt.icon}</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold leading-none mb-0.5">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.sub}</p>
                        </div>
                        {scope === opt.key && (
                          <span className="material-symbols-outlined text-[#13eca4] shrink-0">
                            check_circle
                          </span>
                        )}
                      </button>

                      {/* School search expander */}
                      {scope === "school" && opt.key === "school" && (
                        <div className="mt-2 ml-2 p-3 bg-[#1a2e30] rounded-lg border border-[rgba(19,236,164,0.1)]">
                          <input
                            value={schoolSearch}
                            onChange={(e) => setSchoolSearch(e.target.value)}
                            placeholder="Search schools..."
                            className="w-full bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/50 mb-3"
                          />
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {filteredSchools.map((s) => (
                              <label
                                key={s}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <div
                                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                                    selectedSchools.includes(s)
                                      ? "bg-[#13eca4] border-[#13eca4]"
                                      : "border-slate-500 group-hover:border-[#13eca4]/50"
                                  }`}
                                  onClick={() => toggleSchool(s)}
                                >
                                  {selectedSchools.includes(s) && (
                                    <span className="material-symbols-outlined text-[#0d1f1a] text-[10px]">
                                      check
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-300">{s}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3 pt-4 border-t border-[rgba(19,236,164,0.1)]">
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || published}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      published
                        ? "bg-green-600/30 text-green-400"
                        : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-105"
                    }`}
                  >
                    {published ? "Published!" : "Create Challenge"}
                  </button>
                  <button className="w-full py-3 rounded-xl font-bold text-sm text-slate-400 border border-[rgba(19,236,164,0.1)] hover:bg-[#1a2e30] transition-colors">
                    Save as Draft
                  </button>
                </div>
              </div>

              {/* Preview card */}
              <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Live Preview
                </h4>
                <div className="rounded-xl bg-[#1a2e30] overflow-hidden border border-[rgba(19,236,164,0.1)]">
                  <div className="h-20 bg-linear-to-r from-[#13eca4]/30 to-[#1a2e30] flex items-center px-4">
                    <span className="material-symbols-outlined text-[#13eca4] text-3xl">
                      filter_drama
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#13eca4] font-bold uppercase mb-1">
                      {theme || "Hackathon Theme"}
                    </p>
                    <p className="font-bold text-sm mb-3">{title || "Challenge Title"}</p>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Starts {startDate}</span>
                      <span>{duration}h duration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
