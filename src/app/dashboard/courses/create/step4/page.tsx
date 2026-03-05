"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument, useUpdateDoc, useCollection } from "@/hooks/useFirestore";
import { logActivity } from "@/lib/activity-logger";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Course, Classroom } from "@/lib/types";

const checklistItemsDef = [
  {
    label: "Step instructions completed",
    detail: "All modules have detailed text content.",
    defaultChecked: true,
  },
  { label: "Media assets uploaded", detail: "Images and videos attached.", defaultChecked: true },
  {
    label: "Interactive tasks configured",
    detail: "Tasks and activities configured and validated.",
    defaultChecked: false,
  },
  {
    label: "Course badge assigned",
    detail: "Completion badge selected.",
    defaultChecked: true,
    badge: "military_tech",
  },
];

const metadata = [
  { label: "Target Age", key: "targetGrade" },
  { label: "Estimated Time", key: "estimatedDuration" },
  { label: "Subject Area", key: "category" },
  { label: "Language", value: "English (Global)" },
];

export default function CourseCreatorStep4Page() {
  return (
    <Suspense>
      <CourseCreatorStep4 />
    </Suspense>
  );
}

function CourseCreatorStep4() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { appUser } = useAuthContext();

  const { data: course, loading: courseLoading } = useDocument<Course>("courses", courseId);
  const { update, loading: updating } = useUpdateDoc("courses");

  // Fetch classrooms for assignment
  const { data: allClassrooms, loading: classroomsLoading } =
    useCollection<Classroom>("classrooms");

  const [checklist, setChecklist] = useState(checklistItemsDef.map((c) => c.defaultChecked));
  const [classAssign, setClassAssign] = useState<boolean[]>([]);
  const [submitToLibrary, setSubmitToLibrary] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  // Initialize classroom assignment state when classrooms load
  useEffect(() => {
    if (allClassrooms && allClassrooms.length > 0) {
      setClassAssign(allClassrooms.map(() => false));
    }
  }, [allClassrooms]);

  const handlePublish = async () => {
    if (!courseId || !appUser) return;

    // Verify all checklist items are checked
    const allChecked = checklist.every(Boolean);
    if (!allChecked) {
      setPublishStatus("Error: Please complete all checklist items before publishing.");
      return;
    }

    setPublishing(true);
    setPublishStatus(null);

    try {
      // Update course status to published
      await update(courseId, {
        status: "published",
        publishedAt: new Date().toISOString(),
        publishedBy: appUser.uid,
        submitToLibrary,
      });

      // Assign course to selected classrooms
      const selectedClassrooms = allClassrooms?.filter((_, i) => classAssign[i]) || [];
      for (const classroom of selectedClassrooms) {
        await updateDoc(doc(db, "classrooms", classroom.id), {
          courseIds: arrayUnion(courseId),
        });
      }

      await logActivity(
        appUser.uid,
        "course_published",
        `Published course "${course?.title || courseId}" and assigned to ${selectedClassrooms.length} classroom(s)`,
        courseId
      );

      setPublishStatus("Course published successfully!");

      // Redirect to preview after a short delay
      setTimeout(() => {
        router.push(`/dashboard/courses/create/preview?courseId=${courseId}`);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish course.";
      setPublishStatus(`Error: ${message}`);
    } finally {
      setPublishing(false);
    }
  };

  const classrooms = allClassrooms || [];

  if (courseLoading || classroomsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-page)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--border-accent) border-t-(--primary-green) rounded-full animate-spin" />
          <p className="text-(--text-muted) text-sm">Loading review details...</p>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-page) text-(--text-base)">
        <div className="text-center">
          <p className="text-(--text-muted) mb-4">No course ID provided.</p>
          <Link
            href="/dashboard/courses/create/step1"
            className="text-(--primary-green) hover:underline font-bold"
          >
            Go back to Step 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-(--bg-page) text-(--text-base) overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-(--bg-page) px-10 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-(--primary-green) rounded-lg flex items-center justify-center text-[#10221c]">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">STEM Learn CMS</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Courses", href: "/dashboard/content" },
              { label: "Library", href: "/dashboard/content" },
              { label: "Analytics", href: "/dashboard/reports" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors ${item.label === "Courses" ? "text-(--primary-green)" : "text-(--text-muted) hover:text-(--primary-green)"}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center h-10 bg-(--bg-card) border border-(--border-subtle) rounded-lg overflow-hidden">
            <div className="flex items-center pl-4 text-(--text-faint)">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              placeholder="Search resources..."
              className="bg-transparent border-none focus:ring-0 text-sm text-(--text-base) placeholder:text-(--text-faint) px-3 outline-none w-48"
            />
          </div>
          <span className="material-symbols-outlined text-(--text-muted) hover:text-(--primary-green) cursor-pointer">
            notifications
          </span>
          <div className="w-10 h-10 rounded-full bg-[rgba(45,212,191,0.15)] border-2 border-[rgba(45,212,191,0.25)] flex items-center justify-center text-(--primary-green) font-bold text-sm">
            {appUser?.displayName?.slice(0, 2).toUpperCase() || "TM"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-275 px-6 py-8">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <a href="/dashboard/content" className="text-(--text-faint) hover:text-(--primary-green)">
              Course Creator
            </a>
            <span className="material-symbols-outlined text-(--text-faint) text-xs">chevron_right</span>
            <Link
              href={`/dashboard/courses/create/step3?courseId=${courseId}`}
              className="text-(--text-faint) hover:text-(--primary-green)"
            >
              Step 3: Facilitation Notes
            </Link>
            <span className="material-symbols-outlined text-(--text-faint) text-xs">chevron_right</span>
            <span className="text-(--primary-green) font-medium underline underline-offset-4">
              Step 4: Review &amp; Publish
            </span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-[rgba(255,255,255,0.07)] pb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight mb-2">Review &amp; Publish</h1>
              <p className="text-(--text-muted) text-lg">
                Your course &quot;{course?.title || "Untitled Course"}&quot; is almost ready. Verify
                the checklist and configure access permissions before making it live.
              </p>
            </div>
            <Link
              href={`/dashboard/courses/create/preview?courseId=${courseId}`}
              className="px-6 py-3 rounded-xl border border-(--border-medium) text-(--text-muted) font-bold hover:bg-(--input-bg) transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
              Preview Course
            </Link>
          </div>

          {/* Status Message */}
          {publishStatus && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-2 ${
                publishStatus.startsWith("Error")
                  ? "bg-red-500/10 border border-red-500/30 text-red-400"
                  : "bg-[rgba(45,212,191,0.1)] border border-(--border-strong) text-(--primary-green)"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {publishStatus.startsWith("Error") ? "error" : "check_circle"}
              </span>
              {publishStatus}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Checklist + Metadata */}
            <div className="lg:col-span-7 space-y-8">
              {/* Checklist */}
              <section className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.07)]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-(--primary-green)">fact_check</span>
                  Course Summary Checklist
                </h2>
                <div className="space-y-4">
                  {checklistItemsDef.map((item, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-(--bg-card) border border-(--border-subtle) hover:border-(--border-strong) cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={checklist[i]}
                        onChange={(e) =>
                          setChecklist((prev) =>
                            prev.map((v, j) => (j === i ? e.target.checked : v))
                          )
                        }
                        className="h-5 w-5 rounded border-(--border-accent) text-(--primary-green) focus:ring-(--primary-green) bg-(--input-bg)"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="text-(--text-base) font-medium">{item.label}</span>
                        <span
                          className={`text-xs mt-0.5 ${checklist[i] ? "text-(--primary-green)" : "text-(--text-faint)"}`}
                        >
                          {item.detail}
                        </span>
                      </div>
                      {item.badge && (
                        <div className="w-10 h-10 bg-[rgba(45,212,191,0.1)] rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-(--primary-green)">
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </section>

              {/* Metadata */}
              <section className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.07)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-(--primary-green)">analytics</span>
                  Course Metadata
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {metadata.map((m) => (
                    <div key={m.label} className="p-3 bg-(--bg-card) rounded-lg">
                      <p className="text-(--text-faint) text-xs uppercase font-bold tracking-widest mb-1">
                        {m.label}
                      </p>
                      <p className="text-(--text-base) font-semibold text-sm">
                        {m.value ||
                          (m.key && course
                            ? String(course[m.key as keyof Course] ?? "N/A")
                            : "N/A") ||
                          "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Access Control + Publish */}
            <div className="lg:col-span-5 space-y-8">
              <section className="bg-(--bg-card) rounded-2xl p-8 border-2 border-(--border-medium) shadow-xl shadow-[rgba(45,212,191,0.04)]">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-(--primary-green)">shield_person</span>
                  Access Control
                </h2>
                <div className="space-y-6">
                  {/* Assign to Classrooms */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-(--text-muted) uppercase tracking-wide block">
                      Assign to Classrooms
                    </label>
                    <div className="space-y-2">
                      {classrooms.length > 0 ? (
                        classrooms.map((cls, i) => (
                          <div
                            key={cls.id}
                            className="flex items-center justify-between p-3 bg-(--glass-bg) rounded-xl border border-(--border-subtle)"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[rgba(45,212,191,0.6)]">
                                groups
                              </span>
                              <div>
                                <span className="text-(--text-base) font-medium text-sm block">
                                  {cls.name}
                                </span>
                                <span className="text-(--text-faint) text-[10px]">
                                  {cls.subject} - {cls.grade}
                                </span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={classAssign[i] || false}
                              onChange={(e) =>
                                setClassAssign((prev) =>
                                  prev.map((v, j) => (j === i ? e.target.checked : v))
                                )
                              }
                              className="h-5 w-5 rounded border-(--border-accent) text-(--primary-green) focus:ring-(--primary-green) bg-(--input-bg)"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-(--text-faint) text-sm italic p-3">
                          No classrooms found. Create a classroom first.
                        </p>
                      )}
                      <button className="w-full py-2 border-2 border-dashed border-(--border-subtle) rounded-xl text-(--text-faint) hover:text-(--primary-green) hover:border-[rgba(45,212,191,0.4)] text-sm font-medium transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Add More Classes
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-(--input-bg)" />

                  {/* Submit to Library */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={submitToLibrary}
                      onChange={(e) => setSubmitToLibrary(e.target.checked)}
                      className="h-6 w-6 rounded-full border-(--border-accent) text-(--primary-green) focus:ring-(--primary-green) bg-(--input-bg)"
                    />
                    <div className="flex flex-col">
                      <span className="text-(--text-base) font-semibold">Submit to School Library</span>
                      <span className="text-(--text-muted) text-xs">
                        Allow other teachers to clone and adapt this course.
                      </span>
                    </div>
                  </label>

                  {/* Publish Button */}
                  <div className="pt-6">
                    <button
                      onClick={handlePublish}
                      disabled={publishing || updating}
                      className="w-full bg-(--primary-green) hover:opacity-90 text-[#10221c] font-black text-xl py-5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-[rgba(45,212,191,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {publishing ? (
                        <>
                          <div className="w-6 h-6 border-3 border-[#10221c]/30 border-t-[#10221c] rounded-full animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined font-bold">cloud_upload</span>
                          Publish Course
                        </>
                      )}
                    </button>
                    <p className="text-center text-(--text-faint) text-xs mt-4 italic">
                      By clicking publish, you agree to the school&apos;s digital curriculum
                      guidelines.
                    </p>
                  </div>
                </div>
              </section>

              {/* Course Preview Card */}
              <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6">
                <p className="text-(--text-faint) text-xs font-bold uppercase tracking-widest mb-4">
                  Course Preview Card
                </p>
                <div className="bg-(--bg-card) rounded-xl overflow-hidden border border-(--border-subtle) shadow-xl">
                  <div className="h-32 bg-linear-to-br from-[rgba(45,212,191,0.3)] to-[rgba(45,212,191,0.05)] relative">
                    {course?.coverImageUrl ? (
                      <Image
                        src={course.coverImageUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                    <div className="absolute bottom-4 left-4 w-14 h-14 bg-(--bg-page) rounded-xl flex items-center justify-center border border-[rgba(45,212,191,0.25)]">
                      <span className="material-symbols-outlined text-(--primary-green) text-3xl">
                        {course?.icon || "precision_manufacturing"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-(--text-base) font-bold">{course?.title || "Untitled Course"}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-(--bg-elevated) flex items-center justify-center">
                        <span className="material-symbols-outlined text-[12px] text-(--primary-green)">
                          person
                        </span>
                      </div>
                      <span className="text-(--text-muted) text-xs">
                        {appUser?.displayName || "Teacher"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <span className="px-2 py-1 bg-[rgba(45,212,191,0.1)] text-(--primary-green) text-[10px] font-bold rounded uppercase">
                        {course?.difficulty || "Beginner"}
                      </span>
                      <span className="px-2 py-1 bg-(--input-bg) text-(--text-muted) text-[10px] font-bold rounded uppercase">
                        {course?.category || "STEM"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-8 px-10 bg-(--bg-page) mt-12">
        <div className="max-w-275 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-(--text-faint)">
            <span className="material-symbols-outlined">copyright</span>
            <span className="text-sm font-medium">2026 STEM Learn Platforms Inc.</span>
          </div>
          <div className="flex gap-8">
            {[
              { label: "Documentation", href: "/help" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Support Center", href: "/contact" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-(--text-faint) hover:text-(--primary-green) text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
