"use client";

import { useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudentData } from "@/hooks/useStudentData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { toDate } from "@/lib/timestamps";
import type { Course } from "@/lib/types";

const skillColors: Record<string, string> = {
  Coding: "#13eca4",
  Circuitry: "#f59e0b",
  "Web Design": "#3b82f6",
  "Game Design": "#8b5cf6",
  "Critical Thinking": "#10b981",
  Collaboration: "#ec4899",
  Logic: "#3b82f6",
  Math: "#f59e0b",
  Design: "#8b5cf6",
  Engineering: "#06b6d4",
  Science: "#10b981",
  Robotics: "#ec4899",
  Creativity: "#f97316",
};
const skillIcons: Record<string, string> = {
  Coding: "code",
  Circuitry: "bolt",
  "Web Design": "language",
  "Game Design": "sports_esports",
  "Critical Thinking": "psychology",
  Collaboration: "group",
  Logic: "functions",
  Math: "calculate",
  Design: "brush",
  Engineering: "precision_manufacturing",
  Science: "science",
  Robotics: "smart_toy",
  Creativity: "palette",
};
const defaultColor = "#13eca4";
const defaultIcon = "star";

export default function StudentProgressPage() {
  const { appUser } = useAuthContext();
  const { enrollments, submissions, earnedBadges, loading: studentLoading } = useStudentData();

  // Get unique courseIds from enrollments
  const courseIds = useMemo(() => [...new Set(enrollments.map((e) => e.courseId))], [enrollments]);

  // Fetch courses
  const { data: courses, loading: coursesLoading } = useCollection<Course>(
    "courses",
    courseIds.length > 0 ? [where("__name__", "in", courseIds.slice(0, 10))] : [],
    courseIds.length > 0
  );

  const loading = studentLoading || coursesLoading;

  // Build skills from appUser.skills
  const skills = useMemo(() => {
    const raw = appUser?.skills ?? {};
    const entries = Object.entries(raw);
    if (entries.length === 0) return [];
    return entries.map(([name, value]) => ({
      name,
      level: typeof value === "number" ? value : 0,
      xp: Math.round((typeof value === "number" ? value : 0) * 20),
      icon: skillIcons[name] ?? defaultIcon,
      color: skillColors[name] ?? defaultColor,
    }));
  }, [appUser?.skills]);

  // Build milestones from activities / real data
  const milestones = useMemo(() => {
    const items: { label: string; date: string; icon: string; done: boolean }[] = [];

    // First submission
    const firstSub =
      submissions.length > 0
        ? [...submissions].sort((a, b) => {
            const da = a.submittedAt ? toDate(a.submittedAt).getTime() : 0;
            const db_ = b.submittedAt ? toDate(b.submittedAt).getTime() : 0;
            return da - db_;
          })[0]
        : null;
    items.push({
      label: "First Submission",
      icon: "rocket_launch",
      done: submissions.length > 0,
      date: firstSub?.submittedAt
        ? toDate(firstSub.submittedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "--",
    });

    const xp = appUser?.xp ?? 0;
    items.push({
      label: "50 XP Earned",
      icon: "star",
      done: xp >= 50,
      date: xp >= 50 ? "Achieved" : "--",
    });
    items.push({
      label: "First Badge",
      icon: "military_tech",
      done: earnedBadges.length >= 1,
      date: earnedBadges.length >= 1 ? "Achieved" : "--",
    });
    items.push({
      label: "500 XP Milestone",
      icon: "workspace_premium",
      done: xp >= 500,
      date: xp >= 500 ? "Achieved" : "--",
    });
    items.push({
      label: "Level 5 Reached",
      icon: "trending_up",
      done: (appUser?.level ?? 0) >= 5,
      date: (appUser?.level ?? 0) >= 5 ? "Achieved" : "--",
    });
    items.push({
      label: "1000 XP Milestone",
      icon: "emoji_events",
      done: xp >= 1000,
      date: xp >= 1000 ? "Achieved" : "--",
    });
    items.push({
      label: "Complete 3 Courses",
      icon: "school",
      done: enrollments.filter((e) => e.progress >= 100).length >= 3,
      date: enrollments.filter((e) => e.progress >= 100).length >= 3 ? "Achieved" : "--",
    });

    return items;
  }, [submissions, appUser?.xp, appUser?.level, earnedBadges.length, enrollments]);

  // Split courses into completed and in-progress
  const courseMap = useMemo(() => {
    const map: Record<string, Course & { id: string }> = {};
    for (const c of courses) map[c.id] = c;
    return map;
  }, [courses]);

  const completedCourses = useMemo(() => {
    return enrollments
      .filter((e) => e.progress >= 100)
      .map((e) => {
        const course = courseMap[e.courseId];
        // Find graded submission for this course
        const sub = submissions.find((s) => s.courseId === e.courseId && s.status === "graded");
        return {
          title: course?.title ?? "Course",
          category: course?.category ?? "STEM",
          grade: sub?.grade ?? "---",
          xp: sub?.score ? sub.score * 4 : 0,
          color: skillColors[course?.category ?? ""] ?? defaultColor,
        };
      });
  }, [enrollments, courseMap, submissions]);

  const inProgressCourses = useMemo(() => {
    return enrollments
      .filter((e) => e.progress > 0 && e.progress < 100)
      .map((e) => {
        const course = courseMap[e.courseId];
        return {
          title: course?.title ?? "Course",
          category: course?.category ?? "STEM",
          progress: e.progress,
          color: skillColors[course?.category ?? ""] ?? defaultColor,
        };
      });
  }, [enrollments, courseMap]);

  const displayName = appUser?.displayName ?? "Student";
  const level = appUser?.level ?? 1;
  const xp = appUser?.xp ?? 0;
  const xpForNextLevel = (level + 1) * 1000;
  const xpPercent = xpForNextLevel > 0 ? Math.min(100, Math.round((xp / xpForNextLevel) * 100)) : 0;

  // Find strongest and weakest skills
  const sortedSkills = useMemo(() => [...skills].sort((a, b) => b.level - a.level), [skills]);
  const strongest = sortedSkills[0] ?? null;
  const weakest = sortedSkills[sortedSkills.length - 1] ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Progress</h1>
          <p className="text-slate-400 text-xs mt-0.5">Skills radar &amp; learning journey</p>
        </div>
        <button className="flex items-center gap-2 border border-[rgba(255,255,255,0.12)] text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:border-[#13eca4] hover:text-[#13eca4] transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download Report
        </button>
      </header>

      <div className="px-8 py-8">
        {/* XP Hero */}
        <div className="bg-linear-to-r from-[rgba(19,236,164,0.08)] to-[rgba(19,236,164,0.02)] border border-[rgba(19,236,164,0.12)] rounded-3xl p-7 mb-8 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-5 blur-2xl bg-[#13eca4]" />
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[rgba(19,236,164,0.1)] border-2 border-[#13eca4] flex items-center justify-center">
                <span className="text-[#13eca4] text-3xl font-black">{level}</span>
              </div>
              <div>
                <p className="text-white text-2xl font-black">{displayName}</p>
                <p className="text-[#13eca4] font-semibold text-sm">Level {level}</p>
              </div>
            </div>

            <div className="md:ml-auto grid grid-cols-3 gap-4">
              {[
                { label: "Total XP", value: String(xp), icon: "star", color: "#f59e0b" },
                {
                  label: "Badges",
                  value: String(earnedBadges.length),
                  icon: "military_tech",
                  color: "#13eca4",
                },
                {
                  label: "Submissions",
                  value: String(submissions.length),
                  icon: "upload_file",
                  color: "#8b5cf6",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span
                    className="material-symbols-outlined text-[22px] block mb-1"
                    style={{ color: s.color }}
                  >
                    {s.icon}
                  </span>
                  <p className="text-white text-xl font-bold">{s.value}</p>
                  <p className="text-slate-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400 font-semibold">Progress to Level {level + 1}</span>
              <span className="text-[#13eca4] font-bold">
                {xp} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="h-2.5 bg-[rgba(255,255,255,0.08)] rounded-full">
              <div
                className="h-2.5 rounded-full bg-linear-to-r from-[#13eca4] to-[#06d68e] transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Skills Radar (visual approximation with bars) */}
          <div className="xl:col-span-2 bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6">
            <h2 className="text-white font-bold mb-5">Skills Analysis</h2>
            {skills.length > 0 ? (
              <>
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ color: skill.color }}
                          >
                            {skill.icon}
                          </span>
                          <span className="text-white text-sm font-semibold">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs">{skill.xp} XP</span>
                          <span className="text-sm font-bold" style={{ color: skill.color }}>
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full relative overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`,
                            width: `${skill.level}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top Skill Highlights */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[rgba(19,236,164,0.05)] rounded-xl border border-[rgba(19,236,164,0.1)]">
                    <p className="text-slate-500 text-xs mb-1">Strongest Skill</p>
                    <p
                      className="font-bold text-sm"
                      style={{ color: strongest?.color ?? defaultColor }}
                    >
                      {strongest?.name ?? "N/A"}
                    </p>
                    <p className="text-xs" style={{ color: strongest?.color ?? defaultColor }}>
                      {strongest?.level ?? 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-[rgba(19,236,164,0.05)] rounded-xl border border-[rgba(19,236,164,0.1)]">
                    <p className="text-slate-500 text-xs mb-1">Total Skills</p>
                    <p className="text-[#13eca4] font-bold text-sm">{skills.length}</p>
                    <p className="text-[#13eca4] text-xs">tracked</p>
                  </div>
                  <div className="p-3 bg-[rgba(19,236,164,0.05)] rounded-xl border border-[rgba(19,236,164,0.1)]">
                    <p className="text-slate-500 text-xs mb-1">Focus Area</p>
                    <p className="font-bold text-sm" style={{ color: weakest?.color ?? "#3b82f6" }}>
                      {weakest?.name ?? "N/A"}
                    </p>
                    <p className="text-xs" style={{ color: weakest?.color ?? "#3b82f6" }}>
                      {weakest?.level ?? 0}% -- keep going!
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[40px] text-slate-600 mb-2 block">
                  insights
                </span>
                <p className="text-slate-500 text-sm">
                  No skills data yet. Complete courses to build your skills profile!
                </p>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6">
            <h2 className="text-white font-bold mb-5">Milestones</h2>
            <div className="relative">
              <div className="absolute left-3.5 top-0 h-full w-0.5 bg-[rgba(255,255,255,0.06)]" />
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m.label} className="flex items-start gap-3 relative pl-1">
                    <div
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.done ? "bg-[rgba(19,236,164,0.15)]" : "bg-[rgba(255,255,255,0.05)]"}`}
                    >
                      <span
                        className={`material-symbols-outlined text-[14px] ${m.done ? "text-[#13eca4]" : "text-slate-600"}`}
                      >
                        {m.icon}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${m.done ? "text-white" : "text-slate-600"}`}
                      >
                        {m.label}
                      </p>
                      <p className={`text-xs ${m.done ? "text-slate-500" : "text-slate-700"}`}>
                        {m.date}
                      </p>
                    </div>
                    {m.done && (
                      <span className="ml-auto text-xs text-[#13eca4] font-bold">&check;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13eca4] text-[20px]">task_alt</span>
              Completed Courses
            </h2>
            {completedCourses.length > 0 ? (
              <div className="space-y-3">
                {completedCourses.map((c) => (
                  <div
                    key={c.title}
                    className="flex items-center gap-4 p-3 bg-[rgba(255,255,255,0.03)] rounded-xl"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${c.color}18` }}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: c.color }}
                      >
                        school
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{c.title}</p>
                      <p className="text-slate-500 text-xs">
                        {c.category} &middot; {c.xp} XP earned
                      </p>
                    </div>
                    <span className="text-white font-black text-lg" style={{ color: c.color }}>
                      {c.grade}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No courses completed yet.</p>
            )}
          </div>

          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">pending</span>
              In Progress
            </h2>
            {inProgressCourses.length > 0 ? (
              <div className="space-y-4">
                {inProgressCourses.map((c) => (
                  <div key={c.title} className="p-3 bg-[rgba(255,255,255,0.03)] rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${c.color}18` }}
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{ color: c.color }}
                        >
                          school
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{c.title}</p>
                        <p className="text-slate-500 text-xs">{c.category}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: c.color }}>
                        {c.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: c.color, width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No courses in progress.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
