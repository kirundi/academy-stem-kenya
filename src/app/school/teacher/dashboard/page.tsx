"use client";

import StatCard from "@/components/StatCard";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Enrollment, Submission } from "@/lib/types";

export default function TeacherDashboard() {
  const { appUser } = useAuthContext();
  const { classrooms, pendingSubmissions, loading } = useTeacherData();

  // Get all submissions (including graded) for recent display
  const classroomIds = classrooms.map((c) => c.id);
  const { data: recentSubmissions } = useCollection<Submission>(
    "submissions",
    classroomIds.length > 0 ? [where("classroomId", "in", classroomIds.slice(0, 10))] : [],
    classroomIds.length > 0
  );

  // Get enrollments to count active students
  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    classroomIds.length > 0 ? [where("classroomId", "in", classroomIds.slice(0, 10))] : [],
    classroomIds.length > 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  const displayName = appUser?.displayName ?? "Teacher";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const uniqueStudentIds = new Set(enrollments.map((e) => e.studentId));
  const totalStudents = uniqueStudentIds.size;
  const pendingCount = pendingSubmissions.length;
  const avgProgress =
    classrooms.length > 0
      ? Math.round(classrooms.reduce((sum, c) => sum + (c.avgProgress ?? 0), 0) / classrooms.length)
      : 0;

  // Sort recent submissions by date desc and take top 4
  const sortedRecent = [...recentSubmissions]
    .sort((a, b) => {
      const aTime = a.submittedAt instanceof Date ? a.submittedAt.getTime() : 0;
      const bTime = b.submittedAt instanceof Date ? b.submittedAt.getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 4);

  // Color palette for classroom cards
  const classColors = ["#13eca4", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Dashboard</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Welcome back, {displayName} · {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:bg-[rgba(255,255,255,0.06)] rounded-lg">
            <span className="material-symbols-outlined">notifications</span>
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#10221c]" />
            )}
          </button>
          <Link
            href="/school/teacher/classroom"
            className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Classroom
          </Link>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Page headline */}
        <div>
          <h2 className="text-3xl font-black text-white">Welcome back, {displayName}!</h2>
          <p className="text-slate-400 mt-1">
            You have{" "}
            <span className="text-orange-400 font-semibold">
              {pendingCount} pending submission{pendingCount !== 1 ? "s" : ""}
            </span>{" "}
            across {classrooms.length} classroom{classrooms.length !== 1 ? "s" : ""} · {today}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon="group"
            label="Active Students"
            value={totalStudents}
            change={totalStudents > 0 ? "Enrolled" : "No students yet"}
            changeType="positive"
            iconColor="#3b82f6"
          />
          <StatCard
            icon="upload_file"
            label="Pending Submissions"
            value={pendingCount}
            change={pendingCount > 0 ? "Needs Review" : "All caught up"}
            changeType={pendingCount > 0 ? "negative" : "positive"}
            iconColor="#ef4444"
          />
          <StatCard
            icon="analytics"
            label="Avg. Class Progress"
            value={`${avgProgress}%`}
            change={classrooms.length > 0 ? `${classrooms.length} classrooms` : "No classrooms"}
            changeType="positive"
            iconColor="#13eca4"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Classrooms 2x2 */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-xl">Active Classrooms</h3>
              <Link
                href="/school/teacher/classroom"
                className="text-[#13eca4] text-sm font-semibold hover:underline flex items-center gap-1"
              >
                Manage all
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {classrooms.slice(0, 3).map((cls, idx) => {
                const color = classColors[idx % classColors.length];
                return (
                  <div
                    key={cls.id}
                    className="bg-[#1a2e27] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden"
                  >
                    <div className="p-5">
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color }}
                      >
                        {cls.subject}
                      </span>
                      <h4 className="text-white font-bold text-base mt-0.5 mb-4">{cls.name}</h4>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-slate-400">Class Progress</span>
                        <span className="text-white font-semibold">{cls.avgProgress ?? 0}%</span>
                      </div>
                      <div className="h-1.5 bg-[rgba(255,255,255,0.07)] rounded-full mb-4">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cls.avgProgress ?? 0}%`, backgroundColor: color }}
                        />
                      </div>
                      <Link
                        href="/school/teacher/grading"
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[rgba(255,255,255,0.06)] text-slate-300 rounded-xl text-sm font-semibold hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">grading</span>
                        Grade Submissions
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Create New */}
              <Link
                href="/school/teacher/classroom"
                className="bg-transparent border-2 border-dashed border-[rgba(19,236,164,0.18)] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.03)] transition-all min-h-45 group"
              >
                <div className="w-12 h-12 rounded-full bg-[rgba(19,236,164,0.08)] flex items-center justify-center group-hover:bg-[rgba(19,236,164,0.15)] transition-colors">
                  <span className="material-symbols-outlined text-[#13eca4] text-[24px]">add</span>
                </div>
                <p className="text-slate-400 text-sm font-semibold group-hover:text-[#13eca4] transition-colors">
                  Create New Classroom
                </p>
              </Link>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Recent Submissions */}
            <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <h3 className="text-white font-bold">Recent Submissions</h3>
                <Link
                  href="/school/teacher/grading"
                  className="text-[#13eca4] text-xs font-semibold hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {sortedRecent.length === 0 && (
                  <div className="px-5 py-8 text-center text-slate-500 text-sm">
                    No submissions yet.
                  </div>
                )}
                {sortedRecent.map((sub) => {
                  const studentInitials = (sub.studentId ?? "?").slice(0, 2).toUpperCase();
                  const timeAgo =
                    sub.submittedAt instanceof Date ? formatTimeAgo(sub.submittedAt) : "Recently";
                  return (
                    <div
                      key={sub.id}
                      className="px-5 py-3.5 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-xs font-bold text-[#13eca4]">
                        {studentInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {sub.content || "Submission"}
                        </p>
                        <p className="text-slate-500 text-xs">{sub.courseId}</p>
                      </div>
                      <div className="text-right">
                        {sub.grade ? (
                          <span className="text-[#13eca4] text-sm font-bold">{sub.grade}</span>
                        ) : (
                          <span className="text-xs bg-[rgba(255,165,0,0.15)] text-orange-400 px-2 py-0.5 rounded font-medium">
                            Pending
                          </span>
                        )}
                        <p className="text-slate-600 text-xs">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-5">
              <h3 className="text-white font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  {
                    icon: "add",
                    label: "Create New Classroom",
                    href: "/school/teacher/classroom",
                    color: "#13eca4",
                  },
                  {
                    icon: "menu_book",
                    label: "Browse Course Library",
                    href: "/school/teacher/courses",
                    color: "#8b5cf6",
                  },
                  {
                    icon: "insights",
                    label: "Student Progress Report",
                    href: "/school/teacher/analytics",
                    color: "#3b82f6",
                  },
                  { icon: "sync", label: "Sync Google Classroom", href: "/school/teacher/classroom", color: "#f59e0b" },
                ].map(({ icon, label, href, color }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-transparent hover:border-[rgba(19,236,164,0.12)] transition-all group"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color }}>
                      {icon}
                    </span>
                    <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                      {label}
                    </span>
                    <span className="material-symbols-outlined text-slate-600 text-[16px] ml-auto group-hover:text-[#13eca4] transition-colors">
                      chevron_right
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="bg-linear-to-br from-[rgba(19,236,164,0.06)] to-transparent rounded-2xl border border-[rgba(19,236,164,0.12)] p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-[#13eca4] text-[28px]">school</span>
                <div>
                  <h3 className="text-white font-bold">Need Support?</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Access facilitation notes, educator guides, and curriculum resources.
                  </p>
                </div>
              </div>
              <Link
                href="/school/teacher/courses"
                className="w-full flex items-center justify-center gap-2 border border-[rgba(19,236,164,0.3)] text-[#13eca4] font-semibold py-2.5 rounded-xl text-sm hover:bg-[rgba(19,236,164,0.06)] transition-colors"
              >
                Browse Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}
