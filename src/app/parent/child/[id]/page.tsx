"use client";

import { useMemo } from "react";
import Link from "next/link";
import { use } from "react";
import { useParentData } from "@/hooks/useParentData";
import type { ChildEnrollment, ChildSubmission } from "@/hooks/useParentData";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "—";
  const diffMs = Date.now() - ts.seconds * 1000;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  return `${diffD} days ago`;
}

function levelLabel(level: number): string {
  if (level <= 2) return "Explorer";
  if (level <= 5) return "Builder";
  if (level <= 9) return "Innovator";
  return "Champion";
}

function badgeColor(index: number): string {
  const colors = ["#f59e0b", "#8b5cf6", "#13eca4", "#3b82f6", "#ec4899", "#10b981"];
  return colors[index % colors.length];
}

function CourseProgressRow({ enrollment }: { enrollment: ChildEnrollment }) {
  const statusColor =
    enrollment.progress >= 100
      ? "#10b981"
      : enrollment.progress > 0
      ? "#13eca4"
      : "#475569";

  const statusLabel =
    enrollment.progress >= 100
      ? "Completed"
      : enrollment.progress > 0
      ? "In Progress"
      : "Not Started";

  return (
    <div className="flex items-center gap-4 p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(19,236,164,0.06)] hover:border-[rgba(19,236,164,0.12)] transition-all">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${statusColor}18` }}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: statusColor }}>
          {enrollment.progress >= 100 ? "check_circle" : enrollment.progress > 0 ? "play_circle" : "radio_button_unchecked"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-slate-200 text-sm font-medium truncate mr-4">
            {enrollment.courseTitle}
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: `${statusColor}18`,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${enrollment.progress}%`,
                background: "linear-gradient(90deg, #13eca4, #0dd494)",
              }}
            />
          </div>
          <span className="text-[#13eca4] text-xs font-bold shrink-0">{enrollment.progress}%</span>
        </div>
        <p className="text-slate-500 text-[11px] mt-1">
          {enrollment.completedLessons} lessons completed
        </p>
      </div>
    </div>
  );
}

function SubmissionRow({ submission }: { submission: ChildSubmission }) {
  const isPassed = (submission.score ?? 0) >= 70;
  const scoreColor =
    submission.status !== "graded" ? "#64748b" : isPassed ? "#10b981" : "#ef4444";

  return (
    <div className="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(19,236,164,0.06)]">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${scoreColor}18` }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ color: scoreColor }}>
          {submission.status === "graded"
            ? isPassed
              ? "check_circle"
              : "cancel"
            : "schedule"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
            style={{
              background: `${scoreColor}18`,
              color: scoreColor,
            }}
          >
            {submission.status === "graded"
              ? "Graded"
              : submission.status === "pending"
              ? "Awaiting Grade"
              : "Draft"}
          </span>
          <span className="text-slate-500 text-[11px]">{timeAgo(submission.submittedAt)}</span>
        </div>
        {submission.score !== null && (
          <p className="text-(--text-base) font-bold text-lg mt-1 leading-none">
            {submission.score}%{" "}
            {submission.grade && (
              <span className="text-slate-400 text-sm font-normal">· {submission.grade}</span>
            )}
          </p>
        )}
        {submission.feedback && (
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-2 italic">
            &ldquo;{submission.feedback}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

export default function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: childId } = use(params);
  const { children, loading, error } = useParentData();

  const child = useMemo(
    () => children.find((c) => c.student.uid === childId) ?? null,
    [children, childId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="flex items-center justify-center h-64 px-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3 block">
            person_off
          </span>
          <p className="text-slate-400 text-sm">
            {error ?? "Child not found or not linked to your account."}
          </p>
          <Link
            href="/parent/dashboard"
            className="mt-4 inline-flex items-center gap-1 text-[#13eca4] text-sm font-medium hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { student, enrollments, submissions } = child;
  const initials = getInitials(student.displayName);
  const firstName = student.displayName.split(" ")[0];

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed = enrollments.filter((e) => e.progress >= 100);
  const notStarted = enrollments.filter((e) => e.progress === 0);
  const gradedSubmissions = submissions.filter((s) => s.status === "graded");
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  const avgScore =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            gradedSubmissions.length
        )
      : null;

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center gap-4">
        <Link
          href="/parent/dashboard"
          className="p-2 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-(--bg-elevated) text-slate-400 hover:text-(--text-base) transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">{student.displayName}</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {student.grade ? `${student.grade} · ` : ""}Level {student.level}{" "}
            {levelLabel(student.level)}
          </p>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Hero profile */}
        <div className="relative bg-linear-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-8 mb-8 overflow-hidden border border-[rgba(139,92,246,0.15)]">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-[rgba(139,92,246,0.08)] rounded-full" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-(--text-base) font-bold text-3xl shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-(--text-base) mb-1">{student.displayName}</h2>
              <p className="text-[#8b5cf6] text-sm font-medium mb-4">
                Level {student.level} · {levelLabel(student.level)}
                {student.grade ? ` · ${student.grade}` : ""}
              </p>

              {/* XP bar */}
              <div className="max-w-xs">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>XP Progress to Level {student.level + 1}</span>
                  <span className="text-[#13eca4] font-semibold">
                    {student.xp} / {student.level * 1000}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((student.xp / (student.level * 1000)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: "Badges", value: student.badges.length, icon: "military_tech", color: "#f59e0b" },
                { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", icon: "grading", color: "#10b981" },
                { label: "Completed", value: completed.length, icon: "check_circle", color: "#13eca4" },
                {
                  label: "Pending",
                  value: pendingSubmissions.length,
                  icon: "schedule",
                  color: "#f59e0b",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 p-3 bg-(--glass-bg) rounded-xl"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>
                    {s.icon}
                  </span>
                  <div>
                    <p className="text-(--text-base) font-bold text-sm leading-none">{s.value}</p>
                    <p className="text-slate-500 text-[10px]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: courses + submissions */}
          <div className="xl:col-span-2 space-y-8">
            {/* In-progress courses */}
            <section>
              <h2 className="text-(--text-base) font-bold text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4] text-[20px]">play_circle</span>
                In Progress
                <span className="text-slate-500 text-sm font-normal">({inProgress.length})</span>
              </h2>
              {inProgress.length > 0 ? (
                <div className="space-y-3">
                  {inProgress.map((e) => (
                    <CourseProgressRow key={e.id} enrollment={e} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm py-4 text-center">
                  No courses in progress right now.
                </p>
              )}
            </section>

            {/* Completed courses */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-(--text-base) font-bold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10b981] text-[20px]">check_circle</span>
                  Completed
                  <span className="text-slate-500 text-sm font-normal">({completed.length})</span>
                </h2>
                <div className="space-y-3">
                  {completed.map((e) => (
                    <CourseProgressRow key={e.id} enrollment={e} />
                  ))}
                </div>
              </section>
            )}

            {/* Not started */}
            {notStarted.length > 0 && (
              <section>
                <h2 className="text-(--text-base) font-bold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">radio_button_unchecked</span>
                  Not Started
                  <span className="text-slate-500 text-sm font-normal">({notStarted.length})</span>
                </h2>
                <div className="space-y-3">
                  {notStarted.map((e) => (
                    <CourseProgressRow key={e.id} enrollment={e} />
                  ))}
                </div>
              </section>
            )}

            {/* Recent submissions */}
            <section>
              <h2 className="text-(--text-base) font-bold text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">assignment</span>
                Recent Submissions
                <span className="text-slate-500 text-sm font-normal">
                  (last {submissions.length})
                </span>
              </h2>
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map((s) => (
                    <SubmissionRow key={s.id} submission={s} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm py-4 text-center">
                  No submissions yet.
                </p>
              )}
            </section>
          </div>

          {/* Right: badges + summary */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-(--bg-card) rounded-2xl p-5 border border-[rgba(19,236,164,0.08)]">
              <h3 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">
                  military_tech
                </span>
                Badges Earned
                <span className="ml-auto bg-[rgba(245,158,11,0.15)] text-[#f59e0b] text-xs font-bold px-2 py-0.5 rounded-full">
                  {student.badges.length}
                </span>
              </h3>
              {student.badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {student.badges.map((badgeId, i) => (
                    <div
                      key={badgeId}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-(--border-subtle) bg-[rgba(255,255,255,0.02)]"
                    >
                      <span
                        className="material-symbols-outlined text-[28px] mb-1"
                        style={{ color: badgeColor(i), fontVariationSettings: "'FILL' 1" }}
                      >
                        military_tech
                      </span>
                      <p className="text-slate-500 text-[9px] text-center truncate w-full">
                        {badgeId.split("_").slice(-1)[0] ?? "Badge"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-[36px] text-slate-600 mb-2 block">
                    military_tech
                  </span>
                  <p className="text-slate-500 text-xs">
                    {firstName} hasn&apos;t earned any badges yet.
                  </p>
                </div>
              )}
            </div>

            {/* Performance summary */}
            <div className="bg-(--bg-card) rounded-2xl p-5 border border-[rgba(19,236,164,0.08)]">
              <h3 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4] text-[20px]">
                  insights
                </span>
                Performance
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Courses enrolled",
                    value: enrollments.length,
                    color: "#13eca4",
                  },
                  {
                    label: "Courses completed",
                    value: completed.length,
                    color: "#10b981",
                  },
                  {
                    label: "Assignments submitted",
                    value: submissions.length,
                    color: "#8b5cf6",
                  },
                  {
                    label: "Avg assignment score",
                    value: avgScore !== null ? `${avgScore}%` : "—",
                    color: avgScore !== null && avgScore >= 70 ? "#10b981" : "#f59e0b",
                  },
                  {
                    label: "Total XP earned",
                    value: `${student.xp} XP`,
                    color: "#f59e0b",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{label}</span>
                    <span className="font-bold text-sm" style={{ color }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact teacher placeholder */}
            <div className="bg-[rgba(139,92,246,0.06)] rounded-2xl p-5 border border-[rgba(139,92,246,0.12)]">
              <h3 className="text-[#8b5cf6] font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
                Need Help?
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                If you have concerns about {firstName}&apos;s progress, reach out to the school or
                their teacher directly.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] text-xs font-semibold hover:bg-[rgba(139,92,246,0.2)] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
