"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument, useCollection, orderBy } from "@/hooks/useFirestore";
import { useFileUpload } from "@/hooks/useFileUpload";
import { logActivity } from "@/lib/activity-logger";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Course, Lesson, LessonBlock } from "@/lib/types";

export default function CourseCreatorStep2Page() {
  return <Suspense><CourseCreatorStep2 /></Suspense>;
}

function CourseCreatorStep2() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { appUser } = useAuthContext();
  const { uploadFile, uploading, progress } = useFileUpload();

  // Fetch the course
  const { data: course, loading: courseLoading } = useDocument<Course>("courses", courseId);

  // Fetch existing lessons for this course
  const { data: lessons, loading: lessonsLoading } = useCollection<Lesson>(
    `courses/${courseId}/lessons`,
    [orderBy("order", "asc")],
    !!courseId
  );

  // Active lesson index
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Block editor state for current lesson
  const [blocks, setBlocks] = useState<LessonBlock[]>([
    { type: "text", content: "" },
  ]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [taskType, setTaskType] = useState("Short Answer / Reflection");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskRequired, setTaskRequired] = useState(true);
  const [taskGraded, setTaskGraded] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // When lessons load, populate active lesson data
  useEffect(() => {
    if (lessons && lessons.length > 0 && lessons[activeLessonIdx]) {
      const lesson = lessons[activeLessonIdx];
      setLessonTitle(lesson.title || "");
      setBlocks(lesson.blocks?.length ? lesson.blocks : [{ type: "text", content: "" }]);
    }
  }, [lessons, activeLessonIdx]);

  const handleAddBlock = (type: LessonBlock["type"]) => {
    setBlocks((prev) => [...prev, { type, content: "" }]);
  };

  const handleBlockChange = (index: number, content: string) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, content } : b)));
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const newBlocks = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newBlocks.length) return prev;
      [newBlocks[index], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[index]];
      return newBlocks;
    });
  };

  const handleSaveLesson = async () => {
    if (!courseId || !appUser) return;

    setSavingLesson(true);
    setSaveStatus(null);

    try {
      // Build task block if task content exists
      const allBlocks = [...blocks];
      if (taskTitle.trim()) {
        allBlocks.push({
          type: "task",
          content: JSON.stringify({
            title: taskTitle,
            instructions: taskInstructions,
            taskType,
            required: taskRequired,
            graded: taskGraded,
          }),
        });
      }

      const lessonData = {
        courseId,
        title: lessonTitle || `Lesson ${(lessons?.length || 0) + 1}`,
        type: "Reading" as const,
        duration: "30 min",
        order: lessons?.length || 0,
        content: blocks.filter((b) => b.type === "text").map((b) => b.content).join("\n\n"),
        blocks: allBlocks,
      };

      // If editing an existing lesson
      if (lessons && lessons[activeLessonIdx]) {
        await updateDoc(doc(db, `courses/${courseId}/lessons`, lessons[activeLessonIdx].id), {
          ...lessonData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new lesson in subcollection
        await addDoc(collection(db, `courses/${courseId}/lessons`), {
          ...lessonData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Update course totalLessons count
      await updateDoc(doc(db, "courses", courseId), {
        totalLessons: (lessons?.length || 0) + 1,
        updatedAt: serverTimestamp(),
      });

      await logActivity(
        appUser.uid,
        "lesson_saved",
        `Saved lesson "${lessonData.title}" for course`,
        courseId
      );

      setSaveStatus("Lesson saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save lesson.";
      setSaveStatus(`Error: ${message}`);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleAddNewStep = async () => {
    if (!courseId) return;

    try {
      await addDoc(collection(db, `courses/${courseId}/lessons`), {
        courseId,
        title: `New Step ${(lessons?.length || 0) + 1}`,
        type: "Reading",
        duration: "30 min",
        order: lessons?.length || 0,
        content: "",
        blocks: [{ type: "text", content: "" }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Switch to the new lesson
      setActiveLessonIdx(lessons?.length || 0);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Failed to add step:", err);
    }
  };

  const handleImageUpload = async (blockIndex: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !courseId) return;
      try {
        const url = await uploadFile(file, `courses/${courseId}/images/${Date.now()}_${file.name}`);
        setBlocks((prev) =>
          prev.map((b, i) => (i === blockIndex ? { ...b, url, content: file.name } : b))
        );
      } catch (err) {
        if (process.env.NODE_ENV === "development") console.error("Image upload failed:", err);
      }
    };
    input.click();
  };

  if (courseLoading || lessonsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#10221c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[rgba(19,236,164,0.2)] border-t-[#13eca4] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#10221c] text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No course ID provided.</p>
          <Link href="/course-creator/step1" className="text-[#13eca4] hover:underline font-bold">
            Go back to Step 1
          </Link>
        </div>
      </div>
    );
  }

  const lessonSteps = lessons?.length
    ? lessons.map((l, i) => ({
        label: `${i + 1}. ${l.title}`,
        active: i === activeLessonIdx,
      }))
    : [{ label: "1. New Lesson", active: true }];

  return (
    <div className="flex h-screen flex-col bg-[#10221c] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#10221c] px-8 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#13eca4] rounded-lg flex items-center justify-center text-[#10221c]">
            <span className="material-symbols-outlined font-bold text-[18px]">account_tree</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            STEM Learner <span className="text-[#13eca4]/70 font-normal">Admin</span>
          </h2>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Dashboard", href: "/teacher/dashboard" },
              { label: "Curriculum", href: "/teacher/courses" },
              { label: "Students", href: "/teacher/classroom" },
              { label: "Grading", href: "/teacher/grading" },
            ].map((item) => (
              <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors ${item.label === "Curriculum" ? "text-[#13eca4] border-b-2 border-[#13eca4] pb-1" : "text-slate-400 hover:text-[#13eca4]"}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
          <div className="flex gap-3">
            <Link href={`/course-creator/preview?courseId=${courseId}`} className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[rgba(255,255,255,0.08)] text-white text-sm font-bold hover:bg-[rgba(255,255,255,0.12)] transition-colors">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Preview
            </Link>
            <Link href={`/course-creator/step3?courseId=${courseId}`} className="h-10 px-4 rounded-lg bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity flex items-center">
              Next: Facilitation
            </Link>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] border border-[rgba(19,236,164,0.3)] flex items-center justify-center text-[#13eca4] font-bold text-sm">
            {appUser?.displayName?.slice(0, 2).toUpperCase() || "TM"}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Steps */}
        <aside className="w-72 border-r border-[rgba(255,255,255,0.08)] bg-[#10221c] flex flex-col shrink-0">
          <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Lesson Steps</h3>
              <span className="text-[10px] bg-[rgba(19,236,164,0.15)] text-[#13eca4] px-2 py-0.5 rounded-full font-bold">
                {lessons?.length || 0} STEPS
              </span>
            </div>
            <p className="text-xs text-slate-500">Click to select a lesson to edit</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {lessonSteps.map((s, i) => (
              <div
                key={i}
                onClick={() => setActiveLessonIdx(i)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  s.active
                    ? "bg-[rgba(19,236,164,0.08)] border border-[rgba(19,236,164,0.25)] text-[#13eca4]"
                    : "hover:bg-[rgba(255,255,255,0.04)] text-slate-400"
                }`}
              >
                <span className="material-symbols-outlined text-lg">drag_indicator</span>
                <span className={`text-sm ${s.active ? "font-bold" : "font-medium"}`}>{s.label}</span>
                {s.active && <span className="ml-auto material-symbols-outlined text-sm">edit</span>}
              </div>
            ))}
            <button
              onClick={handleAddNewStep}
              className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.1)] text-slate-500 hover:border-[rgba(19,236,164,0.4)] hover:text-[#13eca4] transition-all mt-4 group"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_circle</span>
              <span className="text-sm font-medium">Add New Step</span>
            </button>
          </div>
          <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>{saveStatus || (savingLesson ? "Saving..." : "Ready to edit")}</span>
              <span className={`material-symbols-outlined text-sm ${savingLesson ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
                {savingLesson ? "sync" : "cloud_done"}
              </span>
            </div>
            <button
              onClick={handleSaveLesson}
              disabled={savingLesson}
              className="w-full py-2 bg-[rgba(255,255,255,0.06)] rounded text-xs font-bold hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingLesson ? "Saving..." : "Save Lesson"}
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-4">
              <span>Curriculum</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span>{course?.title || "Course"}</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-[#13eca4]">Step {activeLessonIdx + 1}: {lessonTitle || "New Lesson"}</span>
            </div>

            {/* Step Header */}
            <div className="flex items-center justify-between mb-8">
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Enter lesson title..."
                className="text-3xl font-bold tracking-tight bg-transparent border-none outline-none text-white placeholder-slate-600 w-full"
              />
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-slate-400 transition-colors" title="Settings">
                  <span className="material-symbols-outlined">settings</span>
                </button>
                <button className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-slate-400 transition-colors" title="Duplicate">
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            </div>

            {/* Blocks */}
            <div className="space-y-6 pb-24">
              {blocks.map((block, idx) => {
                if (block.type === "text") {
                  return (
                    <div key={idx} className="group relative bg-[#1a2e27] rounded-xl p-6 border border-transparent hover:border-[rgba(19,236,164,0.3)] transition-all">
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-base">notes</span>
                        Text Content (Markdown)
                      </div>
                      <textarea
                        rows={3}
                        value={block.content}
                        onChange={(e) => handleBlockChange(idx, e.target.value)}
                        placeholder="Enter text content here..."
                        className="w-full bg-transparent border-none focus:ring-0 text-base leading-relaxed resize-none p-0 text-slate-200 placeholder-slate-600 outline-none"
                      />
                      {/* Block controls */}
                      <div className="absolute -right-3 top-3 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        <button onClick={() => handleMoveBlock(idx, "up")} className="p-1.5 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded text-slate-500 hover:text-[#13eca4]">
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                        </button>
                        <button className="p-1.5 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded text-slate-500 hover:text-[#13eca4] cursor-move">
                          <span className="material-symbols-outlined text-sm">drag_indicator</span>
                        </button>
                        <button onClick={() => handleMoveBlock(idx, "down")} className="p-1.5 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded text-slate-500 hover:text-[#13eca4]">
                          <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                if (block.type === "image") {
                  return (
                    <div key={idx} className="group relative bg-[#1a2e27] rounded-xl p-6 border border-transparent hover:border-[rgba(19,236,164,0.3)] transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="material-symbols-outlined text-base">image</span>
                          Visual Media
                        </div>
                        <button
                          onClick={() => handleImageUpload(idx)}
                          className="text-xs text-[#13eca4] font-bold hover:underline"
                        >
                          {block.url ? "Replace Image" : "Upload Image"}
                        </button>
                      </div>
                      <div className="relative rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)] group/img h-48">
                        {block.url ? (
                          <Image src={block.url} alt={block.content || "Lesson image"} fill className="object-cover" />
                        ) : (
                          <div
                            onClick={() => handleImageUpload(idx)}
                            className="w-full h-48 bg-linear-to-br from-[rgba(19,236,164,0.1)] to-[rgba(59,130,246,0.1)] flex items-center justify-center cursor-pointer"
                          >
                            {uploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 border-3 border-[rgba(19,236,164,0.2)] border-t-[#13eca4] rounded-full animate-spin" />
                                <span className="text-sm text-[#13eca4]">{progress}%</span>
                              </div>
                            ) : (
                              <span className="material-symbols-outlined text-slate-600 text-5xl">image</span>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleBlockChange(idx, e.target.value)}
                        placeholder="Add a caption for this image..."
                        className="w-full mt-4 bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#13eca4] focus:ring-0 text-sm italic text-slate-500 p-1 outline-none transition-colors"
                      />
                    </div>
                  );
                }

                if (block.type === "video") {
                  return (
                    <div key={idx} className="group relative bg-[#1a2e27] rounded-xl p-6 border border-transparent hover:border-[rgba(19,236,164,0.3)] transition-all">
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-base">smart_display</span>
                        Video Embed
                      </div>
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => handleBlockChange(idx, e.target.value)}
                        placeholder="Paste video URL (YouTube, Vimeo)..."
                        className="w-full bg-transparent border-b border-[rgba(255,255,255,0.1)] focus:border-[#13eca4] text-sm text-slate-300 p-2 outline-none transition-colors"
                      />
                    </div>
                  );
                }

                return null;
              })}

              {/* Task Block */}
              <div className="group relative bg-[rgba(19,236,164,0.04)] rounded-xl p-6 border-2 border-dashed border-[rgba(19,236,164,0.25)] hover:border-[rgba(19,236,164,0.5)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#13eca4] uppercase tracking-widest">
                    <span className="material-symbols-outlined text-base">task_alt</span>
                    Student Task: Reflection
                  </div>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="bg-[#1a2e27] border border-[rgba(255,255,255,0.1)] rounded text-xs text-slate-200 focus:ring-[#13eca4] py-1 px-2 outline-none"
                  >
                    <option>Short Answer / Reflection</option>
                    <option>File Upload</option>
                    <option>Code Link (GitHub)</option>
                    <option>Multiple Choice</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task Title"
                    className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold p-0 text-white placeholder-[rgba(19,236,164,0.4)] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={taskInstructions}
                    onChange={(e) => setTaskInstructions(e.target.value)}
                    placeholder="Task instructions for the student..."
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-400 p-0 resize-none outline-none"
                  />
                  <div className="flex items-center justify-between pt-4 border-t border-[rgba(19,236,164,0.15)]">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={taskRequired}
                          onChange={(e) => setTaskRequired(e.target.checked)}
                          className="rounded border-[rgba(255,255,255,0.2)] text-[#13eca4] focus:ring-[#13eca4] bg-[#1a2e27]"
                        />
                        <span className="text-xs text-slate-400">Required to complete</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={taskGraded}
                          onChange={(e) => setTaskGraded(e.target.checked)}
                          className="rounded border-[rgba(255,255,255,0.2)] text-[#13eca4] focus:ring-[#13eca4] bg-[#1a2e27]"
                        />
                        <span className="text-xs text-slate-400">Graded task</span>
                      </label>
                    </div>
                    <span className="text-xs text-[#13eca4] font-bold">5 Points</span>
                  </div>
                </div>
              </div>

              {/* Block Inserter */}
              <div className="flex items-center justify-center py-4 relative">
                <div className="absolute inset-x-0 h-px bg-[rgba(255,255,255,0.06)]" />
                <div className="relative flex gap-3 bg-[#10221c] px-4">
                  {[
                    { icon: "text_fields", label: "Text",     type: "text" as const,  primary: false },
                    { icon: "image",        label: "Image",    type: "image" as const, primary: false },
                    { icon: "smart_display",label: "Video",    type: "video" as const, primary: false },
                    { icon: "add_task",     label: "Add Task", type: "task" as const,  primary: true  },
                  ].map((b) => (
                    <button
                      key={b.label}
                      onClick={() => handleAddBlock(b.type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        b.primary
                          ? "bg-[rgba(19,236,164,0.15)] border border-[rgba(19,236,164,0.3)] text-[#13eca4] hover:bg-[rgba(19,236,164,0.25)]"
                          : "bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] text-slate-400 hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(19,236,164,0.3)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{b.icon}</span>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
