"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getCsrfToken } from "@/lib/csrf";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(ts: unknown) {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  if (!sec) return "—";
  return new Date(sec * 1000).toLocaleDateString("en-KE", {
    year: "numeric", month: "short", day: "numeric",
  });
}

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
  content: string;
  fileUrl: string | null;
  submittedAt: unknown;
  status: string;
  grade: string | null;
  score: number | null;
  feedback: string | null;
}

export default function MentorDashboard() {
  const { appUser } = useAuthContext();
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeData | null>(null);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", score: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const displayName = appUser?.displayName ?? "Mentor";

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/mentor/dashboard");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setChallenges(data.challenges ?? []);
        setSubmissions(data.submissions ?? []);
      } catch {
        setError("Failed to load mentor data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGrade(submissionId: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify({
          grade: gradeForm.grade || null,
          score: gradeForm.score ? Number(gradeForm.score) : null,
          feedback: gradeForm.feedback || null,
        }),
      });
      if (!res.ok) throw new Error("Grade failed");
      showToast("Submission graded successfully!", true);
      setGradingId(null);
      setGradeForm({ grade: "", score: "", feedback: "" });
      // Remove the graded submission from the list
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === selectedChallenge?.id ? { ...c, pendingCount: Math.max(0, c.pendingCount - 1) } : c
        )
      );
    } catch {
      showToast("Something went wrong. Try again.", false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#10b981]">
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

  const challengeSubmissions = selectedChallenge
    ? submissions.filter((s) => s.challengeId === selectedChallenge.id)
    : [];

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl flex items-center gap-2 ${
            toast.ok ? "bg-[#10b981] text-[#10221c]" : "bg-[#ef4444] text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.ok ? "check_circle" : "error"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(16,185,129,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {selectedChallenge ? selectedChallenge.title : "My Challenges"}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {selectedChallenge
              ? `${challengeSubmissions.length} pending submissions`
              : `${challenges.length} assigned challenge${challenges.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedChallenge && (
            <button
              onClick={() => { setSelectedChallenge(null); setGradingId(null); }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              All Challenges
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-[#10b981] font-bold text-sm">
            {getInitials(displayName)}
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {!selectedChallenge ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Assigned Challenges", value: challenges.length, icon: "emoji_events", color: "#10b981" },
                {
                  label: "Pending Submissions",
                  value: challenges.reduce((s, c) => s + c.pendingCount, 0),
                  icon: "pending_actions",
                  color: "#f59e0b",
                },
                {
                  label: "Total Submissions",
                  value: submissions.length,
                  icon: "assignment",
                  color: "#3b82f6",
                },
              ].map(({ label, value, icon, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-5 bg-[#1a2e27] rounded-2xl border border-[rgba(16,185,129,0.08)]"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-2xl leading-none">{value}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Challenge cards */}
            {challenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1a2e27] rounded-2xl border border-[rgba(16,185,129,0.08)]">
                <span className="material-symbols-outlined text-[64px] text-slate-600 mb-3">emoji_events</span>
                <p className="text-white font-semibold mb-1">No challenges assigned yet</p>
                <p className="text-slate-400 text-sm">Contact a platform administrator to be assigned as a judge.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedChallenge(challenge)}
                    className="w-full text-left bg-[#1a2e27] rounded-2xl border border-[rgba(16,185,129,0.1)] hover:border-[rgba(16,185,129,0.3)] transition-all p-5 flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center shrink-0 text-2xl">
                      {challenge.icon ?? "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-bold text-base">{challenge.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981]">
                          {challenge.scope}
                        </span>
                        {challenge.pendingCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f59e0b] text-[#10221c]">
                            {challenge.pendingCount} pending
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-1">{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                          {formatDate(challenge.startsAt)} – {formatDate(challenge.endsAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">label</span>
                          {challenge.theme}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 text-[20px] shrink-0 mt-1">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Submissions list for selected challenge */
          <div>
            {challengeSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1a2e27] rounded-2xl border border-[rgba(16,185,129,0.08)]">
                <span className="material-symbols-outlined text-[64px] text-slate-600 mb-3">task_alt</span>
                <p className="text-white font-semibold mb-1">All clear!</p>
                <p className="text-slate-400 text-sm">No pending submissions for this challenge.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {challengeSubmissions.map((sub) => {
                  const isGrading = gradingId === sub.id;
                  return (
                    <div
                      key={sub.id}
                      className="bg-[#1a2e27] rounded-2xl border border-[rgba(16,185,129,0.1)] overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-[#10b981] text-[11px] font-bold">
                                {sub.studentId.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-slate-400 text-xs font-mono">{sub.studentId.slice(0, 12)}…</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#f59e0b]">
                                Pending
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs">Submitted {formatDate(sub.submittedAt)}</p>
                          </div>
                          <button
                            onClick={() => {
                              setGradingId(isGrading ? null : sub.id);
                              if (!isGrading) setGradeForm({ grade: "", score: "", feedback: "" });
                            }}
                            className="px-4 py-2 rounded-xl bg-[rgba(16,185,129,0.1)] text-[#10b981] text-xs font-semibold hover:bg-[rgba(16,185,129,0.2)] transition-colors border border-[rgba(16,185,129,0.2)] flex items-center gap-1.5 shrink-0"
                          >
                            <span className="material-symbols-outlined text-[16px]">rate_review</span>
                            {isGrading ? "Collapse" : "Grade"}
                          </button>
                        </div>

                        {/* Submission content */}
                        <div className="bg-[rgba(255,255,255,0.03)] rounded-xl px-4 py-3 mb-3 border border-white/[0.05]">
                          <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
                            {sub.content || "No written content submitted."}
                          </p>
                        </div>

                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#10b981] hover:underline mb-3"
                          >
                            <span className="material-symbols-outlined text-[14px]">attach_file</span>
                            View attachment
                          </a>
                        )}

                        {/* Grade form */}
                        {isGrading && (
                          <div className="mt-4 pt-4 border-t border-[rgba(16,185,129,0.1)]">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
                                  Grade
                                </label>
                                <input
                                  value={gradeForm.grade}
                                  onChange={(e) => setGradeForm((f) => ({ ...f, grade: e.target.value }))}
                                  placeholder="A, B+, Pass…"
                                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[rgba(16,185,129,0.4)] transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
                                  Score (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={gradeForm.score}
                                  onChange={(e) => setGradeForm((f) => ({ ...f, score: e.target.value }))}
                                  placeholder="0–100"
                                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[rgba(16,185,129,0.4)] transition-all"
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
                                Feedback for student
                              </label>
                              <textarea
                                value={gradeForm.feedback}
                                onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))}
                                placeholder="Write constructive feedback for the student…"
                                rows={3}
                                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-[rgba(16,185,129,0.4)] transition-all"
                              />
                            </div>
                            <button
                              onClick={() => handleGrade(sub.id)}
                              disabled={submitting}
                              className="w-full py-2.5 rounded-xl bg-[#10b981] text-[#10221c] font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                            >
                              {submitting ? (
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                              ) : (
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              )}
                              Submit Grade
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
