"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCreateDoc, useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Course, Enrollment } from "@/lib/types";

export default function TeacherClassroomPage() {
  const { appUser } = useAuthContext();
  const { classrooms, loading } = useTeacherData();
  const { create: createClassroom, loading: creating } = useCreateDoc("classrooms");

  const [copied, setCopied] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("30");

  const selectedClassroom = classrooms[selectedIdx] ?? null;

  // Fetch courses for the selected classroom
  const courseIds = selectedClassroom?.courseIds ?? [];
  const { data: classroomCourses } = useCollection<Course>(
    "courses",
    courseIds.length > 0 ? [where("__name__", "in", courseIds.slice(0, 10))] : [],
    courseIds.length > 0
  );

  // Fetch enrollments for the selected classroom to get students
  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    selectedClassroom ? [where("classroomId", "==", selectedClassroom.id)] : [],
    !!selectedClassroom
  );

  // Get unique students from enrollments
  const studentMap = new Map<string, Enrollment>();
  enrollments.forEach((e) => {
    if (!studentMap.has(e.studentId)) studentMap.set(e.studentId, e);
  });
  const uniqueStudents = Array.from(studentMap.values());

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSyncGoogleClassroom = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/google-classroom/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      if (appUser) {
        await logActivity(appUser.uid, "sync", "Synced Google Classroom data");
      }
    } catch (err) {
      console.error("Google Classroom sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateClassroom = async () => {
    if (!appUser || !newClassName.trim()) return;
    const joinCode = newClassName.trim().substring(0, 4).toUpperCase() + "-" + Math.random().toString(36).substring(2, 5).toUpperCase();
    await createClassroom({
      name: newClassName.trim(),
      subject: newClassSubject.trim() || "STEM",
      grade: newClassGrade.trim() || "All Grades",
      joinCode,
      schoolId: appUser.schoolId ?? "",
      teacherId: appUser.uid,
      enrolled: 0,
      capacity: parseInt(newClassCapacity) || 30,
      avgProgress: 0,
      courseIds: [],
    });
    await logActivity(appUser.uid, "create_classroom", `Created classroom: ${newClassName.trim()}`);
    setShowCreateModal(false);
    setNewClassName("");
    setNewClassSubject("");
    setNewClassGrade("");
    setNewClassCapacity("30");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Classroom Manager</h1>
          <p className="text-slate-400 text-xs mt-0.5">Configure student access and course visibility</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncGoogleClassroom}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 border border-[rgba(255,255,255,0.1)] text-slate-300 rounded-lg text-sm font-medium hover:border-[rgba(19,236,164,0.3)] hover:text-[#13eca4] transition-all disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${syncing ? "animate-spin" : ""}`}>{syncing ? "progress_activity" : "sync"}</span>
            {syncing ? "Syncing..." : "Sync Google Classroom"}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(19,236,164,0.2)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Class
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Classroom List */}
        <div className="w-80 bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.08)] overflow-y-auto">
          <div className="p-4">
            <input
              type="text"
              placeholder="Search classrooms..."
              className="form-input text-sm"
            />
          </div>
          <div className="px-4 space-y-2">
            {classrooms.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">No classrooms yet. Create one to get started.</div>
            )}
            {classrooms.map((cls, idx) => (
              <button
                key={cls.id}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedIdx === idx
                    ? "bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.2)]"
                    : "bg-[rgba(255,255,255,0.03)] border border-transparent hover:border-[rgba(255,255,255,0.08)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#13eca4] text-[10px] font-bold uppercase tracking-widest">
                    {cls.subject}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      cls.enrolled / cls.capacity > 0.8
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {cls.enrolled}/{cls.capacity}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm">{cls.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <code className="text-xs font-mono text-slate-400">{cls.joinCode}</code>
                </div>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#13eca4] to-[#0dd494] rounded-full"
                    style={{ width: `${cls.avgProgress}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Classroom Detail */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedClassroom ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <span className="material-symbols-outlined text-[48px] mb-4">class</span>
              <p>Select a classroom or create a new one</p>
            </div>
          ) : (
            <div className="max-w-3xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">
                    {selectedClassroom.subject}
                  </span>
                  <h2 className="text-white text-2xl font-bold mt-1">{selectedClassroom.name}</h2>
                </div>
                <button className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-slate-400">
                  <span className="material-symbols-outlined">settings</span>
                </button>
              </div>

              {/* Join Code Card */}
              <div className="flex items-center gap-4 p-5 bg-[rgba(0,0,0,0.2)] rounded-2xl border border-dashed border-[rgba(255,255,255,0.12)] mb-8">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Student Join Code</p>
                  <p className="text-3xl font-mono font-black text-white tracking-widest">
                    {selectedClassroom.joinCode}
                  </p>
                </div>
                <button
                  onClick={() => copyCode(selectedClassroom.joinCode)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(19,236,164,0.1)] text-[#13eca4] rounded-xl text-sm font-semibold hover:bg-[rgba(19,236,164,0.2)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copied === selectedClassroom.joinCode ? "check" : "content_copy"}
                  </span>
                  {copied === selectedClassroom.joinCode ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Course Access Control */}
              <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <h3 className="text-white font-bold">Course Access Control</h3>
                  <Link
                    href="/teacher/courses"
                    className="text-[#13eca4] text-xs font-semibold hover:underline flex items-center gap-1"
                  >
                    Browse all courses
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {classroomCourses.length === 0 && (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm">No courses assigned yet.</div>
                  )}
                  {classroomCourses.map((course) => (
                    <div key={course.id} className="px-6 py-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: course.color || "#13eca4" }}
                        >
                          {course.title.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-300 font-medium text-sm">{course.title}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13eca4]"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-[rgba(0,0,0,0.1)]">
                  <button className="flex items-center gap-2 text-[#13eca4] text-sm font-semibold hover:underline">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add Course to Classroom
                  </button>
                </div>
              </div>

              {/* Students */}
              <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <h3 className="text-white font-bold">
                    Students ({selectedClassroom.enrolled})
                  </h3>
                  <button className="flex items-center gap-2 text-sm font-semibold bg-[rgba(19,236,164,0.1)] text-[#13eca4] px-3 py-1.5 rounded-lg hover:bg-[rgba(19,236,164,0.2)] transition-colors">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Add Student
                  </button>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {uniqueStudents.length === 0 && (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm">No students enrolled yet. Share the join code to get started.</div>
                  )}
                  {uniqueStudents.map((enrollment) => {
                    const initials = enrollment.studentId.slice(0, 2).toUpperCase();
                    return (
                      <div key={enrollment.id} className="px-6 py-3.5 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-[rgba(19,236,164,0.12)] flex items-center justify-center text-xs font-bold text-[#13eca4]">
                          {initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{enrollment.studentId}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#13eca4] to-[#0dd494] rounded-full"
                              style={{ width: `${enrollment.progress ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[#13eca4] text-xs font-bold w-8 text-right">{enrollment.progress ?? 0}%</span>
                        </div>
                        <button className="p-1.5 rounded-lg text-slate-500 hover:text-[#13eca4] hover:bg-[rgba(19,236,164,0.08)] transition-all">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.12)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-1">Create New Classroom</h2>
            <p className="text-slate-400 text-sm mb-5">Set up a new classroom for your students.</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Classroom Name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
              />
              <input
                type="text"
                placeholder="Subject (e.g. Robotics)"
                value={newClassSubject}
                onChange={(e) => setNewClassSubject(e.target.value)}
                className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
              />
              <input
                type="text"
                placeholder="Grade (e.g. Grade 8)"
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
              />
              <input
                type="number"
                placeholder="Capacity (default: 30)"
                value={newClassCapacity}
                onChange={(e) => setNewClassCapacity(e.target.value)}
                className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-[rgba(255,255,255,0.1)] text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:border-[rgba(255,255,255,0.2)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClassroom}
                disabled={creating || !newClassName.trim()}
                className="flex-1 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Classroom"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
