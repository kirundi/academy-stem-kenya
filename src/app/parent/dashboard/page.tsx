"use client";

import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useParentData } from "@/hooks/useParentData";
import type { ChildProgress } from "@/hooks/useParentData";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "";
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

function ChildCard({ child }: { child: ChildProgress }) {
  const { student, enrollments, submissions } = child;
  const initials = getInitials(student.displayName);

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const completed = enrollments.filter((e) => e.progress >= 100).length;
  const graded = submissions.filter((s) => s.status === "graded").length;
  const pending = submissions.filter((s) => s.status === "pending").length;

  const overallProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

  const lastGraded = submissions.find((s) => s.status === "graded");

  return (
    <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) hover:border-(--border-accent) transition-all overflow-hidden">
      {/* Card header */}
      <div className="relative p-5 pb-4 bg-linear-to-r from-[#162820] to-[#1a2e27] border-b border-[rgba(45,212,191,0.06)]">
        <div className="absolute -right-6 -top-6 w-32 h-32 border-2 border-[rgba(139,92,246,0.08)] rounded-full" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-(--text-base) font-bold text-xl shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-(--text-base) font-bold text-base truncate">{student.displayName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {student.grade && (
                <span className="px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] text-xs font-semibold">
                  {student.grade}
                </span>
              )}
              <span className="text-(--primary-green) text-xs font-medium">
                Level {student.level} · {levelLabel(student.level)}
              </span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3 relative">
          <div className="flex justify-between text-xs text-(--text-muted) mb-1.5">
            <span>XP Progress</span>
            <span className="text-(--primary-green) font-semibold">{student.xp} XP</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-(--primary-green) to-(--primary-green-dark) rounded-full"
              style={{
                width: `${Math.min(100, Math.round((student.xp / (student.level * 1000)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 divide-x divide-[rgba(45,212,191,0.06)] border-b border-[rgba(45,212,191,0.06)]">
        {[
          { label: "In Progress", value: inProgress, icon: "play_circle", color: "var(--primary-green)" },
          { label: "Completed", value: completed, icon: "check_circle", color: "#10b981" },
          { label: "Graded", value: graded, icon: "grading", color: "#f59e0b" },
          { label: "Badges", value: student.badges.length, icon: "military_tech", color: "#8b5cf6" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-3 px-2">
            <span
              className="material-symbols-outlined text-[18px] mb-1"
              style={{ color: stat.color }}
            >
              {stat.icon}
            </span>
            <p className="text-(--text-base) font-bold text-base leading-none">{stat.value}</p>
            <p className="text-(--text-faint) text-[10px] text-center mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="px-5 py-3 border-b border-[rgba(45,212,191,0.06)]">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-(--text-muted)">Overall course progress</span>
          <span className="text-(--text-base) font-bold">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${overallProgress}%`,
              background: "linear-gradient(90deg, #2dd4bf, #14b8a6)",
            }}
          />
        </div>
      </div>

      {/* Last graded submission */}
      {lastGraded ? (
        <div className="px-5 py-3 border-b border-[rgba(45,212,191,0.06)]">
          <p className="text-(--text-faint) text-[10px] uppercase tracking-wide font-semibold mb-1">
            Latest Grade
          </p>
          <div className="flex items-center justify-between">
            <p className="text-(--text-muted) text-xs truncate flex-1 mr-2">
              {lastGraded.grade ?? "Graded"} · {timeAgo(lastGraded.submittedAt)}
            </p>
            {lastGraded.score !== null && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background:
                    lastGraded.score >= 70
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color: lastGraded.score >= 70 ? "#10b981" : "#ef4444",
                }}
              >
                {lastGraded.score}%
              </span>
            )}
          </div>
        </div>
      ) : pending > 0 ? (
        <div className="px-5 py-3 border-b border-[rgba(45,212,191,0.06)]">
          <p className="text-(--text-faint) text-[10px] uppercase tracking-wide font-semibold mb-1">
            Submissions
          </p>
          <p className="text-amber-400 text-xs font-medium">{pending} awaiting grade</p>
        </div>
      ) : null}

      {/* Action */}
      <div className="p-4">
        <Link
          href={`/parent/child/${student.uid}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[rgba(45,212,191,0.08)] hover:bg-[rgba(45,212,191,0.15)] border border-(--border-medium) text-(--primary-green) text-sm font-semibold transition-all group"
        >
          View Full Report
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const { appUser } = useAuthContext();
  const { children, loading, error } = useParentData();

  const displayName = appUser?.displayName ?? "Parent";
  const firstName = displayName.split(" ")[0];

  // Aggregate recent grades across all children
  const recentGrades = children
    .flatMap((c) =>
      c.submissions
        .filter((s) => s.status === "graded")
        .map((s) => ({ ...s, childName: c.student.displayName.split(" ")[0] }))
    )
    .sort((a, b) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 px-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 mb-3 block">
            error
          </span>
          <p className="text-(--text-muted) text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">My Children</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-(--text-base) font-bold text-sm">
            {getInitials(displayName)}
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Hero */}
        <div className="relative bg-linear-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-8 mb-8 overflow-hidden border border-[rgba(139,92,246,0.15)]">
          <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-[rgba(139,92,246,0.04)] to-transparent" />
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-[rgba(139,92,246,0.08)] rounded-full" />
          <div className="relative z-10">
            <p className="text-[#8b5cf6] font-semibold text-sm mb-2 uppercase tracking-widest">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold text-(--text-base) mb-2">Hi, {firstName}!</h2>
            <p className="text-(--text-muted) mb-6 max-w-md">
              {children.length === 0
                ? "You don't have any children linked to your account yet. Contact the school to get set up."
                : children.length === 1
                ? `You're tracking ${children[0].student.displayName.split(" ")[0]}'s STEM progress.`
                : `You're tracking ${children.length} children's STEM journeys.`}
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                {
                  icon: "family_restroom",
                  color: "#8b5cf6",
                  label: "Children",
                  value: String(children.length),
                },
                {
                  icon: "school",
                  color: "var(--primary-green)",
                  label: "Active Courses",
                  value: String(
                    children.reduce(
                      (sum, c) => sum + c.enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
                      0
                    )
                  ),
                },
                {
                  icon: "military_tech",
                  color: "#f59e0b",
                  label: "Badges Earned",
                  value: String(children.reduce((sum, c) => sum + c.student.badges.length, 0)),
                },
                {
                  icon: "grading",
                  color: "#10b981",
                  label: "Graded Work",
                  value: String(
                    children.reduce(
                      (sum, c) => sum + c.submissions.filter((s) => s.status === "graded").length,
                      0
                    )
                  ),
                },
              ].map(({ icon, color, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]" style={{ color }}>
                    {icon}
                  </span>
                  <div>
                    <p className="text-(--text-base) font-bold leading-none">{value}</p>
                    <p className="text-(--text-faint) text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Children cards */}
          <div className="xl:col-span-3">
            {children.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-[64px] text-(--text-faint) mb-4">
                  family_restroom
                </span>
                <p className="text-(--text-base) font-semibold text-lg mb-2">No children linked yet</p>
                <p className="text-(--text-muted) text-sm max-w-sm">
                  Ask your child&apos;s teacher or school administrator to send you an invite link
                  to connect your account.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {children.map((child) => (
                  <ChildCard key={child.student.uid} child={child} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent grades */}
            <div className="bg-(--bg-card) rounded-2xl p-5 border border-(--border-subtle)">
              <h3 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">
                  grading
                </span>
                Recent Grades
              </h3>
              {recentGrades.length > 0 ? (
                <div className="space-y-3">
                  {recentGrades.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background:
                            (s.score ?? 0) >= 70
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(239,68,68,0.15)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{ color: (s.score ?? 0) >= 70 ? "#10b981" : "#ef4444" }}
                        >
                          {(s.score ?? 0) >= 70 ? "check_circle" : "cancel"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-(--text-muted) text-xs font-medium">{s.childName}</p>
                        <p className="text-(--text-faint) text-[11px]">{timeAgo(s.submittedAt)}</p>
                      </div>
                      {s.score !== null && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: (s.score ?? 0) >= 70 ? "#10b981" : "#ef4444" }}
                        >
                          {s.score}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-(--text-faint) text-xs">No graded work yet.</p>
              )}
            </div>

            {/* Tips card */}
            <div className="bg-(--bg-card) rounded-2xl p-5 border border-[rgba(139,92,246,0.12)]">
              <h3 className="text-(--text-base) font-bold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b5cf6] text-[20px]">
                  lightbulb
                </span>
                Stay Involved
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: "chat",
                    text: "Ask your child what they learned in their latest course lesson.",
                  },
                  {
                    icon: "military_tech",
                    text: "Celebrate each badge — they represent real skills mastered.",
                  },
                  {
                    icon: "trending_up",
                    text: "Check progress weekly to spot any dip before it becomes a habit.",
                  },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-[#8b5cf6] shrink-0 mt-0.5">
                      {icon}
                    </span>
                    <p className="text-(--text-muted) text-xs leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
