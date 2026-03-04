"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCollection } from "@/hooks/useFirestore";
import type { School } from "@/lib/types";

type Scope = "global" | "regional" | "school" | "invite";

const scopeOptions: { key: Scope; icon: string; label: string; sub: string }[] = [
  { key: "global", icon: "public", label: "Global", sub: "All registered schools" },
  { key: "regional", icon: "map", label: "Regional", sub: "Target specific territories" },
  { key: "school", icon: "school", label: "School-Specific", sub: "Choose individual schools" },
  { key: "invite", icon: "lock", label: "Invite Only", sub: "Private competition mode" },
];

export default function AdminChallengeCreator() {
  const { data: allSchools } = useCollection<School>("schools", [], true);

  const [scope, setScope] = useState<Scope>("global");
  const [lateSubmissions, setLateSubmissions] = useState(true);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [brief, setBrief] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState("48");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStartDate(new Date().toISOString().split("T")[0]);
  }, []);

  const toggleSchool = (s: string) =>
    setSelectedSchools((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const filteredSchools = allSchools.filter((s) =>
    s.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  async function saveChallenge(status: "published" | "draft") {
    const saving = status === "draft";
    saving ? setIsSaving(true) : setIsPublishing(true);
    setError("");
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, theme, brief, startDate, startTime, duration,
          scope, selectedSchools: scope === "school" ? selectedSchools : [],
          lateSubmissions, status,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save challenge");
      }
      if (status === "published") {
        setPublished(true);
        setTimeout(() => setPublished(false), 3000);
      } else {
        setTitle(""); setTheme(""); setBrief("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPublishing(false);
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1a16] text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-[rgba(19,236,164,0.12)] bg-[#0d1f1a]">
        <div className="flex items-center gap-8">
          <span className="font-black text-lg tracking-tight">Challenge Creator</span>
          <nav className="flex items-center gap-1 bg-[#1a2e30]/60 p-1 rounded-lg">
            {[
              { label: "Challenges", href: "/dashboard/challenges" },
              { label: "Users", href: "/dashboard/users" },
              { label: "Schools", href: "/dashboard/schools" },
              { label: "Analytics", href: "/dashboard/analytics" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${item.label === "Challenges" ? "bg-[#13eca4]/20 text-[#13eca4]" : "text-slate-400 hover:text-white"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={() => saveChallenge("published")}
          disabled={isPublishing || published || !title.trim()}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
            published
              ? "bg-green-600/30 border border-green-500/30 text-green-400"
              : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-105"
          }`}
        >
          {isPublishing ? (
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          ) : published ? (
            <><span className="material-symbols-outlined text-lg">check_circle</span> Published!</>
          ) : (
            <><span className="material-symbols-outlined text-lg">publish</span> Publish Now</>
          )}
        </button>
      </header>

      {error && (
        <div className="mx-8 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <div className="px-8 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT: FORM */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <section className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">info</span>
                Challenge Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Challenge Title <span className="text-red-400">*</span>
                  </label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/60 transition-colors" placeholder="e.g. Climate Action 2024" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hackathon Theme</label>
                  <input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/60 transition-colors" placeholder="e.g. Renewable Energy" />
                </div>
              </div>
            </section>

            <section className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">timer</span>
                Timer Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Duration (Hours)</label>
                <input type="number" min={1} max={168} value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full md:w-48 bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#13eca4]/60 transition-colors" />
              </div>
              <div className="flex items-start gap-6 p-4 bg-[#1a2e30] rounded-xl border border-[rgba(19,236,164,0.1)]">
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Allow Late Submissions</p>
                  <p className="text-xs text-slate-400">Students can submit up to 15 minutes past the deadline with a point penalty.</p>
                  {lateSubmissions && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      15% point penalty will apply
                    </p>
                  )}
                </div>
                <button onClick={() => setLateSubmissions(!lateSubmissions)} className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${lateSubmissions ? "bg-[#13eca4]" : "bg-slate-600"}`}>
                  <span className={`absolute top-1 size-5 bg-white rounded-full shadow transition-all ${lateSubmissions ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </section>

            <section className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">article</span>
                Challenge Brief &amp; Resources
              </h2>
              <textarea
                rows={10}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe the challenge problem, requirements, and evaluation criteria..."
                className="w-full bg-[#1a2e30] border border-[rgba(19,236,164,0.1)] rounded-lg px-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/40 transition-colors resize-none leading-relaxed"
              />
            </section>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Participation Scope</h3>
                <div className="space-y-3">
                  {scopeOptions.map((opt) => (
                    <div key={opt.key}>
                      <button onClick={() => setScope(opt.key)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${scope === opt.key ? "border-[#13eca4]/50 bg-[#13eca4]/10 text-white" : "border-[rgba(19,236,164,0.1)] text-slate-400 hover:border-[rgba(19,236,164,0.2)] hover:text-slate-300"}`}>
                        <div className={`p-1.5 rounded-lg shrink-0 ${scope === opt.key ? "bg-[#13eca4]/20 text-[#13eca4]" : "bg-[#1a2e30]"}`}>
                          <span className="material-symbols-outlined text-base">{opt.icon}</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-sm font-semibold leading-none mb-0.5">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.sub}</p>
                        </div>
                        {scope === opt.key && <span className="material-symbols-outlined text-[#13eca4] shrink-0">check_circle</span>}
                      </button>
                      {scope === "school" && opt.key === "school" && (
                        <div className="mt-2 ml-2 p-3 bg-[#1a2e30] rounded-lg border border-[rgba(19,236,164,0.1)]">
                          <input value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} placeholder="Search schools..." className="w-full bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#13eca4]/50 mb-3" />
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {filteredSchools.map((s) => (
                              <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${selectedSchools.includes(s.id) ? "bg-[#13eca4] border-[#13eca4]" : "border-slate-500 group-hover:border-[#13eca4]/50"}`} onClick={() => toggleSchool(s.id)}>
                                  {selectedSchools.includes(s.id) && <span className="material-symbols-outlined text-[#0d1f1a] text-[10px]">check</span>}
                                </div>
                                <span className="text-xs text-slate-300">{s.name}</span>
                              </label>
                            ))}
                            {filteredSchools.length === 0 && <p className="text-slate-500 text-xs">No schools found</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3 pt-4 border-t border-[rgba(19,236,164,0.1)]">
                  <button onClick={() => saveChallenge("published")} disabled={isPublishing || published || !title.trim()} className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${published ? "bg-green-600/30 text-green-400" : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-105"}`}>
                    {published ? "Published!" : "Create Challenge"}
                  </button>
                  <button onClick={() => saveChallenge("draft")} disabled={isSaving || !title.trim()} className="w-full py-3 rounded-xl font-bold text-sm text-slate-400 border border-[rgba(19,236,164,0.1)] hover:bg-[#1a2e30] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                    Save as Draft
                  </button>
                </div>
              </div>

              <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Live Preview</h4>
                <div className="rounded-xl bg-[#1a2e30] overflow-hidden border border-[rgba(19,236,164,0.1)]">
                  <div className="h-20 bg-linear-to-r from-[#13eca4]/30 to-[#1a2e30] flex items-center px-4">
                    <span className="material-symbols-outlined text-[#13eca4] text-3xl">filter_drama</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#13eca4] font-bold uppercase mb-1">{theme || "Hackathon Theme"}</p>
                    <p className="font-bold text-sm mb-3">{title || "Challenge Title"}</p>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Starts {startDate || "TBD"}</span>
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
