"use client";

import { useState } from "react";
import { useCollection, useUpdateDoc } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import type { Course } from "@/lib/types";

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

function formatDate(ts: unknown) {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  if (!sec) return "—";
  return new Date(sec * 1000).toLocaleDateString("en-KE", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function ReviewerPublishedPage() {
  const { data: published, loading } = useCollection<Course>(
    "courses",
    [where("status", "==", "published"), orderBy("updatedAt", "desc")],
    true
  );
  const { update } = useUpdateDoc("courses");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  async function handleRevertToDraft(courseId: string) {
    setRevertingId(courseId);
    try {
      await update(courseId, { status: "draft", reviewedBy: null, reviewedAt: null, reviewFeedback: null });
    } finally {
      setRevertingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#f59e0b]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(245,158,11,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Published Courses</h1>
          <p className="text-slate-400 text-xs mt-0.5">{published.length} live on the platform</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.25)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[#10b981] text-xs font-semibold">{published.length} Published</span>
        </div>
      </header>

      <div className="px-8 py-8">
        {published.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#1a2e27] rounded-2xl border border-[rgba(245,158,11,0.08)]">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-3">library_books</span>
            <p className="text-white font-semibold mb-1">No published courses yet</p>
            <p className="text-slate-400 text-sm">Approved courses will appear here once published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {published.map((course) => {
              const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? "#64748b";
              return (
                <div
                  key={course.id}
                  className="bg-[#1a2e27] rounded-2xl border border-[rgba(16,185,129,0.1)] p-5 hover:border-[rgba(16,185,129,0.25)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                      style={{ background: `${course.color ?? "#13eca4"}18` }}
                    >
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981]">
                          Published
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{course.description}</p>
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
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">update</span>
                          Updated {formatDate((course as unknown as Record<string, unknown>).updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === course.id ? null : course.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                        title="View details"
                      >
                        <span className="material-symbols-outlined text-[18px]">{expandedId === course.id ? "expand_less" : "expand_more"}</span>
                      </button>
                      <button
                        onClick={() => handleRevertToDraft(course.id)}
                        disabled={revertingId === course.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-[rgba(245,158,11,0.1)] hover:bg-[rgba(245,158,11,0.2)] transition-colors disabled:opacity-50"
                        title="Revert to draft"
                      >
                        {revertingId === course.id ? "Reverting..." : "Revert to Draft"}
                      </button>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      <span className="text-[#10b981] text-xs font-semibold">Live</span>
                    </div>
                  </div>
                  {expandedId === course.id && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                      <p className="text-slate-300 text-sm">{course.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        {course.estimatedDuration && <span>Duration: {course.estimatedDuration}</span>}
                        {course.reviewedBy && <span>Reviewed by: {course.reviewedBy.slice(0, 12)}...</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
