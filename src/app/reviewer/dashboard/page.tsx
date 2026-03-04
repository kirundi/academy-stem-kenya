"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { getCsrfToken } from "@/lib/csrf";
import type { Course } from "@/lib/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function ReviewerDashboard() {
  const { appUser } = useAuthContext();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [actionCourseId, setActionCourseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const { data: pending, loading: pendingLoading } = useCollection<Course>(
    "courses",
    [where("status", "==", "pending_review")],
    true
  );

  const { data: published } = useCollection<Course>(
    "courses",
    [where("status", "==", "published")],
    true
  );

  const displayName = appUser?.displayName ?? "Reviewer";

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleReview(courseId: string, action: "approve" | "reject") {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify({ action, feedback: feedback.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Review failed");
      showToast(
        action === "approve" ? "Course approved and published!" : "Course returned to draft.",
        action === "approve"
      );
      setReviewing(null);
      setActionCourseId(null);
      setFeedback("");
    } catch {
      showToast("Something went wrong. Try again.", false);
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#f59e0b]">
          progress_activity
        </span>
      </div>
    );
  }

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

      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(245,158,11,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Content Review Queue</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {pending.length} pending · {published.length} published
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-[#f59e0b] font-bold text-sm">
          {getInitials(displayName)}
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Awaiting Review", value: pending.length, icon: "pending", color: "#f59e0b" },
            { label: "Published", value: published.length, icon: "check_circle", color: "#10b981" },
            {
              label: "Total Courses",
              value: pending.length + published.length,
              icon: "school",
              color: "#3b82f6",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-[#1a2e27] rounded-2xl border border-[rgba(245,158,11,0.08)]"
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
                <p className="text-white font-bold text-2xl leading-none">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending queue */}
        <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">pending</span>
          Pending Review
          {pending.length > 0 && (
            <span className="bg-[#f59e0b] text-[#10221c] text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#1a2e27] rounded-2xl border border-[rgba(245,158,11,0.08)] mb-8">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-3">task_alt</span>
            <p className="text-white font-semibold mb-1">All clear!</p>
            <p className="text-slate-400 text-sm">No courses are waiting for review.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {pending.map((course) => {
              const isExpanded = reviewing === course.id;
              const isActing = actionCourseId === course.id;
              const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? "#64748b";

              return (
                <div
                  key={course.id}
                  className="bg-[#1a2e27] rounded-2xl border border-[rgba(245,158,11,0.12)] overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ background: `${course.color ?? "#13eca4"}18` }}>
                        {course.icon ?? "📚"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-bold text-base">{course.title}</h3>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${diffColor}18`, color: diffColor }}
                          >
                            {course.difficulty}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#f59e0b]">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            {course.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">list</span>
                            {course.totalLessons} lessons
                          </span>
                          {course.targetGrade && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">grade</span>
                              Grade {course.targetGrade}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setReviewing(isExpanded ? null : course.id)}
                        className="px-4 py-2 rounded-xl bg-[rgba(245,158,11,0.1)] text-[#f59e0b] text-xs font-semibold hover:bg-[rgba(245,158,11,0.2)] transition-colors border border-[rgba(245,158,11,0.2)] flex items-center gap-1.5 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">rate_review</span>
                        {isExpanded ? "Collapse" : "Review"}
                      </button>
                    </div>

                    {/* Expanded review panel */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-[rgba(245,158,11,0.1)]">
                        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
                          Feedback for author (optional)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Add review notes or feedback for the course author…"
                          rows={3}
                          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-[rgba(245,158,11,0.4)] transition-all mb-4"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => { setActionCourseId(course.id); handleReview(course.id, "approve"); }}
                            disabled={submitting && isActing}
                            className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-[#10221c] font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                          >
                            {submitting && isActing ? (
                              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            )}
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => { setActionCourseId(course.id); handleReview(course.id, "reject"); }}
                            disabled={submitting && isActing}
                            className="flex-1 py-2.5 rounded-xl bg-[rgba(239,68,68,0.15)] text-red-400 font-bold text-sm hover:bg-[rgba(239,68,68,0.25)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 border border-[rgba(239,68,68,0.2)]"
                          >
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Return to Draft
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
