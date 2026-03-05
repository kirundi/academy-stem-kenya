"use client";

import { useState } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";

const SHARED_CURRICULUM = [
  {
    name: "Introduction to Quantum Mechanics",
    published: "Oct 12, 2023",
    grade: "Grade 12",
    views: 450,
    status: "Live",
  },
  {
    name: "Python for Robotics",
    published: "Jan 05, 2024",
    grade: "Grade 10",
    views: 310,
    status: "Live",
  },
  {
    name: "Environmental Data Science",
    published: "Mar 22, 2024",
    grade: "Grade 11",
    views: 218,
    status: "Live",
  },
  {
    name: "Advanced Circuitry & Electronics",
    published: "Jun 01, 2024",
    grade: "Grade 9",
    views: 95,
    status: "Draft",
  },
];

const RECENT_ACTIVITY = [
  {
    icon: "grading",
    color: "text-(--primary-green)",
    text: "Graded 8 submissions in Python for Robotics",
    time: "2h ago",
  },
  {
    icon: "group_add",
    color: "text-blue-400",
    text: "3 new students enrolled in Quantum Mechanics",
    time: "Yesterday",
  },
  {
    icon: "emoji_events",
    color: "text-amber-400",
    text: "Your course was featured on the platform",
    time: "3 days ago",
  },
  {
    icon: "star",
    color: "text-yellow-400",
    text: "Received a 5-star rating from Alex K.",
    time: "5 days ago",
  },
];

export default function TeacherProfilePage() {
  const { appUser } = useAuthContext();
  const { classrooms, loading } = useTeacherData();
  const [editMode, setEditMode] = useState(false);

  const displayName = appUser?.displayName ?? "Teacher";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const subjects: string[] = ((appUser as unknown as Record<string, unknown>)
    ?.subjects as string[]) ?? ["STEM"];
  const department: string =
    ((appUser as unknown as Record<string, unknown>)?.department as string) ?? "STEM Education";

  const subjectIcons: Record<string, string> = {
    Physics: "science",
    Chemistry: "biotech",
    Biology: "eco",
    Math: "calculate",
    "Computer Science": "terminal",
    Robotics: "precision_manufacturing",
    Engineering: "construction",
    STEM: "hub",
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-(--bg-page)">
        <TeacherSidebar />
        <main className="ml-60 flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
            progress_activity
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-page) overflow-hidden">
      <TeacherSidebar />

      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-(--border-subtle) px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-(--text-base)">My Professional Profile</h1>
            <p className="text-(--text-muted) text-xs">
              Your public educator profile and curriculum portfolio
            </p>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {["Dashboard", "Curriculum", "Students", "Profile"].map((item) => (
              <span
                key={item}
                className={`text-sm cursor-pointer transition-colors ${item === "Profile" ? "text-(--primary-green) font-semibold border-b-2 border-(--primary-green) pb-0.5" : "text-(--text-muted) hover:text-(--primary-green)"}`}
              >
                {item}
              </span>
            ))}
          </nav>
        </header>

        <div className="px-6 py-8 max-w-350 mx-auto">
          {/* Profile Banner */}
          <section className="flex flex-col @container mb-8">
            <div className="flex w-full flex-col gap-6 md:flex-row md:justify-between md:items-end bg-[rgba(45,212,191,0.05)] p-7 rounded-xl border border-(--border-subtle)">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-xl bg-[rgba(45,212,191,0.15)] border-4 border-[#10221c] shadow-xl flex items-center justify-center text-(--primary-green) text-4xl font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-3">
                    <h1 className="text-(--text-base) text-3xl font-bold tracking-tight">{displayName}</h1>
                    <span className="bg-[rgba(45,212,191,0.2)] text-(--primary-green) text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Expert Educator
                    </span>
                  </div>
                  <p className="text-(--primary-green) text-lg font-medium mt-1">
                    {department} ·{" "}
                    {((appUser as unknown as Record<string, unknown>)?.schoolName as string) ??
                      "Your School"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {subjects.slice(0, 4).map((subj) => (
                      <span
                        key={subj}
                        className="flex items-center gap-1.5 px-3 py-1 bg-(--bg-elevated) rounded-full text-xs font-medium text-(--text-muted)"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {subjectIcons[subj] ?? "school"}
                        </span>
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex-1 md:flex-none min-w-30 flex items-center justify-center rounded-lg h-11 px-5 bg-(--bg-elevated) text-(--text-base) text-sm font-bold transition-all hover:bg-(--bg-elevated)"
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
                <button className="flex-1 md:flex-none min-w-30 flex items-center justify-center rounded-lg h-11 px-5 bg-(--primary-green) text-[#10221c] text-sm font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all hover:opacity-90">
                  Share Profile
                </button>
              </div>
            </div>
          </section>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              {
                label: "Total Students Impacted",
                value: "1,240",
                icon: "groups",
                trend: "+12% this year",
                trendUp: true,
              },
              {
                label: "Classes Managed",
                value: String(classrooms.length || 8),
                icon: "school",
                trend: "Consistent performance",
                trendUp: null,
              },
              {
                label: "Courses Created",
                value: String(SHARED_CURRICULUM.length),
                icon: "auto_stories",
                trend: "+3 new this term",
                trendUp: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 rounded-xl p-6 bg-[rgba(45,212,191,0.05)] border border-(--border-subtle)"
              >
                <div className="flex justify-between items-start">
                  <p className="text-(--text-muted) text-sm font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <span className="material-symbols-outlined text-(--primary-green)">{stat.icon}</span>
                </div>
                <p className="text-(--text-base) text-3xl font-bold mt-1">{stat.value}</p>
                {stat.trendUp !== null ? (
                  <p
                    className={`text-sm font-bold flex items-center gap-1 ${stat.trendUp ? "text-emerald-500" : "text-(--text-muted)"}`}
                  >
                    {stat.trendUp && (
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                    )}
                    {stat.trend}
                  </p>
                ) : (
                  <p className="text-(--text-muted) text-sm font-medium">{stat.trend}</p>
                )}
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Shared Curriculum Table */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-(--text-base) text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-(--primary-green)">library_books</span>
                  My Shared Curriculum
                </h2>
                <button className="text-(--primary-green) text-sm font-semibold hover:underline">
                  View All
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-[rgba(45,212,191,0.05)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[rgba(45,212,191,0.1)]">
                        <th className="px-5 py-4 text-(--text-base) text-sm font-bold uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-5 py-4 text-(--text-base) text-sm font-bold uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-5 py-4 text-(--text-base) text-sm font-bold uppercase tracking-wider text-center">
                          Impact
                        </th>
                        <th className="px-5 py-4 text-(--text-base) text-sm font-bold uppercase tracking-wider text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(45,212,191,0.05)]">
                      {SHARED_CURRICULUM.map((course) => (
                        <tr
                          key={course.name}
                          className="hover:bg-[rgba(45,212,191,0.05)] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-(--text-base) font-semibold text-sm">
                                {course.name}
                              </span>
                              <span className="text-(--text-muted) text-xs mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">
                                  calendar_today
                                </span>
                                Published {course.published}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded bg-(--bg-elevated) text-xs font-semibold text-(--text-muted)">
                              {course.grade}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-(--text-muted) font-medium text-sm">
                              {course.views} views
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                course.status === "Live"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${course.status === "Live" ? "bg-emerald-500" : "bg-amber-400"}`}
                              />
                              {course.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Recent Activity */}
              <div className="bg-[rgba(45,212,191,0.05)] border border-(--border-subtle) rounded-xl p-6">
                <h3 className="text-(--text-base) font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-(--primary-green)">bolt</span>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-(--bg-page) flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined text-[18px] ${act.color}`}>
                          {act.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-(--text-muted) text-xs leading-relaxed">{act.text}</p>
                        <p className="text-(--text-faint) text-[11px] mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About / Bio */}
              <div className="bg-[rgba(45,212,191,0.05)] border border-(--border-subtle) rounded-xl p-6">
                <h3 className="text-(--text-base) font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-(--primary-green)">info</span>
                  About
                </h3>
                {editMode ? (
                  <textarea
                    className="w-full bg-(--bg-page) border border-(--border-accent) rounded-lg text-(--text-muted) px-4 py-3 text-sm focus:border-(--primary-green) outline-none transition-all resize-none min-h-25"
                    defaultValue="Passionate STEM educator with a focus on hands-on learning and real-world applications. Dedicated to inspiring the next generation of scientists and engineers."
                  />
                ) : (
                  <p className="text-(--text-muted) text-sm leading-relaxed">
                    Passionate STEM educator with a focus on hands-on learning and real-world
                    applications. Dedicated to inspiring the next generation of scientists and
                    engineers.
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-(--border-subtle) space-y-2">
                  <p className="text-xs text-(--text-muted) flex items-center gap-2">
                    <span className="material-symbols-outlined text-(--primary-green) text-[16px]">
                      mail
                    </span>
                    {appUser?.email ?? "teacher@school.edu"}
                  </p>
                  <p className="text-xs text-(--text-muted) flex items-center gap-2">
                    <span className="material-symbols-outlined text-(--primary-green) text-[16px]">
                      calendar_today
                    </span>
                    Member since Jan 2022
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
