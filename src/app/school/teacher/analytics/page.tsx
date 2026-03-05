"use client";

import { useState } from "react";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Enrollment, Submission, AppUser } from "@/lib/types";

export default function TeacherAnalyticsPage() {
  const { classrooms, loading: teacherLoading } = useTeacherData();
  const [activeClassroom, setActiveClassroom] = useState(0);

  const cls = classrooms[activeClassroom] ?? null;
  const classroomIds = classrooms.map((c) => c.id);

  // Fetch enrollments for all classrooms
  const { data: allEnrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
    "enrollments",
    classroomIds.length > 0 ? [where("classroomId", "in", classroomIds.slice(0, 10))] : [],
    classroomIds.length > 0
  );

  // Fetch submissions for all classrooms
  const { data: allSubmissions, loading: submissionsLoading } = useCollection<Submission>(
    "submissions",
    classroomIds.length > 0 ? [where("classroomId", "in", classroomIds.slice(0, 10))] : [],
    classroomIds.length > 0
  );

  // Get student IDs for the selected classroom
  const clsEnrollments = cls ? allEnrollments.filter((e) => e.classroomId === cls.id) : [];
  const clsStudentIds = Array.from(new Set(clsEnrollments.map((e) => e.studentId)));

  // Fetch student user data for selected classroom
  const { data: studentUsers } = useCollection<AppUser>(
    "users",
    clsStudentIds.length > 0 ? [where("__name__", "in", clsStudentIds.slice(0, 10))] : [],
    clsStudentIds.length > 0
  );

  const loading = teacherLoading || enrollmentsLoading || submissionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="min-h-screen bg-(--bg-page)">
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Classroom Analytics</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">Engagement & performance insights</p>
          </div>
        </header>
        <div className="flex items-center justify-center h-64 text-(--text-faint)">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] mb-4 block">bar_chart</span>
            <p>No classrooms yet. Create one to see analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  // Compute stats for selected classroom
  const clsSubmissions = cls ? allSubmissions.filter((s) => s.classroomId === cls.id) : [];
  const totalStudents = clsStudentIds.length;
  const avgMastery =
    clsEnrollments.length > 0
      ? Math.round(
          clsEnrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) / clsEnrollments.length
        )
      : 0;
  const totalSubmissions = clsSubmissions.length;

  // Compute weekly activity from submission dates
  const now = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyActivity = dayNames.map((day, dayIdx) => {
    const count = clsSubmissions.filter((s) => {
      if (!(s.submittedAt instanceof Date)) return false;
      const diffDays = Math.floor(
        (now.getTime() - s.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays < 7 && s.submittedAt.getDay() === dayIdx;
    }).length;
    return { day, submissions: count };
  });
  const maxSubmissions = Math.max(...weeklyActivity.map((d) => d.submissions), 1);

  // Mastery distribution
  const excellent = clsEnrollments.filter((e) => e.progress >= 90).length;
  const proficient = clsEnrollments.filter((e) => e.progress >= 75 && e.progress < 90).length;
  const developing = clsEnrollments.filter((e) => e.progress >= 60 && e.progress < 75).length;
  const needsSupport = clsEnrollments.filter((e) => e.progress < 60).length;
  const totalForDist = clsEnrollments.length || 1;
  const masteryDist = [
    {
      label: "Excellent (90-100%)",
      pct: Math.round((excellent / totalForDist) * 100),
      count: excellent,
      color: "var(--primary-green)",
    },
    {
      label: "Proficient (75-89%)",
      pct: Math.round((proficient / totalForDist) * 100),
      count: proficient,
      color: "#3b82f6",
    },
    {
      label: "Developing (60-74%)",
      pct: Math.round((developing / totalForDist) * 100),
      count: developing,
      color: "#f59e0b",
    },
    {
      label: "Needs Support (<60%)",
      pct: Math.round((needsSupport / totalForDist) * 100),
      count: needsSupport,
      color: "var(--accent-red)",
    },
  ];

  // Top performers across all classrooms
  const studentScores = new Map<string, { progress: number; studentId: string }>();
  allEnrollments.forEach((e) => {
    const existing = studentScores.get(e.studentId);
    if (!existing || e.progress > existing.progress) {
      studentScores.set(e.studentId, { progress: e.progress, studentId: e.studentId });
    }
  });
  const topStudents = Array.from(studentScores.values())
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)
    .map((s) => {
      const user = studentUsers.find(
        (u) => (u as AppUser & { id: string }).id === s.studentId || u.uid === s.studentId
      );
      const classroom = classrooms.find((c) =>
        allEnrollments.some((e) => e.studentId === s.studentId && e.classroomId === c.id)
      );
      return {
        name: user?.displayName ?? s.studentId,
        classroom: classroom?.name ?? "Unknown",
        score: s.progress,
        badges: user?.badges?.length ?? 0,
      };
    });

  // Active this week (students with submissions in last 7 days)
  const activeThisWeek = new Set(
    clsSubmissions
      .filter((s) => {
        if (!(s.submittedAt instanceof Date)) return false;
        const diffDays = Math.floor(
          (now.getTime() - s.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays < 7;
      })
      .map((s) => s.studentId)
  ).size;

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Classroom Analytics</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Engagement & performance insights</p>
        </div>
        <button className="flex items-center gap-1.5 border border-(--border-medium) text-(--text-muted) text-sm font-semibold px-4 py-2 rounded-lg hover:border-(--primary-green) hover:text-(--primary-green) transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </header>

      <div className="px-8 py-8">
        {/* Classroom Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {classrooms.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveClassroom(i)}
              className={`shrink-0 px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                activeClassroom === i
                  ? "bg-[rgba(45,212,191,0.1)] border-(--border-strong) text-(--primary-green)"
                  : "bg-[rgba(255,255,255,0.03)] border-(--border-subtle) text-(--text-muted) hover:text-(--text-base)"
              }`}
            >
              {c.name}
              <span className="ml-2 text-xs opacity-60 font-mono">{c.joinCode}</span>
            </button>
          ))}
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "group", label: "Total Students", value: totalStudents, color: "var(--primary-green)" },
            {
              icon: "trending_up",
              label: "Avg. Mastery Score",
              value: `${avgMastery}%`,
              color: "#3b82f6",
            },
            {
              icon: "assignment_turned_in",
              label: "Submissions",
              value: totalSubmissions,
              color: "#f59e0b",
            },
            { icon: "person", label: "Active This Week", value: activeThisWeek, color: "#8b5cf6" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-(--bg-card) rounded-2xl p-5 border border-(--border-subtle)"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}18` }}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: s.color }}>
                  {s.icon}
                </span>
              </div>
              <p className="text-(--text-muted) text-xs font-medium">{s.label}</p>
              <p className="text-(--text-base) text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Weekly Activity Chart */}
          <div className="xl:col-span-2 bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-(--text-base) font-bold">Weekly Submission Activity</h2>
              <span className="text-(--text-faint) text-xs">Last 7 days</span>
            </div>
            <div className="flex items-end gap-3 h-36">
              {weeklyActivity.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-(--primary-green) text-xs font-bold">{d.submissions}</span>
                  <div
                    className="w-full rounded-t-lg transition-all hover:opacity-80 relative group"
                    style={{
                      height: `${(d.submissions / maxSubmissions) * 100}%`,
                      minHeight: "4px",
                      background: "linear-gradient(180deg, #2dd4bf, #14b8a6)",
                    }}
                  ></div>
                  <span className="text-(--text-faint) text-xs">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mastery Distribution */}
          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
            <h2 className="text-(--text-base) font-bold mb-5">Mastery Distribution</h2>
            <div className="space-y-4">
              {masteryDist.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-(--text-muted)">{m.label}</span>
                    <span className="font-bold" style={{ color: m.color }}>
                      {m.count} student{m.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 bg-(--input-bg) rounded-full">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ background: m.color, width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(45,212,191,0.06)]">
            <h2 className="text-(--text-base) font-bold">Top Performers</h2>
          </div>
          {topStudents.length === 0 ? (
            <div className="px-6 py-12 text-center text-(--text-faint) text-sm">
              No student data available yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-(--text-faint) text-xs border-b border-(--border-subtle)">
                  <th className="px-6 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Classroom</th>
                  <th className="px-4 py-3 text-center font-medium">Score</th>
                  <th className="px-4 py-3 text-center font-medium">Badges</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s, i) => (
                  <tr
                    key={s.name + i}
                    className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(45,212,191,0.02)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          i === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : i === 1
                              ? "bg-(--text-faint) text-(--text-base)"
                              : i === 2
                                ? "bg-amber-700 text-(--text-base)"
                                : "text-(--text-faint)"
                        }`}
                      >
                        {i < 3 ? "\u2605" : i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[rgba(45,212,191,0.1)] flex items-center justify-center text-(--primary-green) font-bold text-xs">
                          {s.name[0]}
                        </div>
                        <span className="text-(--text-base) font-semibold">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-(--text-muted) text-xs">{s.classroom}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-(--primary-green) font-bold">{s.score}%</span>
                    </td>
                    <td className="px-4 py-4 text-center text-(--text-base) font-semibold">{s.badges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
