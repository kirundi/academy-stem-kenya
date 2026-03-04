"use client";

import Link from "next/link";

export default function TeacherGradingPanelPage() {
  return (
    <div className="flex min-h-screen bg-[#0a1a16] text-(--text-base)">
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-(--border-subtle) bg-(--bg-page) flex items-center gap-3">
          <Link
            href="/school/teacher/grading"
            className="text-(--text-muted) hover:text-[#13eca4] transition-colors text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Grading
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(19,236,164,0.08)] border border-(--border-medium) flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[#13eca4] text-4xl">grading</span>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(19,236,164,0.1)] border border-(--border-accent) text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-sm">construction</span>
            Coming Soon
          </span>
          <h1 className="text-3xl font-black tracking-tight mb-3">Team Grading Panel</h1>
          <p className="text-(--text-muted) text-sm max-w-sm leading-relaxed mb-8">
            Grade collaborative team submissions, assign individual contributions, and publish
            results to all team members at once. This feature launches alongside Team Projects.
          </p>
          <div className="flex gap-3">
            <Link
              href="/school/teacher/grading"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#13eca4] text-[#0d1f1a] rounded-xl font-bold text-sm hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">grading</span>
              Individual Grading
            </Link>
            <Link
              href="/school/teacher/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 border border-(--border-subtle) text-(--text-muted) rounded-xl font-bold text-sm hover:border-(--border-accent) transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
