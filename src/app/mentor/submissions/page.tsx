"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ChallengeData {
  id: string;
  title: string;
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

type FilterTab = "all" | "pending" | "graded";

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

function StatusBadge({ status }: { status: string }) {
  if (status === "graded") {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] text-[10px] font-bold uppercase tracking-wide">
        Graded
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#f59e0b] text-[10px] font-bold uppercase tracking-wide">
      Pending
    </span>
  );
}

export default function MentorSubmissionsPage() {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/mentor/dashboard");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setChallenges(data.challenges ?? []);
        // The API only returns pending submissions; we display them with their real status
        setSubmissions(data.submissions ?? []);
      } catch {
        setError("Failed to load submissions. Please try again.");
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

  const totalPending = challenges.reduce((s, c) => s + c.pendingCount, 0);
  const totalGraded = submissions.filter((s) => s.status === "graded").length;
  const totalSubmissions = submissions.length;

  const challengeMap: Record<string, string> = {};
  challenges.forEach((c) => {
    challengeMap[c.id] = c.title;
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === "pending") return s.status === "pending";
    if (activeTab === "graded") return s.status === "graded";
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalSubmissions },
    { key: "pending", label: "Pending", count: totalPending },
    { key: "graded", label: "Graded", count: totalGraded },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base) flex items-center gap-2">
            <span className="material-symbols-outlined text-[#10b981] text-[22px]">
              assignment_turned_in
            </span>
            Submissions
          </h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            Grading queue for your assigned challenges
          </p>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Submissions",
              value: totalSubmissions,
              icon: "assignment",
              color: "#3b82f6",
            },
            {
              label: "Pending Grade",
              value: totalPending,
              icon: "pending_actions",
              color: "#f59e0b",
            },
            {
              label: "Graded",
              value: totalGraded,
              icon: "grading",
              color: "#10b981",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(16,185,129,0.08)]"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[24px]" style={{ color }}>
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

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-[#10b981] text-[#10221c]"
                  : "bg-[rgba(16,185,129,0.08)] text-[#10b981] border border-[rgba(16,185,129,0.15)] hover:bg-[rgba(16,185,129,0.15)]"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[rgba(0,0,0,0.15)] text-[#10221c]"
                    : "bg-[rgba(16,185,129,0.15)] text-[#10b981]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Submissions list */}
        {filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-(--bg-card) rounded-2xl border border-[rgba(16,185,129,0.08)]">
            <span className="material-symbols-outlined text-[64px] text-(--text-faint) mb-4">
              task_alt
            </span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">
              {activeTab === "pending" ? "All caught up!" : "No submissions yet"}
            </p>
            <p className="text-(--text-muted) text-sm">
              {activeTab === "pending"
                ? "No submissions awaiting grades."
                : "Submissions will appear here once students participate."}
            </p>
          </div>
        ) : (
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(16,185,129,0.08)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-(--text-faint) uppercase tracking-widest border-b border-[rgba(16,185,129,0.06)]">
              <div className="col-span-3">Submitter</div>
              <div className="col-span-4">Challenge</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-1">Score</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            <div className="divide-y divide-[rgba(16,185,129,0.05)]">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-[rgba(16,185,129,0.03)] transition-colors"
                >
                  {/* Submitter */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-[#10b981] text-[11px] font-bold shrink-0">
                      {sub.studentId.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-(--text-base) text-xs font-mono truncate">
                      {sub.studentId.slice(0, 14)}&hellip;
                    </span>
                  </div>

                  {/* Challenge */}
                  <div className="col-span-4 min-w-0">
                    <p className="text-(--text-base) text-sm font-medium truncate">
                      {challengeMap[sub.challengeId] ?? "Unknown Challenge"}
                    </p>
                  </div>

                  {/* Submitted date */}
                  <div className="col-span-2">
                    <span className="text-(--text-muted) text-xs">{formatDate(sub.submittedAt)}</span>
                  </div>

                  {/* Score */}
                  <div className="col-span-1">
                    {sub.score !== null ? (
                      <span
                        className="text-xs font-bold"
                        style={{ color: sub.score >= 70 ? "#10b981" : "#ef4444" }}
                      >
                        {sub.score}%
                      </span>
                    ) : (
                      <span className="text-(--text-faint) text-xs">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <StatusBadge status={sub.status} />
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-end">
                    {sub.status === "pending" ? (
                      <Link
                        href="/mentor/dashboard"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[rgba(16,185,129,0.1)] text-[#10b981] text-[11px] font-semibold hover:bg-[rgba(16,185,129,0.2)] transition-colors border border-[rgba(16,185,129,0.2)] whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[13px]">rate_review</span>
                        Grade
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-(--text-faint) text-[11px]">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Done
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
