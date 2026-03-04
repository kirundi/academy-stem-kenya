"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { useAuthContext } from "@/contexts/AuthContext";
import { orderBy, where } from "firebase/firestore";
import type { Challenge } from "@/lib/types";
import SchoolAdminSidebar from "@/components/SchoolAdminSidebar";

function formatDate(d: unknown) {
  if (!d) return "—";
  const date =
    (d as { toDate?: () => Date })?.toDate?.() ??
    (d instanceof Date ? d : null) ??
    ((d as { seconds?: number })?.seconds
      ? new Date((d as { seconds: number }).seconds * 1000)
      : null);
  if (!date) return "—";
  return date.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

function getChallengeStatus(challenge: Challenge): { label: string; color: string } {
  const now = Date.now();
  const start =
    challenge.startsAt instanceof Date
      ? challenge.startsAt.getTime()
      : (challenge.startsAt as unknown as { seconds?: number })?.seconds
        ? (challenge.startsAt as unknown as { seconds: number }).seconds * 1000
        : 0;
  const end =
    challenge.endsAt instanceof Date
      ? challenge.endsAt.getTime()
      : (challenge.endsAt as unknown as { seconds?: number })?.seconds
        ? (challenge.endsAt as unknown as { seconds: number }).seconds * 1000
        : 0;

  if (now < start) return { label: "Upcoming", color: "#3b82f6" };
  if (now > end) return { label: "Ended", color: "#64748b" };
  return { label: "Active", color: "#10b981" };
}

export default function SchoolChallengesPage() {
  const { appUser } = useAuthContext();
  const schoolId = appUser?.schoolId ?? null;

  const { data: challenges, loading } = useCollection<Challenge>(
    "challenges",
    schoolId
      ? [where("scope", "==", "school"), where("schoolId", "==", schoolId), orderBy("createdAt", "desc")]
      : [],
    !!schoolId
  );

  const [searchQuery, setSearchQuery] = useState("");

  const totalChallenges = challenges.length;
  const activeChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Active");
  const upcomingChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Upcoming");
  const endedChallenges = challenges.filter((c) => getChallengeStatus(c).label === "Ended");

  const filtered = challenges.filter(
    (c) =>
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <SchoolAdminSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">School Challenges</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">
              Note: Global challenges are also visible to students. Create challenges from the Admin
              dashboard.
            </p>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(19,236,164,0.06)] border border-[rgba(19,236,164,0.15)]">
            <span className="material-symbols-outlined text-primary-green text-[20px] shrink-0 mt-0.5">
              info
            </span>
            <p className="text-sm text-(--text-muted)">
              Challenge creation is managed from the{" "}
              <span className="font-semibold text-primary-green">Admin dashboard → Challenges</span>.
              This page shows all challenges scoped to your school.
            </p>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
                progress_activity
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Challenges",
                    value: totalChallenges,
                    color: "#13eca4",
                    icon: "emoji_events",
                  },
                  {
                    label: "Active Now",
                    value: activeChallenges.length,
                    color: "#10b981",
                    icon: "play_circle",
                  },
                  {
                    label: "Upcoming",
                    value: upcomingChallenges.length,
                    color: "#3b82f6",
                    icon: "schedule",
                  },
                  {
                    label: "Ended",
                    value: endedChallenges.length,
                    color: "#64748b",
                    icon: "check_circle",
                  },
                ].map(({ label, value, color, icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)]"
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

              {/* Search */}
              <div className="relative max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, theme, or description…"
                  className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl pl-9 pr-4 py-2.5 text-(--text-base) text-sm placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
                />
              </div>

              {/* Challenge list */}
              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)]">
                    <span className="material-symbols-outlined text-[56px] text-slate-600 mb-3">
                      emoji_events
                    </span>
                    <p className="text-(--text-base) font-semibold mb-1">No school challenges found</p>
                    <p className="text-(--text-muted) text-sm">
                      {searchQuery
                        ? "Try adjusting your search."
                        : "No challenges have been created for your school yet."}
                    </p>
                  </div>
                ) : (
                  filtered.map((challenge) => {
                    const status = getChallengeStatus(challenge);
                    return (
                      <div
                        key={challenge.id}
                        className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] p-5 flex items-center gap-4 hover:border-[rgba(19,236,164,0.2)] transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[rgba(19,236,164,0.10)] flex items-center justify-center shrink-0 text-2xl">
                          {challenge.icon ?? "🏆"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-(--text-base) font-bold text-sm">{challenge.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">
                              school
                            </span>
                          </div>
                          <p className="text-(--text-muted) text-xs mt-0.5 line-clamp-1">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span>{challenge.theme}</span>
                            <span>·</span>
                            <span>
                              {formatDate(challenge.startsAt)} → {formatDate(challenge.endsAt)}
                            </span>
                          </div>
                        </div>

                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1"
                          style={{ background: `${status.color}18`, color: status.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: status.color }}
                          />
                          {status.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
