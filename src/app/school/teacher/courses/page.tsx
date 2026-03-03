"use client";

import { useState } from "react";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection } from "@/hooks/useFirestore";
import { where, arrayUnion, arrayRemove, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
          if (nowAssigned && !wasAssigned) {
            await updateDoc(doc(db, "classrooms", c.id), {
              courseIds: arrayUnion(assignModal.courseId),
            });
          } else if (!nowAssigned && wasAssigned) {
            await updateDoc(doc(db, "classrooms", c.id), {
              courseIds: arrayRemove(assignModal.courseId),
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
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
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
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Course Library</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {assignedCount} assigned · Browse and assign to your classrooms
          </p>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
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
                  ? "bg-[#13eca4] text-[#10221c]"
                  : "bg-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white border border-[rgba(255,255,255,0.08)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
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
              className="group bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.25)] hover:shadow-xl hover:shadow-[rgba(19,236,164,0.05)] transition-all flex flex-col overflow-hidden"
            >
              <div
                className="h-2 w-full"
                style={{
                  background: `linear-gradient(90deg, ${course.color || "#13eca4"}, transparent)`,
                }}
              />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${course.color || "#13eca4"}18` }}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ color: course.color || "#13eca4" }}
                    >
                      {course.icon || "menu_book"}
                    </span>
                  </div>
                  {course.assigned && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[rgba(19,236,164,0.1)] text-[#13eca4]">
                      Assigned
                    </span>
                  )}
                </div>

                <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#13eca4] transition-colors">
                  {course.title}
                </h3>
                <p
                  className="text-slate-500 text-xs font-semibold mb-3"
                  style={{ color: course.color || "#13eca4" }}
                >
                  {course.category}
                </p>

                <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                    {course.totalLessons ?? 0} lessons
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: `${course.color || "#13eca4"}18`,
                      color: course.color || "#13eca4",
                    }}
                  >
                    {course.difficulty}
                  </span>
                </div>

                {course.assigned && (
                  <p className="text-slate-500 text-xs mb-4">
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
                        openAssignModal(course.id, course.title, course.color || "#13eca4")
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[rgba(255,255,255,0.06)] text-slate-300 rounded-xl text-sm font-semibold hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Manage Assignment
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        openAssignModal(course.id, course.title, course.color || "#13eca4")
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-lg"
                      style={{
                        background: course.color || "#13eca4",
                        color: "#10221c",
                        boxShadow: `0 4px 15px ${course.color || "#13eca4"}30`,
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
          <div className="bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-base">Assign to Classrooms</h2>
                <p className="text-slate-400 text-xs mt-0.5">{assignModal.courseTitle}</p>
              </div>
              <button
                onClick={() => setAssignModal(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {classrooms.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
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
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelections((prev) => ({ ...prev, [c.id]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#13eca4]"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{c.name}</p>
                        <p className="text-slate-500 text-xs">
                          {c.subject} · Grade {c.grade} · {c.enrolled ?? 0} students
                        </p>
                      </div>
                      {checked && (
                        <span className="text-[#13eca4] text-xs font-bold">Assigned</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[rgba(255,255,255,0.06)] text-slate-300 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
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
