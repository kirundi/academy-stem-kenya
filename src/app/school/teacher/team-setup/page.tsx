"use client";

import Link from "next/link";

export default function TeacherTeamSetupPage() {
  return (
    <div className="flex min-h-screen bg-[#0a1a16] text-(--text-base)">
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-(--border-subtle) bg-(--bg-page) flex items-center gap-3">
          <Link
            href="/school/teacher/groups"
            className="text-(--text-muted) hover:text-primary-green transition-colors text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Groups
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-green/8 border border-(--border-medium) flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary-green text-4xl">groups</span>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-green/10 border border-(--border-accent) text-primary-green text-xs font-bold uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-sm">construction</span>
            Coming Soon
          </span>
          <h1 className="text-3xl font-black tracking-tight mb-3">Collaborative Project Setup</h1>
          <p className="text-(--text-muted) text-sm max-w-sm leading-relaxed mb-8">
            Create team projects, assign STEM roles, manage unassigned students, and set
            collaboration permissions — all from one place. This feature is under active
            development.
          </p>
          <div className="flex gap-3">
            <Link
              href="/school/teacher/groups"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-green text-[#0d1f1a] rounded-xl font-bold text-sm hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">groups</span>
              View Groups
            </Link>
            <Link
              href="/school/teacher/classroom"
              className="flex items-center gap-2 px-5 py-2.5 border border-(--border-subtle) text-(--text-muted) rounded-xl font-bold text-sm hover:border-(--border-accent) transition-colors"
            >
              Classroom
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
