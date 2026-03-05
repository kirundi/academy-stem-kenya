"use client";

import { useState, useEffect } from "react";

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  theme: string;
  icon: string;
  scope: string;
  startsAt: unknown;
  endsAt: unknown;
  pendingCount: number;
}

interface SubmissionData {
  id: string;
  studentId: string;
  challengeId: string;
  submittedAt: unknown;
  status: string;
  grade: string | null;
  score: number | null;
}

interface RankedEntry {
  submissionId: string;
  studentId: string;
  score: number | null;
  grade: string | null;
  submittedAt: unknown;
  rank: number;
}

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  if (!sec) return "—";
  return new Date(sec * 1000).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-9 h-9 rounded-full bg-[rgba(251,191,36,0.15)] flex items-center justify-center shrink-0">
        <span className="text-lg leading-none">&#x1F947;</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-9 h-9 rounded-full bg-[rgba(148,163,184,0.15)] flex items-center justify-center shrink-0">
        <span className="text-lg leading-none">&#x1F948;</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-full bg-[rgba(205,127,50,0.15)] flex items-center justify-center shrink-0">
        <span className="text-lg leading-none">&#x1F949;</span>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[rgba(16,185,129,0.08)] flex items-center justify-center shrink-0">
      <span className="text-(--text-muted) text-sm font-bold">{rank}</span>
    </div>
  );
}

function ChallengeLeaderboard({
  challenge,
  entries,
}: {
  challenge: ChallengeData;
  entries: RankedEntry[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
      {/* Challenge header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-4 px-6 py-5 border-b border-[rgba(16,185,129,0.08)] bg-[rgba(16,185,129,0.03)] hover:bg-[rgba(16,185,129,0.06)] transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center shrink-0 text-2xl">
          {challenge.icon ?? "&#x1F3C6;"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-(--text-base) font-bold text-base truncate">{challenge.title}</h3>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981]">
              {challenge.scope}
            </span>
            <span className="text-(--text-muted) text-xs">{challenge.theme}</span>
            <span className="text-(--text-faint) text-xs">{entries.length} ranked</span>
          </div>
        </div>
        <span className="material-symbols-outlined text-(--text-faint) text-[20px] shrink-0 transition-transform" style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
          expand_more
        </span>
      </button>

      {!collapsed && (
        <>
          {entries.length === 0 ? (
            <div className="px-6 py-10 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[48px] text-(--text-faint) mb-3">
                leaderboard
              </span>
              <p className="text-(--text-base) font-semibold mb-1">No graded submissions yet</p>
              <p className="text-(--text-faint) text-sm">
                Scores will appear here once submissions are graded.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(16,185,129,0.05)]">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-2.5 text-[10px] font-bold text-(--text-faint) uppercase tracking-widest">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Submitter</div>
                <div className="col-span-2">Grade</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2 text-right">Submitted</div>
              </div>
              {entries.map((entry) => (
                <div
                  key={entry.submissionId}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-3.5 hover:bg-[rgba(16,185,129,0.02)] transition-colors ${entry.rank <= 3 ? "bg-[rgba(16,185,129,0.01)]" : ""}`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex justify-center">
                    <RankBadge rank={entry.rank} />
                  </div>

                  {/* Submitter */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.12)] flex items-center justify-center text-[#10b981] text-[11px] font-bold shrink-0">
                      {entry.studentId.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-(--text-base) text-xs font-mono truncate">
                      {entry.studentId.slice(0, 14)}&hellip;
                    </span>
                  </div>

                  {/* Grade */}
                  <div className="col-span-2">
                    {entry.grade ? (
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#10b981] text-xs font-bold">
                        {entry.grade}
                      </span>
                    ) : (
                      <span className="text-(--text-faint) text-xs">—</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="col-span-2">
                    {entry.score !== null ? (
                      <span
                        className="text-sm font-bold"
                        style={{
                          color:
                            entry.score >= 80
                              ? "#10b981"
                              : entry.score >= 60
                                ? "#f59e0b"
                                : "#ef4444",
                        }}
                      >
                        {entry.score}%
                      </span>
                    ) : (
                      <span className="text-(--text-faint) text-xs">No score</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-right">
                    <span className="text-(--text-faint) text-xs">{formatDate(entry.submittedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MentorLeaderboardPage() {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/mentor/dashboard");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setChallenges(data.challenges ?? []);
        setSubmissions(data.submissions ?? []);
      } catch {
        setError("Failed to load leaderboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#10b981]">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center px-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 mb-3 block">
            error
          </span>
          <p className="text-red-400 font-semibold mb-1">Something went wrong</p>
          <p className="text-(--text-faint) text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Build ranked entries per challenge from graded submissions
  // The dashboard API only returns pending submissions; if there are none graded yet
  // the leaderboard will show empty states per challenge. This is correct behaviour.
  const rankedByChallenge: Record<string, RankedEntry[]> = {};
  challenges.forEach((c) => {
    const challengeSubs = submissions
      .filter((s) => s.challengeId === c.id && s.status === "graded")
      .sort((a, b) => {
        // Sort by score desc, then by submittedAt asc for tie-breaking
        const aScore = a.score ?? -1;
        const bScore = b.score ?? -1;
        if (bScore !== aScore) return bScore - aScore;
        const aTs = (a.submittedAt as { seconds?: number })?.seconds ?? 0;
        const bTs = (b.submittedAt as { seconds?: number })?.seconds ?? 0;
        return aTs - bTs;
      });
    rankedByChallenge[c.id] = challengeSubs.map((s, idx) => ({
      submissionId: s.id,
      studentId: s.studentId,
      score: s.score,
      grade: s.grade,
      submittedAt: s.submittedAt,
      rank: idx + 1,
    }));
  });

  const totalRanked = Object.values(rankedByChallenge).reduce(
    (sum, entries) => sum + entries.length,
    0
  );

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base) flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981] text-[22px]">leaderboard</span>
            Leaderboard
          </h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            Top performers across your challenges
          </p>
        </div>
        {totalRanked > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)]">
            <span className="material-symbols-outlined text-[#10b981] text-[18px]">grading</span>
            <span className="text-(--text-base) font-bold text-sm">{totalRanked}</span>
            <span className="text-[#10b981] text-xs font-semibold">Ranked</span>
          </div>
        )}
      </header>

      <div className="px-8 py-8">
        {challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-(--bg-card) rounded-2xl border border-[rgba(16,185,129,0.08)]">
            <span className="material-symbols-outlined text-[64px] text-(--text-faint) mb-4">
              leaderboard
            </span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">No challenges assigned yet</p>
            <p className="text-(--text-muted) text-sm max-w-sm text-center">
              Contact a platform administrator to be assigned as a judge for a challenge.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {challenges.map((challenge) => (
              <ChallengeLeaderboard
                key={challenge.id}
                challenge={challenge}
                entries={rankedByChallenge[challenge.id] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
