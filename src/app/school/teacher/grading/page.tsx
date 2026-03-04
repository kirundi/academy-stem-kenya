"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Submission } from "@/lib/types";

const rubricCriteria = [
  {
    label: "Technical Accuracy",
    max: 30,
    description: "Does the solution work as intended and follow technical requirements?",
  },
  {
    label: "Creativity & Design",
    max: 25,
    description: "Is the approach creative and well-designed?",
  },
  { label: "Documentation", max: 20, description: "Is the work well-documented and explained?" },
  {
    label: "Effort & Completeness",
    max: 25,
    description: "Was a genuine effort made and is the project complete?",
  },
];

export default function GradingPage() {
  const { appUser } = useAuthContext();
  const { classrooms, loading: teacherLoading } = useTeacherData();

  const classroomIds = classrooms.map((c) => c.id);

  // Fetch all submissions for teacher's classrooms
  const { data: allSubmissions, loading: submissionsLoading } = useCollection<Submission>(
    "submissions",
    classroomIds.length > 0
      ? [where("classroomId", "in", classroomIds.slice(0, 10)), orderBy("submittedAt", "desc")]
      : [],
    classroomIds.length > 0
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rubric, setRubric] = useState<Record<string, number>>({
    "Technical Accuracy": 25,
    "Creativity & Design": 20,
    Documentation: 15,
    "Effort & Completeness": 22,
  });
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  const loading = teacherLoading || submissionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
          progress_activity
        </span>
      </div>
    );
  }

  const submissions = allSubmissions.map((s) => ({
    ...s,
    statusDisplay: s.status === "pending" ? "Pending" : s.status === "graded" ? "Graded" : "Draft",
  }));

  const filtered =
    filter === "All" ? submissions : submissions.filter((s) => s.statusDisplay === filter);

  const selected = selectedId
    ? (submissions.find((s) => s.id === selectedId) ?? submissions[0])
    : submissions[0];

  const totalScore = Object.values(rubric).reduce((a, b) => a + b, 0);
  const maxScore = rubricCriteria.reduce((a, c) => a + c.max, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);
  const grade =
    percentage >= 90
      ? "A+"
      : percentage >= 85
        ? "A"
        : percentage >= 80
          ? "B+"
          : percentage >= 75
            ? "B"
            : percentage >= 70
              ? "C+"
              : "C";

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const handleSubmitGrade = async () => {
    if (!selected || !appUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${selected.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          score: percentage,
          feedback,
          rubricScores: rubric,
          gradedBy: appUser.uid,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit grade");
      await logActivity(
        appUser.uid,
        "grade_submission",
        `Graded submission ${selected.id} with ${grade}`
      );
      setFeedback("");
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Grading error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-(--bg-page)">
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Grading & Feedback</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">No submissions to review</p>
          </div>
        </header>
        <div className="flex items-center justify-center h-64 text-(--text-faint)">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] mb-4 block">grading</span>
            <p>No submissions yet. They will appear here when students submit work.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Grading & Feedback</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {pendingCount} submission{pendingCount !== 1 ? "s" : ""} pending review
          </p>
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Graded"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-primary-green text-white"
                  : "bg-(--input-bg) text-(--text-muted) hover:text-(--text-base)"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Submission List */}
        <div className="w-80 bg-(--bg-page) border-r border-(--border-subtle) overflow-y-auto">
          <div className="p-3 space-y-2">
            {filtered.map((sub) => {
              const initials = (sub.studentId ?? "?").slice(0, 2).toUpperCase();
              const submittedDate =
                sub.submittedAt instanceof Date
                  ? sub.submittedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unknown date";
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedId(sub.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selected?.id === sub.id
                      ? "bg-primary-green/10 border border-(--border-accent)"
                      : "bg-[rgba(255,255,255,0.03)] border border-transparent hover:border-(--border-subtle)"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-green/12 flex items-center justify-center text-xs font-bold text-primary-green">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-(--text-base) text-sm font-semibold">{sub.studentId}</p>
                      <p className="text-(--text-faint) text-xs">{submittedDate}</p>
                    </div>
                    {sub.status === "graded" ? (
                      <span className="text-primary-green text-sm font-bold">{sub.grade}</span>
                    ) : (
                      <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    )}
                  </div>
                  <p className="text-(--text-muted) text-xs font-medium truncate">
                    {sub.content || "Submission"}
                  </p>
                  <p className="text-(--text-faint) text-xs">{sub.courseId}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grading Panel */}
        <div className="flex-1 overflow-y-auto p-8">
          {selected && (
            <div className="max-w-2xl">
              {/* Submission header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-green/12 flex items-center justify-center text-sm font-bold text-primary-green">
                  {(selected.studentId ?? "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-(--text-base) text-2xl font-bold">
                    {selected.content || "Submission"}
                  </h2>
                  <p className="text-(--text-muted) text-sm">
                    {selected.studentId} · {selected.courseId} · {selected.classroomId}
                  </p>
                  <p className="text-(--text-faint) text-xs mt-1">
                    Submitted{" "}
                    {selected.submittedAt instanceof Date
                      ? selected.submittedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Unknown date"}
                  </p>
                </div>
              </div>

              {/* Student Work */}
              {selected.content && (
                <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6 mb-6">
                  <h3 className="text-(--text-base) font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-green text-[20px]">
                      description
                    </span>
                    Student&apos;s Submission
                  </h3>
                  <p className="text-(--text-muted) text-sm leading-relaxed">{selected.content}</p>
                  {selected.fileUrl && (
                    <a
                      href={selected.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-primary-green text-sm hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">attach_file</span>
                      View attached file
                    </a>
                  )}
                </div>
              )}

              {/* Rubric */}
              <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-(--border-subtle)">
                  <h3 className="text-(--text-base) font-bold">Grading Rubric</h3>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {rubricCriteria.map((criterion) => (
                    <div key={criterion.label} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-(--text-base) font-medium text-sm">{criterion.label}</p>
                          <p className="text-(--text-faint) text-xs">{criterion.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={criterion.max}
                            value={rubric[criterion.label]}
                            onChange={(e) =>
                              setRubric((prev) => ({
                                ...prev,
                                [criterion.label]: Math.min(
                                  criterion.max,
                                  Math.max(0, parseInt(e.target.value) || 0)
                                ),
                              }))
                            }
                            className="w-16 text-center bg-(--input-bg) border border-(--border-subtle) rounded-lg py-1.5 text-(--text-base) font-bold text-sm focus:border-primary-green outline-none"
                          />
                          <span className="text-(--text-faint) text-sm">/ {criterion.max}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full transition-all"
                          style={{ width: `${(rubric[criterion.label] / criterion.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total */}
                <div className="px-6 py-4 bg-[rgba(0,0,0,0.2)] flex items-center justify-between">
                  <span className="text-(--text-base) font-semibold">Total Score</span>
                  <div className="flex items-center gap-3">
                    <span className="text-(--text-muted) text-sm">
                      {totalScore} / {maxScore}
                    </span>
                    <span
                      className="text-2xl font-black"
                      style={{
                        color:
                          percentage >= 90 ? "#13eca4" : percentage >= 75 ? "#f59e0b" : "#ff4d4d",
                      }}
                    >
                      {grade}
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{
                        color:
                          percentage >= 90 ? "#13eca4" : percentage >= 75 ? "#f59e0b" : "#ff4d4d",
                      }}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6 mb-6">
                <h3 className="text-(--text-base) font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-green text-[20px]">
                    feedback
                  </span>
                  Feedback to Student
                </h3>
                <textarea
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write constructive feedback for the student here..."
                  className="form-input resize-none mb-4"
                />
                {/* Quick feedback buttons */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    "Great work!",
                    "Nice creativity",
                    "Add more detail",
                    "Needs improvement",
                    "Well documented",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setFeedback((prev) => (prev ? `${prev} ${q}` : q))}
                      className="text-xs px-3 py-1.5 rounded-xl bg-(--input-bg) text-(--text-muted) hover:text-(--text-base) hover:bg-[rgba(255,255,255,0.1)] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitGrade}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-green text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-green/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {submitting ? "progress_activity" : "check_circle"}
                  </span>
                  {submitting ? "Submitting..." : "Submit Grade & Feedback"}
                </button>
                <button className="px-5 py-3.5 border border-(--border-subtle) text-(--text-muted) rounded-xl font-semibold hover:border-(--border-accent) hover:text-(--text-base) transition-all">
                  <span className="material-symbols-outlined text-[20px]">save</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
