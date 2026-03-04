"use client";

import { useParentData } from "@/hooks/useParentData";
import type { ChildProgress, ChildEnrollment } from "@/hooks/useParentData";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${clamped}%`,
            background:
              clamped >= 100
                ? "linear-gradient(90deg, #10b981, #0dd494)"
                : clamped >= 50
                  ? "linear-gradient(90deg, #8b5cf6, #6d28d9)"
                  : "linear-gradient(90deg, #f59e0b, #d97706)",
          }}
        />
      </div>
      <span className="text-xs font-bold text-white w-10 text-right">{clamped}%</span>
    </div>
  );
}

function statusBadge(progress: number) {
  if (progress >= 100) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] text-[10px] font-bold uppercase tracking-wide">
        Completed
      </span>
    );
  }
  if (progress > 0) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] text-[10px] font-bold uppercase tracking-wide">
        In Progress
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-slate-400 text-[10px] font-bold uppercase tracking-wide">
      Not Started
    </span>
  );
}

function ChildReportCard({ child }: { child: ChildProgress }) {
  const { student, enrollments } = child;
  const initials = getInitials(student.displayName);

  const overallProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

  return (
    <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(139,92,246,0.12)] overflow-hidden">
      {/* Child header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-[rgba(139,92,246,0.08)] bg-[rgba(139,92,246,0.04)]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base">{student.displayName}</h3>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {student.grade && (
              <span className="text-[#8b5cf6] text-xs font-semibold">Grade {student.grade}</span>
            )}
            <span className="text-slate-400 text-xs">
              {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
            </span>
            <span className="text-slate-400 text-xs">Overall: {overallProgress}%</span>
          </div>
        </div>
        <div className="shrink-0 w-14">
          <ProgressBar value={overallProgress} />
        </div>
      </div>

      {/* Enrollments table */}
      {enrollments.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-slate-600 mb-2 block">
            school
          </span>
          <p className="text-slate-400 text-sm">No courses enrolled yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-[rgba(139,92,246,0.06)]">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="col-span-5">Course</div>
            <div className="col-span-4">Progress</div>
            <div className="col-span-2">Lessons</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          {enrollments.map((enrollment: ChildEnrollment) => (
            <div
              key={enrollment.id}
              className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-[rgba(139,92,246,0.03)] transition-colors"
            >
              {/* Course name */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[rgba(139,92,246,0.12)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#8b5cf6] text-[16px]">
                    auto_stories
                  </span>
                </div>
                <p className="text-slate-200 text-sm font-medium truncate">
                  {enrollment.courseTitle}
                </p>
              </div>

              {/* Progress bar */}
              <div className="col-span-4">
                <ProgressBar value={enrollment.progress} />
              </div>

              {/* Lessons completed */}
              <div className="col-span-2">
                <span className="text-slate-400 text-xs">
                  {enrollment.completedLessons} done
                </span>
              </div>

              {/* Status badge */}
              <div className="col-span-1 flex justify-end">{statusBadge(enrollment.progress)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParentReportsPage() {
  const { children, loading, error } = useParentData();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10221c] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#8b5cf6]">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#10221c] flex items-center justify-center px-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 mb-3 block">
            error
          </span>
          <p className="text-red-400 font-semibold mb-1">Something went wrong</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-[rgba(139,92,246,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8b5cf6] text-[22px]">bar_chart</span>
            Progress Reports
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Track your children&apos;s learning journey
          </p>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Summary cards */}
        {children.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Children",
                value: children.length,
                icon: "family_restroom",
                color: "#8b5cf6",
              },
              {
                label: "Total Courses",
                value: children.reduce((s, c) => s + c.enrollments.length, 0),
                icon: "school",
                color: "#13eca4",
              },
              {
                label: "Completed",
                value: children.reduce(
                  (s, c) => s + c.enrollments.filter((e) => e.progress >= 100).length,
                  0
                ),
                icon: "check_circle",
                color: "#10b981",
              },
              {
                label: "In Progress",
                value: children.reduce(
                  (s, c) =>
                    s + c.enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
                  0
                ),
                icon: "play_circle",
                color: "#f59e0b",
              },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-5 bg-[#1a2e27] rounded-2xl border border-[rgba(139,92,246,0.08)]"
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
                  <p className="text-white font-bold text-2xl leading-none">{value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Per-child report cards */}
        {children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#1a2e27] rounded-2xl border border-[rgba(139,92,246,0.08)]">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">
              bar_chart
            </span>
            <p className="text-white font-semibold text-lg mb-2">No children linked yet</p>
            <p className="text-slate-400 text-sm max-w-sm text-center">
              Ask your child&apos;s teacher or school administrator to connect your account.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {children.map((child) => (
              <ChildReportCard key={child.student.uid} child={child} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
