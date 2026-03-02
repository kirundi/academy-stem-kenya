"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCreateDoc, useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Course, Enrollment } from "@/lib/types";

interface RosterStudent {
  id: string;
  displayName: string;
  studentCode: string;
  age?: number;
  grade?: string;
  xp?: number;
  level?: number;
}

type Tab = "roster" | "curriculum" | "insights";

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
  const [activeTab, setActiveTab] = useState<Tab>("roster");

  // Add Student modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAge, setNewStudentAge] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [addStudentError, setAddStudentError] = useState("");
  const [createdStudentCode, setCreatedStudentCode] = useState("");

  // Roster students (fetched from API with real names/codes)
  const [rosterStudents, setRosterStudents] = useState<RosterStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const selectedClassroom = classrooms[selectedIdx] ?? null;

  const courseIds = selectedClassroom?.courseIds ?? [];
  const { data: classroomCourses } = useCollection<Course>(
    "courses",
    courseIds.length > 0 ? [where("__name__", "in", courseIds.slice(0, 10))] : [],
    courseIds.length > 0
  );

  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    selectedClassroom ? [where("classroomId", "==", selectedClassroom.id)] : [],
    !!selectedClassroom
  );

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
      if (process.env.NODE_ENV === "development")
        console.error("Google Classroom sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateClassroom = async () => {
    if (!appUser || !newClassName.trim()) return;
    const joinCode =
      newClassName.trim().substring(0, 4).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 5).toUpperCase();
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

  const fetchRosterStudents = useCallback(async (classroomId: string) => {
    setRosterLoading(true);
    try {
      const res = await fetch(`/api/students?classroomId=${classroomId}`);
      if (res.ok) {
        const data = await res.json();
        setRosterStudents(data.students ?? []);
      }
    } catch {
      // silently fail — enrollment-based roster is fallback
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassroom?.id) {
      fetchRosterStudents(selectedClassroom.id);
    } else {
      setRosterStudents([]);
    }
  }, [selectedClassroom?.id, fetchRosterStudents]);

  const handleAddStudent = async () => {
    if (!appUser || !selectedClassroom || !newStudentName.trim()) return;
    setAddingStudent(true);
    setAddStudentError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: newStudentName.trim(),
          age: newStudentAge ? parseInt(newStudentAge) : undefined,
          grade: newStudentGrade.trim() || undefined,
          classroomId: selectedClassroom.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");
      setCreatedStudentCode(data.student.studentCode);
      await fetchRosterStudents(selectedClassroom.id);
    } catch (err) {
      setAddStudentError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingStudent(false);
    }
  };

  const resetAddStudentModal = () => {
    setShowAddStudentModal(false);
    setNewStudentName("");
    setNewStudentAge("");
    setNewStudentGrade("");
    setAddStudentError("");
    setCreatedStudentCode("");
  };

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
    <div className="min-h-screen bg-[#10221c] flex h-screen overflow-hidden">
      {/* Classroom List Sidebar */}
      <div className="w-72 bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.08)] flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-[rgba(19,236,164,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Classrooms
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#13eca4] bg-[rgba(19,236,164,0.1)] px-2 py-1 rounded-lg hover:bg-[rgba(19,236,164,0.2)] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search classrooms..."
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(19,236,164,0.3)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {classrooms.length === 0 && (
            <p className="text-center py-8 text-slate-500 text-sm px-4">
              No classrooms yet. Create one to get started.
            </p>
          )}
          {classrooms.map((cls, idx) => (
            <button
              key={cls.id}
              onClick={() => {
                setSelectedIdx(idx);
                setActiveTab("roster");
              }}
              className={`w-full text-left p-3.5 rounded-xl transition-all ${
                selectedIdx === idx
                  ? "bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.2)]"
                  : "bg-[rgba(255,255,255,0.02)] border border-transparent hover:border-[rgba(255,255,255,0.06)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#13eca4] text-[10px] font-bold uppercase tracking-widest truncate max-w-30">
                  {cls.subject}
                </span>
                <span className="text-[10px] font-bold text-slate-500 shrink-0">
                  {cls.enrolled}/{cls.capacity}
                </span>
              </div>
              <p className="text-white text-sm font-semibold truncate">{cls.name}</p>
              <p className="text-slate-500 text-xs font-mono mt-0.5">{cls.joinCode}</p>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full"
                  style={{ width: `${cls.avgProgress}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Detail Area */}
      <div className="flex-1 overflow-y-auto">
        {!selectedClassroom ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <span className="material-symbols-outlined text-[48px] mb-4">class</span>
            <p>Select a classroom or create a new one</p>
          </div>
        ) : (
          <div className="px-8 py-8 max-w-5xl mx-auto">
            {/* Classroom Header */}
            <div className="flex flex-wrap justify-between items-start gap-6 mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13eca4] text-4xl">
                    smart_toy
                  </span>
                  <h1 className="text-slate-100 text-3xl font-black leading-tight tracking-tight">
                    {selectedClassroom.name}
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {/* Join Code Display */}
                    <div className="flex items-center gap-2 text-slate-400 bg-[#1a2e27] px-3 py-1.5 rounded-lg w-fit border border-[rgba(19,236,164,0.1)]">
                      <span className="text-xs font-bold uppercase tracking-wider">Join Code:</span>
                      <span className="text-[#13eca4] font-mono font-bold tracking-widest text-lg">
                        {selectedClassroom.joinCode}
                      </span>
                      <button
                        onClick={() => copyCode(selectedClassroom.joinCode)}
                        className="ml-2 hover:text-[#13eca4] transition-colors"
                        title="Copy Code"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copied === selectedClassroom.joinCode ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                    {/* Admin Assigned Badge */}
                    <div className="relative group flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Admin Assigned
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic flex items-center gap-1 ml-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Managed by School Administration Office
                  </p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSyncGoogleClassroom}
                  disabled={syncing}
                  className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[rgba(19,236,164,0.2)] disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-lg ${syncing ? "animate-spin" : ""}`}
                  >
                    {syncing ? "progress_activity" : "sync"}
                  </span>
                  {syncing ? "Syncing..." : "Sync with Google Classroom"}
                </button>
                <button className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-[#1a2e27] text-slate-100 text-sm font-bold border border-[rgba(19,236,164,0.1)] hover:border-[rgba(19,236,164,0.3)] transition-colors">
                  <span className="material-symbols-outlined text-lg">move_to_inbox</span>
                  Request Code Change
                </button>
                <button className="flex items-center justify-center gap-2 rounded-lg h-11 px-4 bg-[#1a2e27] text-slate-400 text-sm font-bold border border-[rgba(19,236,164,0.1)] hover:border-[rgba(19,236,164,0.3)] transition-colors">
                  <span className="material-symbols-outlined text-lg">settings</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-[rgba(19,236,164,0.08)]">
              <div className="flex gap-8">
                {(["roster", "curriculum", "insights"] as Tab[]).map((tab) => {
                  const icons: Record<Tab, string> = {
                    roster: "group",
                    curriculum: "menu_book",
                    insights: "insights",
                  };
                  const labels: Record<Tab, string> = {
                    roster: "Roster",
                    curriculum: "Curriculum",
                    insights: "Insights",
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 pb-3 pt-2 border-b-2 transition-all text-sm font-bold ${
                        activeTab === tab
                          ? "border-[#13eca4] text-[#13eca4]"
                          : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{icons[tab]}</span>
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Roster Tab */}
            {activeTab === "roster" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    Class Roster{" "}
                    <span className="text-slate-500 font-normal text-sm ml-2">
                      ({selectedClassroom.enrolled} Students)
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="flex items-center gap-2 text-[#13eca4] bg-[rgba(19,236,164,0.1)] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[rgba(19,236,164,0.2)] transition-all"
                  >
                    <span className="material-symbols-outlined">person_add</span>
                    Add Student
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-[rgba(19,236,164,0.08)] bg-[#1a2e27]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[rgba(0,0,0,0.2)] border-b border-[rgba(19,236,164,0.08)]">
                          <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider text-center">
                            Status
                          </th>
                          <th className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                        {rosterLoading ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-slate-500 text-sm"
                            >
                              <span className="material-symbols-outlined animate-spin text-2xl text-[#13eca4]">
                                progress_activity
                              </span>
                            </td>
                          </tr>
                        ) : rosterStudents.length === 0 && uniqueStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-slate-500 text-sm"
                            >
                              No students yet. Click &quot;Add Student&quot; to create one.
                            </td>
                          </tr>
                        ) : rosterStudents.length > 0 ? (
                          rosterStudents.map((student) => {
                            const initials = student.displayName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2);
                            return (
                              <tr
                                key={student.id}
                                className="hover:bg-[rgba(19,236,164,0.02)] transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center text-[#13eca4] font-bold text-xs">
                                      {initials}
                                    </div>
                                    <span className="text-slate-100 font-medium">
                                      {student.displayName}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#13eca4] font-mono font-bold tracking-wider text-sm">
                                      {student.studentCode}
                                    </span>
                                    <button
                                      onClick={() => copyCode(student.studentCode)}
                                      className="text-slate-500 hover:text-[#13eca4] transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {copied === student.studentCode ? "check" : "content_copy"}
                                      </span>
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                                  {student.grade || "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  {(student.xp ?? 0) > 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                      New
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => copyCode(student.studentCode)}
                                    className="text-[#13eca4] hover:text-[#13eca4]/80 text-sm font-bold tracking-wide"
                                  >
                                    Copy Code
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          uniqueStudents.map((enrollment) => {
                            const initials = enrollment.studentId.slice(0, 2).toUpperCase();
                            return (
                              <tr
                                key={enrollment.id}
                                className="hover:bg-[rgba(19,236,164,0.02)] transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center text-[#13eca4] font-bold text-xs">
                                      {initials}
                                    </div>
                                    <span className="text-slate-100 font-medium">
                                      {enrollment.studentId}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                                  —
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                                  —
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                    Legacy
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 text-sm">
                                  —
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {/* Curriculum Visibility */}
                  <div className="bg-[#1a2e27] rounded-xl p-6 border border-[rgba(19,236,164,0.08)]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-white">Curriculum Visibility</h4>
                      <span className="material-symbols-outlined text-[#13eca4]">visibility</span>
                    </div>
                    <div className="space-y-4">
                      {classroomCourses.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-2">
                          No courses assigned
                        </p>
                      ) : (
                        classroomCourses.slice(0, 3).map((course) => (
                          <div key={course.id} className="flex items-center justify-between">
                            <span className="text-sm text-slate-300 truncate max-w-32.5">
                              {course.title}
                            </span>
                            <label className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#13eca4] cursor-pointer shrink-0">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition peer-checked:translate-x-6" />
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Class Average */}
                  <div className="bg-[#1a2e27] rounded-xl p-6 border border-[rgba(19,236,164,0.08)]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-white">Class Average</h4>
                      <span className="material-symbols-outlined text-[#13eca4]">analytics</span>
                    </div>
                    <div className="flex items-end justify-center gap-2 h-24 mb-4">
                      {[60, 75, 85, 95, 50].map((h, i) => (
                        <div
                          key={i}
                          className="w-8 rounded-t"
                          style={{
                            height: `${h}%`,
                            background: `rgba(19,236,164,${0.2 + i * 0.15})`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-black text-[#13eca4]">
                        {selectedClassroom.avgProgress ?? 0}%
                      </span>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">
                        Mastery Score
                      </p>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-[#1a2e27] rounded-xl p-6 border border-[rgba(19,236,164,0.08)] flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white mb-2">Next Milestone</h4>
                      <p className="text-sm text-slate-400">
                        {classroomCourses[0]
                          ? `Complete: ${classroomCourses[0].title}`
                          : "Assign a course to track milestones"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-[#13eca4] h-2 rounded-full"
                          style={{ width: `${selectedClassroom.avgProgress ?? 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>{selectedClassroom.avgProgress ?? 0}% Progress</span>
                        <span>{selectedClassroom.enrolled} Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <div className="bg-[#1a2e27] rounded-xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <h3 className="text-white font-bold">Course Access Control</h3>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#13eca4] hover:underline">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add Course
                  </button>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {classroomCourses.length === 0 && (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm">
                      No courses assigned yet.
                    </div>
                  )}
                  {classroomCourses.map((course) => (
                    <div
                      key={course.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
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
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-[rgba(255,255,255,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13eca4]" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === "insights" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a2e27] rounded-xl p-6 border border-[rgba(19,236,164,0.08)]">
                  <h4 className="text-base font-bold text-white mb-4">Enrollment Summary</h4>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Total Students",
                        value: selectedClassroom.enrolled,
                        max: selectedClassroom.capacity,
                      },
                      {
                        label: "Average Progress",
                        value: selectedClassroom.avgProgress ?? 0,
                        max: 100,
                      },
                    ].map(({ label, value, max }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-[#13eca4] font-bold">
                            {value} / {max}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full"
                            style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#1a2e27] rounded-xl p-6 border border-[rgba(19,236,164,0.08)]">
                  <h4 className="text-base font-bold text-white mb-4">Courses Assigned</h4>
                  {classroomCourses.length === 0 ? (
                    <p className="text-slate-500 text-sm">No courses assigned yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {classroomCourses.map((course) => (
                        <div key={course.id} className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: course.color || "#13eca4" }}
                          >
                            {course.title.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-300 truncate">{course.title}</span>
                          <span className="ml-auto text-[10px] font-bold uppercase text-[#13eca4] bg-[rgba(19,236,164,0.1)] px-2 py-0.5 rounded shrink-0">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.12)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {!createdStudentCode ? (
              <>
                <h2 className="text-white font-bold text-lg mb-1">Add New Student</h2>
                <p className="text-slate-400 text-sm mb-5">
                  Create a student profile. A unique login code will be generated.
                </p>
                {addStudentError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {addStudentError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Mwangi"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={newStudentAge}
                        onChange={(e) => setNewStudentAge(e.target.value)}
                        min="4"
                        max="25"
                        className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Grade
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grade 6"
                        value={newStudentGrade}
                        onChange={(e) => setNewStudentGrade(e.target.value)}
                        className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={resetAddStudentModal}
                    className="flex-1 border border-[rgba(255,255,255,0.1)] text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:border-[rgba(255,255,255,0.2)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStudent}
                    disabled={addingStudent || !newStudentName.trim()}
                    className="flex-1 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors disabled:opacity-50"
                  >
                    {addingStudent ? "Creating..." : "Create Student"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[rgba(19,236,164,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[#13eca4] text-3xl">
                      check_circle
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-lg mb-1">Student Created!</h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Share this login code with{" "}
                    <span className="text-white font-semibold">{newStudentName}</span>
                  </p>
                  <div className="bg-[#0d1f1a] border-2 border-dashed border-[rgba(19,236,164,0.3)] rounded-2xl p-6 mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Student Login Code
                    </p>
                    <p className="text-[#13eca4] font-mono font-black text-4xl tracking-[0.3em]">
                      {createdStudentCode}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyCode(createdStudentCode)}
                      className="flex-1 flex items-center justify-center gap-2 border border-[rgba(19,236,164,0.2)] text-[#13eca4] text-sm font-bold py-2.5 rounded-xl hover:bg-[rgba(19,236,164,0.1)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copied === createdStudentCode ? "check" : "content_copy"}
                      </span>
                      {copied === createdStudentCode ? "Copied!" : "Copy Code"}
                    </button>
                    <button
                      onClick={resetAddStudentModal}
                      className="flex-1 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
