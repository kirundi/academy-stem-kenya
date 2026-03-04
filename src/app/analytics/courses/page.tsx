"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

const STATUS_CONFIG = {
  published: { label: "Published", color: "#10b981" },
  pending_review: { label: "Pending Review", color: "#f59e0b" },
  draft: { label: "Draft", color: "#64748b" },
} as const;

type CourseStatus = keyof typeof STATUS_CONFIG;

function getStatus(course: { status?: string }): CourseStatus {
  if (course.status === "pending_review") return "pending_review";
  if (course.status === "draft") return "draft";
  return "published";
}

export default function AnalyticsCoursesPage() {
  const { allCourses, loading, error } = useGlobalAdminData();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#a855f7]">progress_activity</span>
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

  const published = allCourses.filter((c) => getStatus(c) === "published");
  const pending = allCourses.filter((c) => getStatus(c) === "pending_review");
  const drafts = allCourses.filter((c) => getStatus(c) === "draft");

  // Category distribution
  const categoryCounts = allCourses.reduce((acc: Record<string, number>, c) => {
    const cat = c.category ?? "Uncategorized";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const filtered = allCourses.filter((c) => {
    const matchesStatus = filterStatus === "all" || getStatus(c) === filterStatus;
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Courses Analytics</h1>
          <p className="text-slate-400 text-xs mt-0.5">{allCourses.length} total · {published.length} published</p>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Courses", value: allCourses.length, icon: "library_books", color: "#a855f7" },
            { label: "Published", value: published.length, icon: "check_circle", color: "#10b981" },
            { label: "Pending Review", value: pending.length, icon: "pending", color: "#f59e0b" },
            { label: "Drafts", value: drafts.length, icon: "edit_note", color: "#64748b" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="flex items-center gap-4 p-5 bg-[#1a2e27] rounded-2xl border border-[rgba(168,85,247,0.08)]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
              </div>
              <div>
                <p className="text-white font-bold text-2xl leading-none">{value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {categoryEntries.length > 0 && (
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(168,85,247,0.08)] p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[20px]">category</span>
              Top Categories
            </h2>
            <div className="space-y-3">
              {categoryEntries.map(([cat, count]) => {
                const pct = allCourses.length > 0 ? (count / allCourses.length) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-4">
                    <div className="w-36 text-xs text-slate-400 text-right shrink-0 truncate">{cat}</div>
                    <div className="flex-1 h-5 bg-[#102022] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#a855f7] transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                    </div>
                    <div className="w-10 text-right shrink-0">
                      <span className="text-white font-bold text-sm">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course list */}
        <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(168,85,247,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(168,85,247,0.08)] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#a855f7] text-[20px]">table_chart</span>
              <h2 className="text-white font-bold">All Courses</h2>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses…"
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-8 pr-3 py-1.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[rgba(168,85,247,0.4)]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[rgba(255,255,255,0.03)]">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-slate-600 mb-2 block">library_books</span>
                <p className="text-slate-400 text-sm">No courses match your filter.</p>
              </div>
            ) : (
              filtered.slice(0, 50).map((course) => {
                const status = getStatus(course);
                const statusConfig = STATUS_CONFIG[status];
                const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? "#64748b";
                return (
                  <div key={course.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[rgba(168,85,247,0.03)] transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: `${course.color ?? "#13eca4"}18` }}>
                      {course.icon ?? "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-500 text-xs">{course.category}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-medium" style={{ color: diffColor }}>{course.difficulty}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 text-xs">{course.totalLessons} lessons</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: `${statusConfig.color}18`, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {filtered.length > 50 && (
            <p className="text-slate-500 text-xs text-center py-3">Showing 50 of {filtered.length} courses</p>
          )}
        </div>
      </div>
    </div>
  );
}
