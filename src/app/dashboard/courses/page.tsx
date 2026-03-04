"use client";

import { useState } from "react";
import Link from "next/link";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import type { Course } from "@/lib/types";

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

function getStatus(course: { status?: string }): CourseStatus {
  if (course.status === "pending_review") return "pending_review";
  if (course.status === "draft") return "draft";
  return "published";
}

export default function AdminCoursesPage() {
  const { allCourses, loading, error } = useGlobalAdminData();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
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

  const courses = allCourses as (Course & { id: string })[];

  const published = courses.filter((c) => getStatus(c) === "published");
  const pending = courses.filter((c) => getStatus(c) === "pending_review");
  const drafts = courses.filter((c) => getStatus(c) === "draft");

  const filtered = courses.filter((c) => {
    const matchesStatus = filterStatus === "all" || getStatus(c) === filterStatus;
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Courses</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {courses.length} total · {published.length} published
          </p>
        </div>
        <Link
          href="/dashboard/courses/create/step1"
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-(--text-base) transition-opacity hover:opacity-90"
          style={{ background: "#13eca4", color: "#0d1f1a" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Course
        </Link>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Published", value: published.length, color: "#10b981", icon: "check_circle" },
            {
              label: "Pending Review",
              value: pending.length,
              color: "#f59e0b",
              icon: "pending",
            },
            { label: "Drafts", value: drafts.length, color: "#64748b", icon: "edit_note" },
          ].map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] cursor-pointer hover:border-[rgba(19,236,164,0.2)] transition-colors"
              onClick={() =>
                setFilterStatus(
                  Object.entries(STATUS_CONFIG).find(([, v]) => v.label === label)?.[0] ?? "all"
                )
              }
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>
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

        {/* Filter + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or category…"
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl pl-9 pr-4 py-2.5 text-(--text-base) text-sm placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "published", "pending_review", "draft"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors border"
                style={
                  filterStatus === s
                    ? { background: "#13eca4", color: "#0d1f1a", borderColor: "#13eca4" }
                    : {
                        background: "transparent",
                        color: "#94a3b8",
                        borderColor: "rgba(255,255,255,0.08)",
                      }
                }
              >
                {s === "all" ? "All" : STATUS_CONFIG[s as CourseStatus]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {/* Course list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)]">
              <span className="material-symbols-outlined text-[56px] text-slate-600 mb-3">
                library_books
              </span>
              <p className="text-(--text-base) font-semibold mb-1">No courses found</p>
              <p className="text-(--text-muted) text-sm mb-4">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters."
                  : "No courses have been created yet."}
              </p>
              <Link
                href="/dashboard/courses/create/step1"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
                style={{ background: "#13eca4", color: "#0d1f1a" }}
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create Course
              </Link>
            </div>
          ) : (
            filtered.map((course) => {
              const status = getStatus(course);
              const statusConfig = STATUS_CONFIG[status];
              const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? "#64748b";

              return (
                <div
                  key={course.id}
                  className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] p-5 flex items-center gap-4 hover:border-[rgba(19,236,164,0.2)] transition-colors group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                    style={{ background: `${course.color ?? "#13eca4"}18` }}
                  >
                    {course.icon ?? "📚"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-(--text-base) font-bold text-sm">{course.title}</h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${diffColor}18`, color: diffColor }}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                    <p className="text-(--text-muted) text-xs mt-0.5 line-clamp-1">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span>{course.category}</span>
                      <span>·</span>
                      <span>{course.totalLessons} lessons</span>
                      {course.targetGrade && (
                        <>
                          <span>·</span>
                          <span>Grade {course.targetGrade}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{
                        background: `${statusConfig.color}18`,
                        color: statusConfig.color,
                      }}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {statusConfig.icon}
                      </span>
                      {statusConfig.label}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/courses/create/step1?edit=${course.id}`}
                        className="p-2 rounded-lg text-(--text-muted) hover:text-primary-green hover:bg-primary-green/8 transition-colors"
                        title="Edit course"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <Link
                        href={`/dashboard/courses/create/preview?id=${course.id}`}
                        className="p-2 rounded-lg text-(--text-muted) hover:text-(--text-base) hover:bg-(--bg-elevated) transition-colors"
                        title="Preview"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
