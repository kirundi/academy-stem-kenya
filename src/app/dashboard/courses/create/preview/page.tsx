"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useDocument, useCollection, orderBy } from "@/hooks/useFirestore";
import type { Course, Lesson, LessonBlock } from "@/lib/types";

export default function CourseCreatorPreviewPage() {
  return (
    <Suspense>
      <CourseCreatorPreview />
    </Suspense>
  );
}

function CourseCreatorPreview() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  // Fetch course data
  const { data: course, loading: courseLoading } = useDocument<Course>("courses", courseId);

  // Fetch lessons
  const { data: lessons, loading: lessonsLoading } = useCollection<Lesson>(
    `courses/${courseId}/lessons`,
    [orderBy("order", "asc")],
    !!courseId
  );

  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [reflection, setReflection] = useState("");

  const loading = courseLoading || lessonsLoading;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--bg-page)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[rgba(19,236,164,0.2)] border-t-[#13eca4] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="flex h-screen items-center justify-center bg-(--bg-page) text-(--text-base)">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No course ID provided.</p>
          <Link
            href="/dashboard/courses/create/step1"
            className="text-[#13eca4] hover:underline font-bold"
          >
            Go back to Step 1
          </Link>
        </div>
      </div>
    );
  }

  const activeLesson = lessons?.[activeLessonIdx];
  const completedCount = activeLessonIdx;
  const totalCount = lessons?.length || 1;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Split lessons into modules (group every 5 into a module)
  const moduleSize = 5;
  const module1Lessons = lessons?.slice(0, moduleSize) || [];
  const module2Lessons = lessons?.slice(moduleSize) || [];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-(--bg-page) text-(--text-base)">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[rgba(19,236,164,0.1)] bg-[rgba(16,34,28,0.8)] backdrop-blur-md px-6 py-3 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(19,236,164,0.1)] text-[#13eca4]">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-(--text-base) text-lg font-bold tracking-tight leading-tight">
              Course Creator
            </h2>
            <p className="text-[#13eca4] text-xs font-medium uppercase tracking-widest">
              Student Preview Mode
            </p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Content", href: "/dashboard/content" },
            { label: "Overview", href: "/dashboard" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-slate-400 hover:text-[#13eca4] text-sm font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
              Previewing as
            </span>
            <span className="text-(--text-base) text-xs font-semibold">Demo Student</span>
          </div>
          <Link
            href={`/dashboard/courses/create/step4?courseId=${courseId}`}
            className="flex items-center gap-2 rounded-lg bg-[#13eca4] px-4 py-2 text-[#10221c] text-sm font-bold hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">exit_to_app</span>
            Exit Preview
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex flex-col border-r border-[rgba(19,236,164,0.08)] bg-[rgba(16,34,28,0.5)] overflow-y-auto shrink-0">
          <div className="p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Progress
                </span>
                <span className="text-xs font-bold text-[#13eca4]">{progressPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-(--input-bg)">
                <div
                  className="h-full rounded-full bg-[#13eca4] shadow-[0_0_10px_rgba(19,236,164,0.4)]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-500 font-medium">
                {completedCount} of {totalCount} steps completed
              </p>
            </div>

            {/* Module 1 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-3">
                  {module1Lessons.length > 0 ? "Module 1: Foundations" : "No Lessons Yet"}
                </h3>
                <div className="space-y-1">
                  {module1Lessons.map((lesson, i) => {
                    const isActive = i === activeLessonIdx;
                    const isCompleted = i < activeLessonIdx;
                    const isLocked = i > activeLessonIdx + 1;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => !isLocked && setActiveLessonIdx(i)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-[rgba(19,236,164,0.1)] text-[#13eca4]"
                            : isLocked
                              ? "text-slate-600 cursor-not-allowed opacity-50"
                              : "text-slate-400 hover:bg-[rgba(19,236,164,0.05)]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isActive
                            ? "bolt"
                            : isCompleted
                              ? "check_circle"
                              : isLocked
                                ? "lock"
                                : "radio_button_unchecked"}
                        </span>
                        <span className={isActive ? "font-bold" : "font-medium"}>
                          {i + 1}. {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                  {module1Lessons.length === 0 && (
                    <p className="text-slate-600 text-xs italic px-3">
                      No lessons have been added yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Module 2 */}
              {module2Lessons.length > 0 && (
                <div>
                  <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-3">
                    Module 2: Advanced
                  </h3>
                  <div className="space-y-1 opacity-50">
                    {module2Lessons.map((lesson, i) => {
                      const globalIdx = moduleSize + i;
                      return (
                        <button
                          key={lesson.id}
                          disabled={globalIdx > activeLessonIdx + 1}
                          onClick={() => setActiveLessonIdx(globalIdx)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 cursor-not-allowed text-sm"
                        >
                          <span className="material-symbols-outlined text-lg">lock</span>
                          <span className="font-medium">
                            {globalIdx + 1}. {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="mt-auto p-6 border-t border-[rgba(19,236,164,0.08)]">
            <div className="bg-[rgba(19,236,164,0.05)] rounded-xl p-4 border border-[rgba(19,236,164,0.1)]">
              <div className="flex items-center gap-2 text-[#13eca4] mb-2">
                <span className="material-symbols-outlined text-sm">help</span>
                <span className="text-xs font-bold uppercase tracking-wider">Student Support</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Questions? Contact your facilitator or check the knowledge base.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-(--bg-page) p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[rgba(19,236,164,0.5)] mb-4">
              <span className="text-xs font-bold uppercase tracking-widest">
                {course?.title || "Course"}
              </span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Module {activeLessonIdx < moduleSize ? "1" : "2"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-(--text-base) mb-6 tracking-tight">
              {activeLesson?.title || `Step ${activeLessonIdx + 1}: ${course?.title || "Lesson"}`}
            </h1>

            {/* Lesson Content */}
            {activeLesson?.blocks && activeLesson.blocks.length > 0 ? (
              <div className="space-y-8 mb-10">
                {activeLesson.blocks.map((block: LessonBlock, idx: number) => {
                  if (block.type === "text") {
                    return (
                      <p key={idx} className="text-lg text-slate-400 leading-relaxed">
                        {block.content}
                      </p>
                    );
                  }
                  if (block.type === "image") {
                    return (
                      <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden border border-[rgba(19,236,164,0.15)] bg-[rgba(255,255,255,0.02)] h-75"
                      >
                        {block.url ? (
                          <Image
                            src={block.url}
                            alt={block.content || "Lesson image"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-75 bg-linear-to-br from-[rgba(19,236,164,0.08)] to-[rgba(59,130,246,0.06)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-slate-600 text-8xl">
                              image
                            </span>
                          </div>
                        )}
                        {block.content && (
                          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-[rgba(16,34,28,0.8)] to-transparent p-6">
                            <p className="text-(--text-base) font-bold text-lg">{block.content}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (block.type === "video") {
                    return (
                      <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden border border-[rgba(19,236,164,0.15)] bg-[rgba(255,255,255,0.02)]"
                      >
                        <div className="w-full h-75 bg-linear-to-br from-[rgba(19,236,164,0.08)] to-[rgba(59,130,246,0.06)] flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-600 text-8xl">
                            play_circle
                          </span>
                        </div>
                      </div>
                    );
                  }
                  if (block.type === "task") {
                    let taskData = { title: "", instructions: "" };
                    try {
                      taskData = JSON.parse(block.content);
                    } catch {
                      taskData = { title: "Task", instructions: block.content };
                    }
                    return (
                      <div
                        key={idx}
                        className="bg-[rgba(19,236,164,0.04)] border border-[rgba(19,236,164,0.15)] rounded-2xl p-8"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-[#13eca4] flex items-center justify-center text-[#10221c]">
                            <span className="material-symbols-outlined">task_alt</span>
                          </div>
                          <h3 className="text-xl font-bold text-(--text-base)">{taskData.title}</h3>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">{taskData.instructions}</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                  {course?.description ||
                    "No content has been added to this lesson yet. Go back to the editor to add content blocks."}
                </p>

                {/* Placeholder Image */}
                <div className="relative rounded-2xl overflow-hidden border border-[rgba(19,236,164,0.15)] bg-[rgba(255,255,255,0.02)] mb-10 group h-75">
                  {course?.coverImageUrl ? (
                    <Image
                      src={course.coverImageUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-75 bg-linear-to-br from-[rgba(19,236,164,0.08)] to-[rgba(59,130,246,0.06)] flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-600 text-8xl">
                        precision_manufacturing
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[rgba(16,34,28,0.8)] to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <span className="bg-[rgba(19,236,164,0.2)] text-[#13eca4] text-[10px] font-bold uppercase px-2 py-1 rounded mb-2 inline-block">
                        {course?.category || "STEM"}
                      </span>
                      <h4 className="text-(--text-base) font-bold text-lg">
                        {course?.title || "Course Preview"}
                      </h4>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex items-center justify-center text-(--text-base) hover:bg-[#13eca4] hover:text-[#10221c] transition-colors">
                      <span className="material-symbols-outlined">zoom_in</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Student Reflection */}
            <div className="bg-[rgba(19,236,164,0.04)] border border-[rgba(19,236,164,0.15)] rounded-2xl p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#13eca4] flex items-center justify-center text-[#10221c]">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-(--text-base)">Student Reflection</h3>
                  <p className="text-xs text-slate-400">
                    Share your thoughts to unlock the next step
                  </p>
                </div>
              </div>
              <label className="block mb-4">
                <span className="text-sm font-medium text-slate-300 block mb-2">
                  What did you learn from this lesson? How would you apply this knowledge?
                </span>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full rounded-xl bg-(--bg-page) border border-(--border-subtle) text-slate-200 placeholder:text-(--text-faint) focus:border-[#13eca4] focus:ring-1 focus:ring-[#13eca4] h-32 p-4 outline-none transition-all resize-none"
                />
              </label>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-medium italic">
                  Your response will be shared with your instructor.
                </span>
                <button className="bg-[rgba(19,236,164,0.1)] text-[#13eca4] hover:bg-[#13eca4] hover:text-[#10221c] px-6 py-2 rounded-lg font-bold text-sm transition-all border border-[rgba(19,236,164,0.3)]">
                  Save Reflection
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-[rgba(19,236,164,0.08)] mb-20">
              <button
                onClick={() => setActiveLessonIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeLessonIdx === 0}
                className="flex items-center gap-2 text-slate-400 hover:text-(--text-base) font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Previous Step
              </button>
              <button
                onClick={() =>
                  setActiveLessonIdx((prev) => Math.min((lessons?.length || 1) - 1, prev + 1))
                }
                disabled={activeLessonIdx >= (lessons?.length || 1) - 1}
                className="flex items-center gap-2 bg-[#13eca4] px-8 py-3 rounded-xl text-[#10221c] font-black tracking-wide shadow-[0_0_20px_rgba(19,236,164,0.25)] hover:shadow-[0_0_30px_rgba(19,236,164,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete &amp; Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Hidden Elements Tooltip */}
      <div className="absolute top-20 right-8 w-64 pointer-events-none hidden md:block">
        <div className="bg-[rgba(0,0,0,0.85)] backdrop-blur-sm border border-[rgba(245,158,11,0.3)] rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <span className="material-symbols-outlined text-sm">visibility_off</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Hidden Elements</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            &quot;Facilitation Notes&quot; are hidden in preview mode to provide an authentic
            student experience.
          </p>
        </div>
      </div>
    </div>
  );
}
