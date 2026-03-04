"use client";

import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import type { Course } from "@/lib/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

const STATUS_CONFIG = {
  published: { label: "Published", color: "#10b981", icon: "check_circle" },
  pending_review: { label: "Pending Review", color: "#f59e0b", icon: "pending" },
  draft: { label: "Draft", color: "#64748b", icon: "edit_note" },
} as const;

type CourseStatus = keyof typeof STATUS_CONFIG;

export default function EditorDashboard() {
  const { appUser } = useAuthContext();

  // Editors see all courses (platform-wide)
  const { data: courses, loading } = useCollection<Course>("courses", [], true);

  const displayName = appUser?.displayName ?? "Editor";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#ec4899]">
          progress_activity
        </span>
      </div>
    );
  }

  const published = courses.filter((c) => c.status === "published" || !c.status);
  const pendingReview = courses.filter((c) => c.status === "pending_review");
  const drafts = courses.filter((c) => c.status === "draft");

  const getStatus = (c: Course): CourseStatus => {
    if (c.status === "pending_review") return "pending_review";
    if (c.status === "draft") return "draft";
    return "published";
  };

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(236,72,153,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Content Dashboard</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {courses.length} total courses · {pendingReview.length} pending review
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/editor/courses/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ec4899] text-(--text-base) text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Course
          </Link>
          <div className="w-9 h-9 rounded-full bg-[rgba(236,72,153,0.15)] flex items-center justify-center text-[#ec4899] font-bold text-sm">
            {getInitials(displayName)}
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Courses", value: courses.length, icon: "school", color: "#ec4899" },
            { label: "Published", value: published.length, icon: "check_circle", color: "#10b981" },
            { label: "Pending Review", value: pendingReview.length, icon: "pending", color: "#f59e0b" },
            { label: "Drafts", value: drafts.length, icon: "edit_note", color: "#64748b" },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(236,72,153,0.08)]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
              </div>
              <div>
                <p className="text-(--text-base) font-bold text-2xl leading-none">{value}</p>
                <p className="text-(--text-muted) text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick action card */}
        <div className="relative bg-(--bg-card) rounded-2xl border border-[rgba(236,72,153,0.15)] p-6 mb-8 overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 border-2 border-[rgba(236,72,153,0.08)] rounded-full" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[#ec4899] text-sm font-semibold mb-1 uppercase tracking-widest">Content Editor</p>
              <h2 className="text-(--text-base) font-bold text-xl mb-1">Welcome, {displayName.split(" ")[0]}</h2>
              <p className="text-(--text-muted) text-sm max-w-md">
                You can create and manage platform-wide courses and challenges. Submit courses for review when they&apos;re ready to publish.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/editor/courses/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899] text-(--text-base) text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Course
              </Link>
              <Link
                href="/editor/challenges"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(236,72,153,0.1)] text-[#ec4899] text-sm font-semibold hover:bg-[rgba(236,72,153,0.2)] transition-colors border border-[rgba(236,72,153,0.2)]"
              >
                <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                Challenges
              </Link>
            </div>
          </div>
        </div>

        {/* Courses table */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(236,72,153,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <h2 className="text-(--text-base) font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ec4899] text-[18px]">school</span>
              All Courses
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-[64px] text-(--text-faint) mb-3">school</span>
              <p className="text-(--text-base) font-semibold mb-1">No courses yet</p>
              <p className="text-(--text-muted) text-sm mb-4">Create your first course to get started.</p>
              <Link
                href="/editor/courses/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899] text-(--text-base) text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Course
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {courses.map((course) => {
                const statusKey = getStatus(course);
                const status = STATUS_CONFIG[statusKey];
                const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? "#64748b";

                return (
                  <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: `${course.color ?? "#ec4899"}18` }}
                    >
                      {course.icon ?? "📚"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-(--text-base) font-medium text-sm truncate">{course.title}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: `${diffColor}18`, color: diffColor }}
                        >
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-(--text-faint)">
                        <span>{course.category}</span>
                        <span>·</span>
                        <span>{course.totalLessons} lessons</span>
                        {course.schoolId === null && (
                          <>
                            <span>·</span>
                            <span className="text-[#ec4899]">Platform-wide</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                      style={{ background: `${status.color}18`, color: status.color }}
                    >
                      <span className="material-symbols-outlined text-[11px]">{status.icon}</span>
                      {status.label}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/editor/courses/${course.id}`}
                        className="p-2 rounded-lg bg-(--glass-bg) hover:bg-[rgba(236,72,153,0.1)] text-(--text-muted) hover:text-[#ec4899] transition-all"
                        title="Edit course"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </Link>
                      <Link
                        href={`/editor/courses/${course.id}/lessons`}
                        className="p-2 rounded-lg bg-(--glass-bg) hover:bg-[rgba(236,72,153,0.1)] text-(--text-muted) hover:text-[#ec4899] transition-all"
                        title="Manage lessons"
                      >
                        <span className="material-symbols-outlined text-[16px]">list</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
