"use client";

import { useState } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { orderBy } from "firebase/firestore";
import type { Course } from "@/lib/types";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner:     "#10b981",
  Intermediate: "#f59e0b",
  Advanced:     "#ef4444",
};

const STATUS_CONFIG = {
  published:      { label: "Published",      color: "#10b981" },
  pending_review: { label: "Pending Review", color: "#f59e0b" },
  draft:          { label: "Draft",          color: "#64748b" },
} as const;

type CourseStatus = keyof typeof STATUS_CONFIG;

function getStatus(course: { status?: string }): CourseStatus {
  if (course.status === "pending_review") return "pending_review";
  if (course.status === "draft") return "draft";
  return "published";
}

export default function ObserverCoursesPage() {
  const { data: courses, loading } = useCollection<Course>(
    "courses",
    [orderBy("createdAt", "desc")],
    true
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Only show published courses to observer
  const publishedCourses = courses.filter((c) => getStatus(c) === "published");

  const categoryCounts = publishedCourses.reduce((acc: Record<string, number>, c) => {
    const cat = c.category ?? "Uncategorized";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const filtered = publishedCourses.filter((c) => {
    const matchesDifficulty =
      difficultyFilter === "all" || c.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "all" || getStatus(c) === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q);
    return matchesDifficulty && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#06b6d4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(6,182,212,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Course Library</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            Platform courses available to your schools
          </p>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Courses", value: publishedCourses.length, icon: "library_books", color: "#06b6d4" },
            { label: "Categories", value: Object.keys(categoryCounts).length, icon: "category", color: "#a855f7" },
            { label: "Beginner", value: publishedCourses.filter((c) => c.difficulty === "Beginner").length, icon: "school", color: "#10b981" },
            { label: "Advanced", value: publishedCourses.filter((c) => c.difficulty === "Advanced").length, icon: "workspace_premium", color: "#ef4444" },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(6,182,212,0.08)]"
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
                <p className="text-(--text-base) font-bold text-2xl leading-none">{value}</p>
                <p className="text-(--text-muted) text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Course list */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(6,182,212,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(6,182,212,0.08)] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">
                table_chart
              </span>
              <h2 className="text-(--text-base) font-bold">Published Courses</h2>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses…"
                  className="bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg pl-8 pr-3 py-1.5 text-(--text-base) text-xs placeholder:text-(--text-faint) focus:outline-none focus:border-[rgba(6,182,212,0.4)]"
                />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg px-3 py-1.5 text-(--text-base) text-xs focus:outline-none"
              >
                <option value="all">All levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[rgba(255,255,255,0.03)]">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-slate-600 mb-2 block">
                  library_books
                </span>
                <p className="text-(--text-muted) text-sm">No courses match your search.</p>
              </div>
            ) : (
              filtered.map((course) => {
                const status = getStatus(course);
                const statusConfig = STATUS_CONFIG[status];
                const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? "#64748b";
                return (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[rgba(6,182,212,0.03)] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: `${course.color ?? "#06b6d4"}18` }}
                    >
                      {course.icon ?? "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-(--text-base) font-medium text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-500 text-xs">{course.category}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-medium" style={{ color: diffColor }}>
                          {course.difficulty}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 text-xs">{course.totalLessons} lessons</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        background: `${statusConfig.color}18`,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
