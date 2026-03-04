"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { orderBy } from "firebase/firestore";
import type { Challenge } from "@/lib/types";

function formatDate(d: unknown) {
  if (!d) return "—";
  // Firestore Timestamp or Date
  const date =
    (d as { toDate?: () => Date })?.toDate?.() ??
    (d instanceof Date ? d : null) ??
    ((d as { seconds?: number })?.seconds ? new Date((d as { seconds: number }).seconds * 1000) : null);
  if (!date) return "—";
  return date.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

function getChallengeStatus(challenge: Challenge): { label: string; color: string } {
  const now = Date.now();
  const start = challenge.startsAt instanceof Date ? challenge.startsAt.getTime()
    : (challenge.startsAt as unknown as { seconds?: number })?.seconds
      ? (challenge.startsAt as unknown as { seconds: number }).seconds * 1000
      : 0;
  const end = challenge.endsAt instanceof Date ? challenge.endsAt.getTime()
    : (challenge.endsAt as unknown as { seconds?: number })?.seconds
      ? (challenge.endsAt as unknown as { seconds: number }).seconds * 1000
      : 0;

  if (now < start) return { label: "Upcoming", color: "#3b82f6" };
  if (now > end) return { label: "Ended", color: "#64748b" };
  return { label: "Active", color: "#10b981" };
}

const SCOPE_COLOR: Record<string, string> = {
  global: "#a855f7",
  school: "#f59e0b",
};

export default function EditorChallengesPage() {
  const { data: challenges, loading } = useCollection<Challenge>(
    "challenges",
    [orderBy("createdAt", "desc")],
    true
  );
  const [filterScope, setFilterScope] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#ec4899]">progress_activity</span>
      </div>
    );
  }

  const globalChallenges = challenges.filter((c) => c.scope === "global");
  const schoolChallenges = challenges.filter((c) => c.scope === "school");
  const activeChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Active");

  const filtered = challenges.filter((c) => {
    const matchesScope = filterScope === "all" || c.scope === filterScope;
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.theme?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(236,72,153,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Challenges</h1>
          <p className="text-slate-400 text-xs mt-0.5">{challenges.length} total · {activeChallenges.length} active now</p>
        </div>
        <a
          href="/editor/challenges/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: "#ec4899" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Challenge
        </a>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Global Challenges", value: globalChallenges.length, color: "#a855f7", icon: "public" },
            { label: "School Challenges", value: schoolChallenges.length, color: "#f59e0b", icon: "school" },
            { label: "Currently Active", value: activeChallenges.length, color: "#10b981", icon: "emoji_events" },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="flex items-center gap-4 p-5 bg-[#1a2e27] rounded-2xl border border-[rgba(236,72,153,0.08)]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
              </div>
              <div>
                <p className="text-white font-bold text-2xl leading-none">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or theme…"
              className="w-full bg-[#1a2e27] border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div className="flex gap-2">
            {["all", "global", "school"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterScope(s)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors border capitalize"
                style={
                  filterScope === s
                    ? { background: "#ec4899", color: "white", borderColor: "#ec4899" }
                    : { background: "transparent", color: "#94a3b8", borderColor: "rgba(255,255,255,0.08)" }
                }
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1a2e27] rounded-2xl border border-[rgba(236,72,153,0.08)]">
              <span className="material-symbols-outlined text-[56px] text-slate-600 mb-3">emoji_events</span>
              <p className="text-white font-semibold mb-1">No challenges found</p>
              <p className="text-slate-400 text-sm">
                {searchQuery || filterScope !== "all" ? "Try adjusting your filters." : "No challenges have been created yet."}
              </p>
            </div>
          ) : (
            filtered.map((challenge) => {
              const status = getChallengeStatus(challenge);
              const scopeColor = SCOPE_COLOR[challenge.scope] ?? "#64748b";

              return (
                <div
                  key={challenge.id}
                  className="bg-[#1a2e27] rounded-2xl border border-[rgba(236,72,153,0.08)] p-5 flex items-center gap-4 hover:border-[rgba(236,72,153,0.2)] transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.12)] flex items-center justify-center shrink-0 text-2xl">
                    {challenge.icon ?? "🏆"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-sm">{challenge.title}</h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: `${scopeColor}18`, color: scopeColor }}
                      >
                        {challenge.scope}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{challenge.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>{challenge.theme}</span>
                      <span>·</span>
                      <span>{formatDate(challenge.startsAt)} → {formatDate(challenge.endsAt)}</span>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1"
                    style={{ background: `${status.color}18`, color: status.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: status.color }} />
                    {status.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
