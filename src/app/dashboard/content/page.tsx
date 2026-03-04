"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { useDeleteDoc } from "@/hooks/useFirestore";
import { exportToCsv } from "@/lib/csv-export";

const difficultyColor: Record<string, string> = {
  Beginner: "#13eca4",
  Intermediate: "#f59e0b",
  Advanced: "#ff4d4d",
};

export default function ContentManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { allCourses, loading } = useGlobalAdminData();
  const { remove } = useDeleteDoc("courses");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
          progress_activity
        </span>
      </div>
    );
  }

  const categories = [
    "All",
    ...Array.from(new Set(allCourses.map((c) => c.category).filter(Boolean))),
  ];

  const filtered = allCourses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Difficulty breakdown
  const diffBreakdown = ["Beginner", "Intermediate", "Advanced"].map((d) => ({
    level: d,
    count: allCourses.filter((c) => c.difficulty === d).length,
    color: difficultyColor[d],
  }));

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Content Management</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {allCourses.length} courses across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/courses/create/step1"
            className="flex items-center gap-2 bg-primary-green text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Course
          </Link>
        </div>
      </header>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-(--text-base) font-bold">Delete Course</h3>
                <p className="text-(--text-muted) text-xs">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-(--text-muted) text-sm mb-6">
              Are you sure you want to permanently delete &ldquo;{allCourses.find((c) => c.id === confirmDeleteId)?.title}&rdquo;?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-(--text-muted) border border-(--border) hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { remove(confirmDeleteId); setConfirmDeleteId(null); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-(--text-base) bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-(--bg-card) p-5 rounded-2xl border border-(--border-subtle)">
            <span className="text-(--text-muted) text-sm font-medium">Total Courses</span>
            <p className="text-(--text-base) text-3xl font-bold mt-2">{allCourses.length}</p>
          </div>
          {diffBreakdown.map((d) => (
            <div
              key={d.level}
              className="bg-(--bg-card) p-5 rounded-2xl border border-(--border-subtle)"
            >
              <span className="text-(--text-muted) text-sm font-medium">{d.level}</span>
              <p className="text-3xl font-bold mt-2" style={{ color: d.color }}>
                {d.count}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) text-[18px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg pl-10 pr-4 py-2 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary-green text-white"
                    : "bg-(--input-bg) text-(--text-muted) hover:text-(--text-base)"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-(--border-subtle)">
                <th className="px-6 py-3 text-left font-medium">Course</th>
                <th className="px-4 py-3 text-center font-medium">Category</th>
                <th className="px-4 py-3 text-center font-medium">Difficulty</th>
                <th className="px-4 py-3 text-center font-medium">Lessons</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${c.color ?? "#13eca4"}18` }}
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ color: c.color ?? "#13eca4" }}
                          >
                            {c.icon ?? "auto_stories"}
                          </span>
                        </div>
                        <div>
                          <p className="text-(--text-base) font-semibold">{c.title}</p>
                          <p className="text-slate-500 text-xs line-clamp-1">
                            {c.description ?? "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-(--text-muted) text-xs">
                      {c.category ?? "--"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          color: difficultyColor[c.difficulty] ?? "#13eca4",
                          background: `${difficultyColor[c.difficulty] ?? "#13eca4"}18`,
                        }}
                      >
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-(--text-base) font-semibold">
                      {c.totalLessons ?? 0}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/courses/create/step1?courseId=${c.id}`)
                        }
                        className="text-(--text-muted) hover:text-primary-green transition-colors text-xs font-semibold mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c.id)}
                        className="text-(--text-muted) hover:text-red-400 transition-colors text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-(--border-subtle)">
            <p className="text-slate-500 text-xs">
              Showing {filtered.length} of {allCourses.length} courses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
