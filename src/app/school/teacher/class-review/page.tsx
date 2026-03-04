"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Course, Enrollment } from "@/lib/types";

export default function ClassReviewPage() {
  const { appUser } = useAuthContext();
  const { classrooms, loading: teacherLoading } = useTeacherData();

  // For class review, use the most recently assigned classroom (or first one)
  const reviewClassroom = classrooms[0] ?? null;

  // Fetch courses for this classroom
  const courseIds = reviewClassroom?.courseIds ?? [];
  const { data: courses, loading: coursesLoading } = useCollection<Course>(
    "courses",
    courseIds.length > 0 ? [where("__name__", "in", courseIds.slice(0, 10))] : [],
    courseIds.length > 0
  );

  // Fetch enrollments to get student count
  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    reviewClassroom ? [where("classroomId", "==", reviewClassroom.id)] : [],
    !!reviewClassroom
  );

  const studentCount = new Set(enrollments.map((e) => e.studentId)).size;

  const [checklist, setChecklist] = useState([true, false, true]);
  const [authorized, setAuthorized] = useState<boolean[]>([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [msg, setMsg] = useState("");
  const [finishing, setFinishing] = useState(false);

  // Initialize authorized state when courses load
  useEffect(() => {
    if (courses.length > 0) {
      setAuthorized(courses.map(() => true));
    }
  }, [courses]);

  // Initialize message once when user data is available
  useEffect(() => {
    if (appUser?.displayName) {
      setMsg(
        `Hello Class! \n\nI'm excited to be your instructor. Looking forward to a great learning experience together.\n\nOver the next few weeks, we will work through the curriculum together. Feel free to reach out if you have any questions.\n\nBest,\n${appUser.displayName}`
      );
    }
  }, [appUser?.displayName]);

  const loading = teacherLoading || coursesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
          progress_activity
        </span>
      </div>
    );
  }

  const progress = Math.round((checklist.filter(Boolean).length / checklist.length) * 100);

  // Check for deprecated/legacy courses
  const hasLegacyCourse = courses.some((c) => c.difficulty === "Advanced");

  const handleFinishReview = async () => {
    if (!appUser || !reviewClassroom) return;
    setFinishing(true);
    try {
      await logActivity(
        appUser.uid,
        "finish_review",
        `Completed class review for ${reviewClassroom.name}`
      );
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Error finishing review:", err);
    } finally {
      setFinishing(false);
    }
  };

  if (!reviewClassroom) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center text-(--text-faint)">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] mb-4 block">account_tree</span>
          <p>No classroom to review. Create or get assigned a classroom first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-0px)] bg-(--bg-page) overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-60 right-0 z-20 bg-[rgba(16,34,28,0.95)] backdrop-blur-md border-b border-(--border-subtle) h-14 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary-green/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-green text-[16px]">
                account_tree
              </span>
            </div>
            <span className="text-(--text-base) font-bold">STEM Learn</span>
          </div>
          <div className="flex items-center bg-(--input-bg) rounded-lg border border-(--border-subtle) px-3 py-1.5">
            <span className="material-symbols-outlined text-(--text-muted) text-[16px]">search</span>
            <input
              placeholder="Search resources..."
              className="bg-transparent border-none text-(--text-base) text-sm placeholder:text-(--text-faint) focus:outline-none ml-2 w-36"
            />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <a
              href="/school/teacher/classroom"
              className="text-(--text-muted) hover:text-primary-green transition-colors"
            >
              Classrooms
            </a>
            <a
              href="/school/teacher/courses"
              className="text-(--text-muted) hover:text-primary-green transition-colors"
            >
              Curriculum
            </a>
            <a
              href="/school/teacher/grading"
              className="text-(--text-muted) hover:text-primary-green transition-colors"
            >
              Grades
            </a>
          </nav>
          <button
            onClick={handleFinishReview}
            disabled={finishing}
            className="px-5 h-9 bg-primary-green text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {finishing ? "Saving..." : "Finish Review"}
          </button>
          <div className="w-9 h-9 rounded-full bg-(--bg-elevated) border-2 border-(--border-subtle) flex items-center justify-center text-xs font-bold text-primary-green">
            {appUser?.displayName?.[0] ?? "?"}
          </div>
        </div>
      </div>

      {/* Body below header */}
      <div className="flex w-full mt-14 overflow-hidden">
        {/* Audit Sidebar */}
        <aside className="w-72 border-r border-(--border-subtle) bg-[rgba(13,31,26,0.5)] flex flex-col p-6 gap-8 overflow-y-auto shrink-0">
          {/* Progress */}
          <div>
            <h3 className="text-(--text-muted) text-xs font-bold uppercase tracking-widest mb-4">
              Review Progress
            </h3>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end mb-2">
                <span className="text-primary-green text-2xl font-bold">{progress}%</span>
                <span className="text-(--text-faint) text-xs mb-1">
                  {checklist.filter(Boolean).length} of {checklist.length} Tasks
                </span>
              </div>
              <div className="w-full bg-(--input-bg) h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-green h-full rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-4">
            <h3 className="text-(--text-base) text-sm font-bold">Class Audit Checklist</h3>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Review Student Roster",
                  sub: `${studentCount} Student${studentCount !== 1 ? "s" : ""} verified`,
                  subColor: "text-(--text-faint)",
                },
                {
                  label: "Verify Authorized Courses",
                  sub: courses.length > 0 ? `${courses.length} courses to review` : "No courses",
                  subColor: "text-amber-400",
                  subIcon: "warning",
                },
                { label: "Check Pending Grades", sub: "All caught up", subColor: "text-(--text-faint)" },
              ].map((item, i) => (
                <label
                  key={item.label}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    checklist[i]
                      ? "bg-[rgba(19,236,164,0.05)] border border-(--border-accent)"
                      : "bg-[rgba(255,255,255,0.03)] border border-(--border-subtle) hover:border-(--border-accent)"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[i]}
                    onChange={() => {
                      const next = [...checklist];
                      next[i] = !next[i];
                      setChecklist(next);
                    }}
                    className="w-5 h-5 rounded border-slate-600 bg-transparent text-primary-green focus:ring-0 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-(--text-base) text-sm font-medium group-hover:text-primary-green transition-colors">
                      {item.label}
                    </span>
                    <span className={`${item.subColor} text-xs flex items-center gap-1`}>
                      {item.subIcon && (
                        <span className="material-symbols-outlined text-[12px]">
                          {item.subIcon}
                        </span>
                      )}
                      {item.sub}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-(--border-subtle)">
            <button className="w-full py-3 px-4 rounded-xl bg-(--glass-bg) text-(--text-muted) font-medium text-sm hover:bg-(--bg-elevated) transition-colors flex items-center justify-center gap-2 border border-(--border-subtle)">
              <span className="material-symbols-outlined text-[16px]">save</span>Save Progress
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto p-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Hero */}
            <div>
              <div className="flex items-center gap-2 text-primary-green text-sm font-medium mb-2">
                <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                Classroom ID: {reviewClassroom.id.slice(0, 12)}
              </div>
              <h1 className="text-(--text-base) text-4xl font-black leading-tight mb-2">
                Classroom Review
              </h1>
              <p className="text-(--text-muted) text-lg">
                Class: <span className="text-(--text-base)">{reviewClassroom.name}</span> (
                {reviewClassroom.subject} · {reviewClassroom.grade})
              </p>
            </div>

            {/* Curriculum Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-(--text-base) text-2xl font-bold">Curriculum</h2>
                {courses.length > 0 && (
                  <span className="bg-[rgba(255,191,0,0.1)] text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[rgba(255,191,0,0.2)]">
                    Review Toggles Required
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-(--text-faint) text-sm">
                    No courses assigned to this classroom yet.
                  </div>
                )}
                {courses.map((c, i) => {
                  const isDeprecated = c.difficulty === "Advanced";
                  return (
                    <div
                      key={c.id}
                      className={`rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-xl ${
                        isDeprecated
                          ? "bg-[rgba(26,46,40,0.4)] border border-(--border-subtle) opacity-75 grayscale hover:grayscale-0"
                          : "bg-(--bg-card) border border-(--border-subtle) hover:shadow-[rgba(19,236,164,0.05)]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDeprecated ? "bg-(--glass-bg)" : "bg-primary-green/10"}`}
                        >
                          <span
                            className={`material-symbols-outlined text-[28px] ${isDeprecated ? "text-(--text-muted)" : "text-primary-green"}`}
                          >
                            {c.icon || "menu_book"}
                          </span>
                        </div>
                        {/* Toggle */}
                        <div className="flex items-center gap-2 bg-[rgba(13,31,26,0.8)] py-1.5 px-2 rounded-full border border-(--border-subtle)">
                          <span className="text-[10px] uppercase font-bold text-(--text-faint)">
                            Keep Authorized
                          </span>
                          <button
                            onClick={() => {
                              const next = [...authorized];
                              next[i] = !next[i];
                              setAuthorized(next);
                            }}
                            className={`w-10 h-6 rounded-full relative flex items-center px-1 transition-colors ${authorized[i] ? "bg-primary-green" : "bg-[rgba(255,255,255,0.1)]"}`}
                          >
                            <div
                              className={`w-4 h-4 bg-(--bg-page) rounded-full shadow transition-transform ${authorized[i] ? "translate-x-4" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-(--text-base) font-bold text-lg">{c.title}</h4>
                        <p className="text-(--text-muted) text-sm mt-1">{c.description}</p>
                      </div>
                      <div className="flex items-center gap-5 pt-2 mt-auto border-t border-(--border-subtle)">
                        <div className="flex items-center gap-1 text-(--text-faint) text-xs">
                          <span className="material-symbols-outlined text-[14px]">grid_view</span>
                          {c.totalLessons ?? 0} Lessons
                        </div>
                        <div className="flex items-center gap-1 text-(--text-faint) text-xs">
                          <span className="material-symbols-outlined text-[14px]">
                            signal_cellular_alt
                          </span>
                          {c.difficulty}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Add Module */}
                <button className="border-2 border-dashed border-(--border-subtle) rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.03)] transition-all group">
                  <div className="w-10 h-10 rounded-full bg-(--glass-bg) flex items-center justify-center text-(--text-muted) group-hover:text-primary-green group-hover:bg-primary-green/10 transition-colors">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <p className="text-(--text-muted) font-medium group-hover:text-primary-green transition-colors">
                    Add New Module
                  </p>
                </button>
              </div>
            </div>

            {/* Message to Students */}
            <div className="pb-10">
              <h2 className="text-(--text-base) text-2xl font-bold mb-5">Introduction Message</h2>
              <div className="bg-(--bg-card) border border-(--border-subtle) rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-4 px-6 py-4 bg-[rgba(13,31,26,0.5)] border-b border-(--border-subtle)">
                  <div className="flex-1">
                    <p className="text-(--text-base) font-bold">Message to Students</p>
                    <p className="text-(--text-faint) text-xs">
                      This will be posted to the classroom feed upon review finalization.
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {["format_bold", "format_italic", "link"].map((ic) => (
                      <button
                        key={ic}
                        className="p-2 text-(--text-muted) hover:text-(--text-base) transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">{ic}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="w-full h-40 bg-transparent border-none focus:ring-0 text-(--text-base) placeholder:text-(--text-faint) resize-none leading-relaxed text-sm outline-none"
                  />
                </div>
                <div className="flex justify-between items-center px-6 py-4 bg-[rgba(13,31,26,0.3)] border-t border-(--border-subtle)">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-green text-[16px]">
                      check_circle
                    </span>
                    <span className="text-(--text-faint) text-xs">Autosaved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-(--text-muted) text-xs mr-2">Markdown supported</span>
                    <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Toast Alert */}
      {!alertDismissed && hasLegacyCourse && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <div className="bg-[rgba(255,191,0,0.08)] border border-[rgba(255,191,0,0.25)] text-amber-400 p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm">
            <span className="material-symbols-outlined text-[22px]">priority_high</span>
            <div className="flex flex-col">
              <p className="text-sm font-bold">Advanced Course Found</p>
              <p className="text-xs opacity-80">
                Toggle authorization status before finalizing review.
              </p>
            </div>
            <button
              onClick={() => setAlertDismissed(true)}
              className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
