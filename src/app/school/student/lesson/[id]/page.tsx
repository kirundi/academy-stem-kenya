"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument, useCollection, useCreateDoc } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import FileUploadButton from "@/components/FileUploadButton";
import { formatFileSize, getFileIcon, FILE_TYPE_LABELS } from "@/lib/file-validation";
import type { Course, Lesson } from "@/lib/types";

const typeColors: Record<string, string> = {
  Video: "#3b82f6",
  Reading: "#8b5cf6",
  "Hands-on": "#2dd4bf",
  Project: "#f59e0b",
  Quiz: "var(--accent-red)",
  Reflection: "#ec4899",
  Submit: "#f59e0b",
};

const typeIcons: Record<string, string> = {
  Video: "play_circle",
  Reading: "menu_book",
  "Hands-on": "construction",
  Project: "science",
  Quiz: "quiz",
  Reflection: "edit_note",
  Submit: "upload_file",
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { appUser } = useAuthContext();

  // Fetch the course document
  const { data: course, loading: courseLoading } = useDocument<Course>("courses", courseId);

  // Fetch lessons subcollection for this course
  const { data: lessons, loading: lessonsLoading } = useCollection<Lesson>(
    "lessons",
    courseId ? [where("courseId", "==", courseId), orderBy("order", "asc")] : [],
    !!courseId
  );

  const { create: createSubmission, loading: submitting } = useCreateDoc("submissions");

  const [activeStep, setActiveStep] = useState(1);
  const [starRating, setStarRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [taskAnswer, setTaskAnswer] = useState("");
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>(["", "", ""]);

  const loading = courseLoading || lessonsLoading;

  // Map lessons to steps format for the UI
  const steps = useMemo(() => {
    if (lessons.length === 0) return [];
    return lessons.map((lesson, index) => ({
      id: index + 1,
      lessonId: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      content: lesson.content ?? "",
      blocks: lesson.blocks ?? [],
      completed: false, // Could be enhanced with submission data
    }));
  }, [lessons]);

  const completedCount = steps.filter((s) => s.completed).length;
  const currentStep = steps[activeStep - 1] ?? null;
  const courseTitle = course?.title ?? "Course";

  const handleSubmit = async () => {
    if (!appUser || !currentStep) return;
    try {
      await createSubmission({
        studentId: appUser.uid,
        courseId,
        lessonId: currentStep.lessonId,
        classroomId: "",
        status: "pending",
        grade: null,
        score: null,
        content: submissionNotes || taskAnswer,
        fileUrl: submissionFileUrl || null,
        submittedAt: new Date(),
        feedback: null,
        rubricScores: {},
        gradedBy: null,
        gradedAt: null,
      });
      await logActivity(
        appUser.uid,
        "submission",
        `Submitted ${courseTitle} - ${currentStep.title}`,
        courseId
      );
      router.push("/school/student/submit-success?course=" + encodeURIComponent(courseTitle));
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Submission failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="material-symbols-outlined text-[48px] text-(--text-faint)">school</span>
        <p className="text-(--text-muted) text-sm">No lessons found for this course.</p>
        <Link
          href="/school/student/dashboard"
          className="text-(--primary-green) text-sm font-semibold hover:underline"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page) flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-14 flex items-center gap-4">
        <Link
          href="/school/student/dashboard"
          className="text-(--text-muted) hover:text-(--text-base) transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-(--text-base) font-bold truncate">{courseTitle}</h1>
          <p className="text-(--text-faint) text-xs">
            Step {activeStep} of {steps.length}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-(--primary-green) to-(--primary-green-dark) rounded-full"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-(--primary-green) text-xs font-bold">
            {completedCount}/{steps.length}
          </span>
        </div>
        <button className="p-2 rounded-lg bg-(--input-bg) text-(--text-muted) hover:text-(--text-base)">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Step Sidebar */}
        <aside className="w-72 bg-(--bg-page) border-r border-(--border-subtle) flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-(--border-subtle)">
            <p className="text-(--text-muted) text-xs font-semibold uppercase tracking-widest mb-1">
              Course Progress
            </p>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-linear-to-r from-(--primary-green) to-(--primary-green-dark) rounded-full"
                style={{ width: `${(completedCount / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-(--text-faint) mt-1.5">
              {completedCount} of {steps.length} steps complete
            </p>
          </div>

          {/* Pro Tip */}
          <div className="mx-3 mt-3 p-3 bg-[rgba(45,212,191,0.05)] border border-(--border-subtle) rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">
                lightbulb
              </span>
              <span className="text-[#f59e0b] text-xs font-bold">Pro Tip</span>
            </div>
            <p className="text-(--text-muted) text-xs leading-relaxed">
              Think about your process as you work — your reflection answers will make your
              portfolio shine!
            </p>
          </div>

          <nav className="flex-1 p-3 space-y-1 mt-1">
            {steps.map((step) => {
              const isCurrent = step.id === activeStep;
              const color = typeColors[step.type] ?? "#2dd4bf";
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[rgba(45,212,191,0.1)] border border-(--border-accent)"
                      : "hover:bg-(--glass-bg)"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      step.completed
                        ? "bg-(--primary-green)"
                        : isCurrent
                          ? "bg-[rgba(45,212,191,0.2)] border-2 border-(--primary-green)"
                          : "bg-white/10"
                    }`}
                  >
                    {step.completed ? (
                      <span className="material-symbols-outlined text-[14px] text-[#10221c]">
                        check
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-(--text-muted)">{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${isCurrent ? "text-(--text-base)" : step.completed ? "text-(--text-muted)" : "text-(--text-faint)"}`}
                    >
                      {step.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${color}18`, color }}
                      >
                        {step.type}
                      </span>
                      <span className="text-[10px] text-(--text-faint)">{step.duration}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Download Guide */}
          <div className="p-3">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-(--border-accent) text-(--primary-green) text-xs font-semibold hover:bg-[rgba(45,212,191,0.06)] transition-colors">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download Guide PDF
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {currentStep && (
            <div className="max-w-3xl mx-auto">
              {/* Step header */}
              <div className="flex items-start gap-3 mb-2 text-(--text-muted) text-sm">
                <Link
                  href="/school/student/dashboard"
                  className="hover:text-(--primary-green) transition-colors"
                >
                  My Courses
                </Link>
                <span>&rsaquo;</span>
                <span>{courseTitle}</span>
                <span>&rsaquo;</span>
                <span className="text-(--text-base)">{currentStep.title}</span>
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${typeColors[currentStep.type] ?? "#2dd4bf"}18` }}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ color: typeColors[currentStep.type] ?? "#2dd4bf" }}
                  >
                    {typeIcons[currentStep.type] ?? "info"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{
                        background: `${typeColors[currentStep.type] ?? "#2dd4bf"}18`,
                        color: typeColors[currentStep.type] ?? "#2dd4bf",
                      }}
                    >
                      {currentStep.type}
                    </span>
                    <span className="text-(--text-faint) text-xs">{currentStep.duration}</span>
                  </div>
                  <h2 className="text-(--text-base) text-2xl font-bold mt-1">{currentStep.title}</h2>
                </div>
              </div>

              {/* ====== READING / VIDEO / HANDS-ON CONTENT ====== */}
              {(currentStep.type === "Reading" ||
                currentStep.type === "Video" ||
                currentStep.type === "Hands-on" ||
                currentStep.type === "Project" ||
                currentStep.type === "Quiz") && (
                <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden mb-8">
                  <div className="p-8">
                    <p className="text-(--text-muted) text-lg leading-relaxed mb-6">
                      {currentStep.content ||
                        "Complete this lesson step to continue your progress."}
                    </p>
                    {currentStep.blocks && currentStep.blocks.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {currentStep.blocks.map((block, i) => (
                          <div key={i}>
                            {block.type === "text" && (
                              <p className="text-(--text-muted) text-sm leading-relaxed">
                                {block.content}
                              </p>
                            )}
                            {block.type === "image" && block.url && (
                              <Image
                                src={block.url}
                                alt={block.content}
                                width={800}
                                height={450}
                                className="rounded-xl max-w-full h-auto"
                              />
                            )}
                            {block.type === "video" && block.url && (
                              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                                <iframe src={block.url} className="w-full h-full" allowFullScreen />
                              </div>
                            )}
                            {block.type === "document" && block.url && (
                              <a
                                href={block.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-(--bg-card) border border-(--border-subtle) rounded-xl hover:border-(--primary-green) transition-colors group"
                              >
                                <div className="w-12 h-12 rounded-xl bg-[rgba(45,212,191,0.1)] flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[24px] text-(--primary-green)">
                                    {getFileIcon(block.fileType || "")}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-(--text-base) font-semibold text-sm truncate">
                                    {block.content}
                                  </p>
                                  <p className="text-(--text-faint) text-xs mt-0.5">
                                    {block.fileType
                                      ? FILE_TYPE_LABELS[block.fileType] || "Document"
                                      : "Document"}
                                    {block.fileSize ? ` · ${formatFileSize(block.fileSize)}` : ""}
                                  </p>
                                </div>
                                <span className="material-symbols-outlined text-(--text-faint) group-hover:text-(--primary-green) transition-colors">
                                  download
                                </span>
                              </a>
                            )}
                            {block.type === "task" && (
                              <div className="bg-[rgba(45,212,191,0.06)] border border-(--border-medium) rounded-xl p-5">
                                <h3 className="text-(--primary-green) font-bold flex items-center gap-2 mb-3">
                                  <span className="material-symbols-outlined text-[20px]">
                                    task_alt
                                  </span>
                                  Task
                                </h3>
                                <p className="text-(--text-muted) text-sm leading-relaxed">
                                  {block.content}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-(--border-subtle) p-6 bg-[rgba(45,212,191,0.03)]">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(45,212,191,0.15)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px] text-(--primary-green)">
                          task_alt
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-(--text-base) font-bold mb-1">Your Task</h4>
                        <p className="text-(--text-muted) text-sm leading-relaxed mb-3">
                          Complete the activity above and write your response below.
                        </p>
                        <textarea
                          rows={3}
                          placeholder="Write your answer here..."
                          className="form-input resize-none"
                          value={taskAnswer}
                          onChange={(e) => setTaskAnswer(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====== REFLECTION STEP ====== */}
              {currentStep.type === "Reflection" && (
                <div className="space-y-6 mb-8">
                  <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-7">
                    <h3 className="text-(--text-base) text-lg font-bold mb-1">Think About Your Process</h3>
                    <p className="text-(--text-muted) text-sm mb-7">
                      Honest reflection helps you grow as a maker and problem-solver. Take your time
                      with each question.
                    </p>
                    <div className="space-y-7">
                      {[
                        {
                          q: "What was the most challenging part of this project?",
                          placeholder: "Describe the biggest obstacle you encountered...",
                        },
                        {
                          q: "How did you solve a problem you encountered?",
                          placeholder: "What steps did you take to work through it...",
                        },
                        {
                          q: "What is one thing you would do differently next time?",
                          placeholder: "If you could restart, what would you change...",
                        },
                      ].map(({ q, placeholder }, i) => (
                        <div key={i}>
                          <label className="block text-(--text-base) font-semibold text-sm mb-2">
                            {i + 1}. {q}
                          </label>
                          <textarea
                            rows={4}
                            placeholder={placeholder}
                            className="form-input resize-none min-h-27.5"
                            value={reflectionAnswers[i]}
                            onChange={(e) => {
                              const updated = [...reflectionAnswers];
                              updated[i] = e.target.value;
                              setReflectionAnswers(updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Star Rating */}
                    <div className="border-t border-(--border-subtle) mt-7 pt-6">
                      <p className="text-(--text-base) font-semibold text-sm mb-3">Self-Assessed Effort</p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onMouseEnter={() => setHoverStar(s)}
                            onMouseLeave={() => setHoverStar(0)}
                            onClick={() => setStarRating(s)}
                            className="transition-transform hover:scale-110"
                          >
                            <span
                              className="material-symbols-outlined text-[32px] transition-colors"
                              style={{
                                color:
                                  s <= (hoverStar || starRating)
                                    ? "#f59e0b"
                                    : "rgba(255,255,255,0.15)",
                                fontVariationSettings:
                                  s <= (hoverStar || starRating) ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          </button>
                        ))}
                        {starRating > 0 && (
                          <span className="text-(--text-muted) text-sm ml-2">
                            {starRating} out of 5 stars
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====== REVIEW & SUBMIT STEP ====== */}
              {currentStep.type === "Submit" && (
                <div className="space-y-6 mb-8">
                  <div className="bg-[rgba(45,212,191,0.04)] border border-(--border-medium) rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="material-symbols-outlined text-(--primary-green) text-[24px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        checklist
                      </span>
                      <h3 className="text-(--text-base) font-bold text-lg">Final Review Checklist</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        `I completed all ${steps.length - 1} steps of this module`,
                        "My work is complete and I have evidence to show it",
                        "I answered all reflection questions thoughtfully",
                        "I rated my own effort honestly",
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded accent-(--primary-green) cursor-pointer"
                          />
                          <span className="text-(--text-muted) text-sm group-hover:text-(--text-base) transition-colors">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-7">
                    <h3 className="text-(--text-base) font-bold text-lg mb-1">Submit Your Work</h3>
                    <p className="text-(--text-muted) text-sm mb-5">
                      Add any final notes or attach a file link before submitting to your teacher
                      for review.
                    </p>
                    <div className="mb-5">
                      <label className="text-(--text-muted) text-xs font-semibold block mb-1.5 uppercase tracking-wide">
                        Additional Notes (optional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Anything else your teacher should know..."
                        className="form-input resize-none"
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                      />
                    </div>
                    <div className="mb-6">
                      <label className="text-(--text-muted) text-xs font-semibold block mb-1.5 uppercase tracking-wide">
                        File / Link (optional)
                      </label>
                      {uploadedFileName ? (
                        <div className="flex items-center gap-3 p-3 bg-(--input-bg) rounded-xl border border-(--border-subtle)">
                          <span className="material-symbols-outlined text-[20px] text-(--primary-green)">
                            check_circle
                          </span>
                          <span className="text-(--text-base) text-sm font-medium flex-1 truncate">
                            {uploadedFileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSubmissionFileUrl("");
                              setUploadedFileName(null);
                            }}
                            className="text-red-400 text-xs font-semibold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <FileUploadButton
                            storagePath={`submissions/${appUser?.uid}`}
                            accept="all"
                            label="Upload File"
                            icon="upload_file"
                            className="bg-[rgba(45,212,191,0.1)] text-(--primary-green) hover:bg-[rgba(45,212,191,0.2)] w-full justify-center"
                            onUploadComplete={(url, file) => {
                              setSubmissionFileUrl(url);
                              setUploadedFileName(file.name);
                            }}
                          />
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-(--border-subtle)" />
                            <span className="text-(--text-faint) text-xs">or paste a link</span>
                            <div className="flex-1 h-px bg-(--border-subtle)" />
                          </div>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            className="form-input"
                            value={submissionFileUrl}
                            onChange={(e) => setSubmissionFileUrl(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-(--primary-green) text-[#10221c] font-bold rounded-xl hover:shadow-[0_0_24px_rgba(45,212,191,0.4)] transition-all hover:scale-[1.01] text-base disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {submitting ? "progress_activity" : "upload_file"}
                      </span>
                      {submitting ? "Submitting..." : "Submit for Review"}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  className="flex items-center gap-2 px-5 py-3 bg-(--input-bg) text-(--text-muted) font-semibold rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  disabled={activeStep === 1}
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Previous Step
                </button>
                <div className="flex items-center gap-1.5">
                  {steps.map((s) => (
                    <div
                      key={s.id}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        s.id === activeStep
                          ? "w-6 bg-(--primary-green)"
                          : s.completed
                            ? "w-2 bg-(--primary-green)/50"
                            : "w-2 bg-white/15"
                      }`}
                      onClick={() => setActiveStep(s.id)}
                    />
                  ))}
                </div>
                {activeStep < steps.length ? (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-(--primary-green) text-[#10221c] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(45,212,191,0.2)]"
                  >
                    Next Step
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-(--primary-green) text-[#10221c] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(45,212,191,0.2)] disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Review & Submit"}
                    <span className="material-symbols-outlined text-[20px]">
                      {submitting ? "progress_activity" : "upload_file"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
