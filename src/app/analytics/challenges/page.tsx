"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { useCollection } from "@/hooks/useFirestore";
import { orderBy } from "firebase/firestore";
import type { Challenge } from "@/lib/types";

interface ChallengeDoc extends Challenge {
  id: string;
}

function getChallengeStatus(challenge: Challenge) {
  const now = Date.now();
  const rawStart = challenge.startsAt as unknown as { seconds?: number };
  const rawEnd = challenge.endsAt as unknown as { seconds?: number };
  const start = rawStart?.seconds ? rawStart.seconds * 1000 : 0;
  const end = rawEnd?.seconds ? rawEnd.seconds * 1000 : 0;
  if (now < start) return { label: "Upcoming", color: "#3b82f6" };
  if (now > end) return { label: "Ended", color: "#64748b" };
  return { label: "Active", color: "#10b981" };
}

function formatDate(ts: Date | null | undefined): string {
  if (!ts) return "—";
  const raw = ts as unknown as { seconds?: number };
  if (raw?.seconds) return new Date(raw.seconds * 1000).toLocaleDateString();
  if (ts instanceof Date) return ts.toLocaleDateString();
  return "—";
}

export default function AnalyticsChallengesPage() {
  const { loading: globalLoading, error } = useGlobalAdminData();
  const {
    data: challenges,
    loading: challengesLoading,
  } = useCollection<ChallengeDoc>("challenges", [orderBy("createdAt", "desc")], true);

  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loading = globalLoading || challengesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#a855f7]">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-3">
        <span className="material-symbols-outlined text-[48px] text-red-400">error</span>
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  const globalChallenges = challenges.filter((c) => c.scope === "global");
  const schoolChallenges = challenges.filter((c) => c.scope === "school");
  const activeChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Active");
  const upcomingChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Upcoming");
  const endedChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Ended");

  const filtered = challenges.filter((c) => {
    const matchesScope = scopeFilter === "all" || c.scope === scopeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(q) ||
      c.theme?.toLowerCase().includes(q);
    return matchesScope && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Challenges Analytics</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {challenges.length} total · {activeChallenges.length} active
          </p>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Challenges", value: challenges.length, icon: "emoji_events", color: "#a855f7" },
            { label: "Global Challenges", value: globalChallenges.length, icon: "public", color: "#3b82f6" },
            { label: "School Challenges", value: schoolChallenges.length, icon: "domain", color: "#f59e0b" },
            { label: "Currently Active", value: activeChallenges.length, icon: "play_circle", color: "#10b981" },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color }}
                >
                  {icon}
                </span>
              </div>
              <div>
                <p className="text-(--text-base) font-bold text-2xl leading-none">{value}</p>
                <p className="text-(--text-muted) text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Breakdown */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
          <h2 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a855f7] text-[20px]">
              donut_large
            </span>
            Status Breakdown
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Upcoming", value: upcomingChallenges.length, color: "#3b82f6", icon: "schedule" },
              { label: "Active", value: activeChallenges.length, color: "#10b981", icon: "play_circle" },
              { label: "Ended", value: endedChallenges.length, color: "#64748b", icon: "check_circle" },
            ].map(({ label, value, color, icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: `${color}10` }}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ color }}
                >
                  {icon}
                </span>
                <div>
                  <p className="text-(--text-base) font-bold text-xl leading-none">{value}</p>
                  <p className="text-xs mt-0.5" style={{ color }}>
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges table */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(168,85,247,0.08)] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[20px]">
                table_chart
              </span>
              <h2 className="text-(--text-base) font-bold">All Challenges</h2>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-faint) text-[16px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or theme…"
                  className="bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg pl-8 pr-3 py-1.5 text-(--text-base) text-xs placeholder:text-(--text-faint) focus:outline-none focus:border-[rgba(168,85,247,0.4)]"
                />
              </div>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg px-3 py-1.5 text-(--text-base) text-xs focus:outline-none"
              >
                <option value="all">All scopes</option>
                <option value="global">Global</option>
                <option value="school">School</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[rgba(255,255,255,0.03)]">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-(--text-faint) mb-2 block">
                  emoji_events
                </span>
                <p className="text-(--text-muted) text-sm">No challenges match your filter.</p>
              </div>
            ) : (
              filtered.map((challenge) => {
                const status = getChallengeStatus(challenge);
                const isGlobal = challenge.scope === "global";
                return (
                  <div
                    key={challenge.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[rgba(168,85,247,0.03)] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: "rgba(168,85,247,0.12)" }}
                    >
                      {challenge.icon ?? "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-(--text-base) font-medium text-sm truncate">{challenge.title}</p>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={
                            isGlobal
                              ? { background: "rgba(168,85,247,0.15)", color: "#a855f7" }
                              : { background: "rgba(245,158,11,0.15)", color: "#f59e0b" }
                          }
                        >
                          {isGlobal ? "Global" : "School"}
                        </span>
                      </div>
                      <p className="text-(--text-faint) text-xs mt-0.5">{challenge.theme}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-(--text-muted) text-xs">
                          {formatDate(challenge.startsAt)} → {formatDate(challenge.endsAt)}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: `${status.color}18`,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
