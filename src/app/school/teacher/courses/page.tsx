"use client";

import { useState } from "react";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Enrollment } from "@/lib/types";

interface AssignModal {
  courseId: string;
  courseTitle: string;
  courseColor: string;
}

export default function TeacherCoursesPage() {
  const { allCourses, classrooms, loading } = useTeacherData();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState<AssignModal | null>(null);
  const [selections, setSelections] = useState<Record<string, boolean>>({});
  const [assignSaving, setAssignSaving] = useState(false);

  // Get all courseIds assigned to teacher's classrooms
  const assignedCourseIds = new Set(classrooms.flatMap((c) => c.courseIds ?? []));

  // Fetch enrollment counts for assigned courses
  const classroomIds = classrooms.map((c) => c.id);
  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    classroomIds.length > 0 ? [where("classroomId", "in", classroomIds.slice(0, 10))] : [],
    classroomIds.length > 0
  );

  // Count students per course
  const studentsPerCourse = new Map<string, Set<string>>();
  enrollments.forEach((e) => {
    if (!studentsPerCourse.has(e.courseId)) studentsPerCourse.set(e.courseId, new Set());
    studentsPerCourse.get(e.courseId)!.add(e.studentId);
  });

  function openAssignModal(courseId: string, courseTitle: string, courseColor: string) {
    // Pre-populate selections from current classroom state
    const initial: Record<string, boolean> = {};
    classrooms.forEach((c) => {
      initial[c.id] = (c.courseIds ?? []).includes(courseId);
    });
    setSelections(initial);
    setAssignModal({ courseId, courseTitle, courseColor });
  }

  async function saveAssignments() {
    if (!assignModal) return;
    setAssignSaving(true);
    try {
      await Promise.all(
        classrooms.map(async (c) => {
          const wasAssigned = (c.courseIds ?? []).includes(assignModal.courseId);
          const nowAssigned = selections[c.id] ?? false;
          if (nowAssigned !== wasAssigned) {
            await fetch(`/api/classrooms/${c.id}/courses`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                courseId: assignModal.courseId,
                action: nowAssigned ? "add" : "remove",
              }),
            });
          }
        })
      );
      setAssignModal(null);
    } finally {
      setAssignSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  // Build categories from real data
  const allCategories = Array.from(new Set(allCourses.map((c) => c.category).filter(Boolean)));
  const categories = ["All", ...allCategories];

  const courses = allCourses.map((c) => ({
    ...c,
    assigned: assignedCourseIds.has(c.id),
    students: studentsPerCourse.get(c.id)?.size ?? 0,
  }));

  const filtered = courses.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const assignedCount = courses.filter((c) => c.assigned).length;

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Course Library</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {assignedCount} assigned · Browse and assign to your classrooms
          </p>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="form-input pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-(--primary-green) text-[#10221c]"
                  : "bg-(--input-bg) text-(--text-muted) hover:text-(--text-base) border border-(--border-subtle)"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-(--text-faint)">
            <span className="material-symbols-outlined text-[48px] mb-4 block">menu_book</span>
            <p>
              No courses found.{" "}
              {search ? "Try a different search." : "Courses will appear here once added."}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="group bg-(--bg-card) rounded-2xl border border-(--border-subtle) hover:border-[rgba(45,212,191,0.25)] hover:shadow-xl hover:shadow-[rgba(45,212,191,0.05)] transition-all flex flex-col overflow-hidden"
            >
              <div
                className="h-2 w-full"
                style={{
                  background: `linear-gradient(90deg, ${course.color || "#2dd4bf"}, transparent)`,
                }}
              />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${course.color || "#2dd4bf"}18` }}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ color: course.color || "#2dd4bf" }}
                    >
                      {course.icon || "menu_book"}
                    </span>
                  </div>
                  {course.assigned && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[rgba(45,212,191,0.1)] text-(--primary-green)">
                      Assigned
                    </span>
                  )}
                </div>

                <h3 className="text-(--text-base) font-bold text-base mb-1 group-hover:text-(--primary-green) transition-colors">
                  {course.title}
                </h3>
                <p
                  className="text-(--text-faint) text-xs font-semibold mb-3"
                  style={{ color: course.color || "#2dd4bf" }}
                >
                  {course.category}
                </p>

                <div className="flex items-center gap-4 mb-4 text-xs text-(--text-muted)">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                    {course.totalLessons ?? 0} lessons
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: `${course.color || "#2dd4bf"}18`,
                      color: course.color || "#2dd4bf",
                    }}
                  >
                    {course.difficulty}
                  </span>
                </div>

                {course.assigned && (
                  <p className="text-(--text-faint) text-xs mb-4">
                    <span className="material-symbols-outlined text-[14px] align-middle">
                      group
                    </span>{" "}
                    {course.students} student{course.students !== 1 ? "s" : ""} enrolled
                  </p>
                )}

                <div className="mt-auto">
                  {course.assigned ? (
                    <button
                      onClick={() =>
                        openAssignModal(course.id, course.title, course.color || "#2dd4bf")
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-(--input-bg) text-(--text-muted) rounded-xl text-sm font-semibold hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Manage Assignment
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        openAssignModal(course.id, course.title, course.color || "#2dd4bf")
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-lg"
                      style={{
                        background: course.color || "#2dd4bf",
                        color: "#10221c",
                        boxShadow: `0 4px 15px ${course.color || "#2dd4bf"}30`,
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Assign to Classroom
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign to Classroom Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-(--bg-card) border border-(--border-subtle) rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-(--text-base) font-bold text-base">Assign to Classrooms</h2>
                <p className="text-(--text-muted) text-xs mt-0.5">{assignModal.courseTitle}</p>
              </div>
              <button
                onClick={() => setAssignModal(null)}
                className="text-(--text-faint) hover:text-(--text-base) transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-8 text-(--text-faint)">
                <span className="material-symbols-outlined text-[36px] mb-2 block">co_present</span>
                <p className="text-sm">No classrooms yet. Create one first.</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {classrooms.map((c) => {
                  const checked = selections[c.id] ?? false;
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-(--glass-bg) transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelections((prev) => ({ ...prev, [c.id]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-(--primary-green)"
                      />
                      <div className="flex-1">
                        <p className="text-(--text-base) text-sm font-semibold">{c.name}</p>
                        <p className="text-(--text-faint) text-xs">
                          {c.subject} · Grade {c.grade} · {c.enrolled ?? 0} students
                        </p>
                      </div>
                      {checked && (
                        <span className="text-(--primary-green) text-xs font-bold">Assigned</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-(--input-bg) text-(--text-muted) hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={assignSaving || classrooms.length === 0}
                onClick={saveAssignments}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: assignModal.courseColor, color: "#10221c" }}
              >
                {assignSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
