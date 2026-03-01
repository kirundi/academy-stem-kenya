"use client";

import { useMemo } from "react";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudentData } from "@/hooks/useStudentData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Course } from "@/lib/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date: Date | { toDate?: () => Date } | null | undefined): string {
  if (!date) return "";
  const d = typeof (date as { toDate?: () => Date }).toDate === "function"
    ? (date as { toDate: () => Date }).toDate()
    : date as Date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Yesterday";
  return `${diffD} days ago`;
}

const activityIcons: Record<string, { icon: string; color: string }> = {
  lesson_complete: { icon: "play_circle", color: "#13eca4" },
  badge_earned: { icon: "military_tech", color: "#f59e0b" },
  submission: { icon: "upload_file", color: "#8b5cf6" },
  course_complete: { icon: "emoji_events", color: "#00f5d4" },
  default: { icon: "info", color: "#3b82f6" },
};

export default function StudentDashboard() {
  const { appUser } = useAuthContext();
  const { enrollments, activities, submissions, earnedBadges, loading: studentLoading } = useStudentData();

  // Get unique courseIds from enrollments
  const courseIds = useMemo(
    () => [...new Set(enrollments.map((e) => e.courseId))],
    [enrollments]
  );

  // Fetch course documents for enrolled courseIds
  const { data: courses, loading: coursesLoading } = useCollection<Course>(
    "courses",
    courseIds.length > 0 ? [where("__name__", "in", courseIds.slice(0, 10))] : [],
    courseIds.length > 0
  );

  const loading = studentLoading || coursesLoading;

  // Merge enrollment progress with course data
  const mergedCourses = useMemo(() => {
    return courses.map((course) => {
      const enrollment = enrollments.find((e) => e.courseId === course.id);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        progress: enrollment?.progress ?? 0,
        totalLessons: course.totalLessons,
        completedLessons: enrollment?.completedLessons ?? 0,
        difficulty: course.difficulty,
        completed: enrollment ? enrollment.progress >= 100 : false,
        image: course.coverImageUrl,
      };
    });
  }, [courses, enrollments]);

  // Find the most recently completed course
  const completedCourse = useMemo(() => {
    return mergedCourses.find((c) => c.completed);
  }, [mergedCourses]);

  const displayName = appUser?.displayName ?? "Student";
  const firstName = displayName.split(" ")[0];
  const initials = getInitials(displayName);
  const xp = appUser?.xp ?? 0;
  const badgeCount = earnedBadges.length;
  const projectsDone = submissions.filter((s) => s.status === "graded").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Top header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Courses</h1>
          <p className="text-slate-400 text-xs mt-0.5">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-[rgba(19,236,164,0.08)] text-[#13eca4] hover:bg-[rgba(19,236,164,0.15)] transition-colors">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#13eca4] to-[#0dd494] flex items-center justify-center text-[#10221c] font-bold text-sm">
            {initials}
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Hero welcome */}
        <div className="relative bg-linear-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-8 mb-8 overflow-hidden border border-[rgba(19,236,164,0.1)]">
          <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-[rgba(19,236,164,0.03)] to-transparent" />
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-[rgba(19,236,164,0.1)] rounded-full" />
          <div className="relative z-10">
            <p className="text-[#13eca4] font-semibold text-sm mb-2 uppercase tracking-widest">Welcome back</p>
            <h2 className="text-3xl font-bold text-white mb-2">Hi, {firstName}!</h2>
            <p className="text-slate-400 mb-6 max-w-md">
              You have <span className="text-white font-semibold">{mergedCourses.filter((c) => !c.completed && c.progress > 0).length} courses in progress</span>.
              Keep up the great work!
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: "military_tech", color: "#f59e0b", label: "Badges Earned", value: String(badgeCount) },
                { icon: "bolt", color: "#13eca4", label: "XP Points", value: String(xp) },
                { icon: "check_circle", color: "#10b981", label: "Projects Done", value: String(projectsDone) },
                { icon: "school", color: "#3b82f6", label: "Courses", value: String(mergedCourses.length) },
              ].map(({ icon, color, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
                  <div>
                    <p className="text-white font-bold leading-none">{value}</p>
                    <p className="text-slate-500 text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Courses grid */}
          <div className="xl:col-span-3">
            {/* Teacher Message Widget */}
            <div className="relative bg-linear-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-5 mb-6 border border-[rgba(19,236,164,0.1)] overflow-hidden">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[64px] text-[rgba(19,236,164,0.06)] pointer-events-none select-none" aria-hidden>campaign</span>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-[#13eca4]">campaign</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-0.5">Teacher&apos;s Message</p>
                  <p className="text-slate-200 text-sm leading-relaxed italic">&ldquo;Welcome to your courses! Keep up the great work and don&rsquo;t hesitate to reach out if you need help.&rdquo;</p>
                </div>
              </div>
            </div>

            {/* Recently Completed Banner */}
            {completedCourse && (
              <div className="flex items-center gap-4 p-4 rounded-2xl mb-6 border border-[rgba(0,245,212,0.2)] bg-[rgba(0,245,212,0.03)]">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,245,212,0.1)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: "#00f5d4", fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "#00f5d4" }}>Recently Completed</p>
                  <p className="text-white font-semibold text-sm truncate">{completedCourse.title}</p>
                </div>
                <Link href="/student/submit-success" className="text-[#0a1a18] text-xs font-bold px-4 py-2 rounded-lg shrink-0 hover:opacity-90 transition-opacity" style={{ background: "#00f5d4" }}>
                  View Certificate
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">My Authorized Courses</h2>
              <div className="flex gap-2">
                {["All", "In Progress", "Not Started", "Completed"].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      i === 0
                        ? "bg-[#13eca4] text-[#10221c]"
                        : "bg-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {mergedCourses.length > 0 ? (
                mergedCourses.map((course) => (
                  <CourseCard key={course.id} {...course} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3 block">school</span>
                  <p className="text-slate-400 text-sm">No courses enrolled yet. Ask your teacher for a classroom code!</p>
                </div>
              )}
            </div>

            {/* Footer Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: "school", label: "Enrolled Courses", value: String(mergedCourses.length), color: "#13eca4" },
                { icon: "workspace_premium", label: "Completed", value: String(mergedCourses.filter((c) => c.completed).length).padStart(2, "0"), color: "#f59e0b" },
                { icon: "bolt", label: "Total XP", value: String(xp), color: "#8b5cf6" },
                { icon: "military_tech", label: "Badges Earned", value: String(badgeCount), color: "#ec4899" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-4 bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.06)]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18` }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar widgets */}
          <div className="space-y-6">
            {/* Weekly goal */}
            <div className="bg-[#1a2e27] rounded-2xl p-5 border border-[rgba(19,236,164,0.08)]">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4] text-[20px]">trending_up</span>
                Weekly Goal
              </h3>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">{mergedCourses.filter((c) => c.completed).length} of {mergedCourses.length} courses completed</span>
                  <span className="text-[#13eca4] font-bold">{mergedCourses.length > 0 ? Math.round((mergedCourses.filter((c) => c.completed).length / mergedCourses.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full" style={{ width: `${mergedCourses.length > 0 ? Math.round((mergedCourses.filter((c) => c.completed).length / mergedCourses.length) * 100) : 0}%` }} />
                </div>
              </div>
              <p className="text-slate-400 text-xs">Keep learning to reach your goals!</p>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1a2e27] rounded-2xl p-5 border border-[rgba(19,236,164,0.08)]">
              <h3 className="text-white font-bold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((item) => {
                    const iconData = activityIcons[item.type] ?? activityIcons.default;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${iconData.color}18` }}
                        >
                          <span className="material-symbols-outlined text-[18px]" style={{ color: iconData.color }}>
                            {iconData.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-300 text-xs leading-snug">{item.description}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{timeAgo(item.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-xs">No recent activity yet.</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-[#1a2e27] rounded-2xl p-5 border border-[rgba(19,236,164,0.08)]">
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { icon: "military_tech", label: "View All Badges", href: "/student/badges", color: "#f59e0b" },
                  { icon: "grid_view", label: "My Portfolio", href: "/student/portfolio", color: "#8b5cf6" },
                  { icon: "insights", label: "My Progress", href: "/student/progress", color: "#13eca4" },
                ].map(({ icon, label, href, color }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-transparent hover:border-[rgba(19,236,164,0.15)] transition-all group"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
                    <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{label}</span>
                    <span className="material-symbols-outlined text-slate-600 text-[16px] ml-auto group-hover:text-[#13eca4] transition-colors">arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
