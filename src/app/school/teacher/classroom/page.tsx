"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCreateDoc, useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logActivity } from "@/lib/activity-logger";
import type { Course, Enrollment } from "@/lib/types";
import { generateJoinCode } from "@/lib/client-code";

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
      // Trigger Google OAuth to get a fresh access token scoped to Classroom
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/classroom.rosters.readonly");
      provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) throw new Error("Could not obtain Google access token");

      const res = await fetch("/api/google-classroom/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
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
    const joinCode = generateJoinCode();
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
    <div className="min-h-screen bg-(--bg-page) flex h-screen overflow-hidden">
      {/* Classroom List Sidebar */}
      <div className="w-72 bg-(--bg-page) border-r border-(--border-subtle) flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-(--border-subtle)">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
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
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search classrooms..."
              className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg pl-9 pr-3 py-2 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {classrooms.length === 0 && (
            <p className="text-center py-8 text-(--text-faint) text-sm px-4">
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
                  ? "bg-[rgba(19,236,164,0.1)] border border-(--border-accent)"
                  : "bg-[rgba(255,255,255,0.02)] border border-transparent hover:border-(--border-subtle)"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#13eca4] text-[10px] font-bold uppercase tracking-widest truncate max-w-30">
                  {cls.subject}
                </span>
                <span className="text-[10px] font-bold text-(--text-faint) shrink-0">
                  {cls.enrolled}/{cls.capacity}
                </span>
              </div>
              <p className="text-(--text-base) text-sm font-semibold truncate">{cls.name}</p>
              <p className="text-(--text-faint) text-xs font-mono mt-0.5">{cls.joinCode}</p>
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
          <div className="flex flex-col items-center justify-center h-full text-(--text-faint)">
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
                  <h1 className="text-(--text-base) text-3xl font-black leading-tight tracking-tight">
                    {selectedClassroom.name}
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {/* Join Code Display */}
                    <div className="flex items-center gap-2 text-(--text-muted) bg-(--bg-card) px-3 py-1.5 rounded-lg w-fit border border-(--border-subtle)">
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
                  <p className="text-[11px] text-(--text-faint) italic flex items-center gap-1 ml-1">
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
                <button className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-(--bg-card) text-(--text-base) text-sm font-bold border border-(--border-subtle) hover:border-(--border-strong) transition-colors">
                  <span className="material-symbols-outlined text-lg">move_to_inbox</span>
                  Request Code Change
                </button>
                <button className="flex items-center justify-center gap-2 rounded-lg h-11 px-4 bg-(--bg-card) text-(--text-muted) text-sm font-bold border border-(--border-subtle) hover:border-(--border-strong) transition-colors">
                  <span className="material-symbols-outlined text-lg">settings</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-(--border-subtle)">
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
                          : "border-transparent text-(--text-faint) hover:text-(--text-muted) hover:border-slate-600"
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
                  <h3 className="text-xl font-bold text-(--text-base)">
                    Class Roster{" "}
                    <span className="text-(--text-faint) font-normal text-sm ml-2">
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

                <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-card)">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[rgba(0,0,0,0.2)] border-b border-(--border-subtle)">
                          <th className="px-6 py-4 text-(--text-muted) text-xs font-semibold uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-4 text-(--text-muted) text-xs font-semibold uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-4 text-(--text-muted) text-xs font-semibold uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-4 text-(--text-muted) text-xs font-semibold uppercase tracking-wider text-center">
                            Status
                          </th>
                          <th className="px-6 py-4 text-(--text-muted) text-xs font-semibold uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                        {rosterLoading ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-(--text-faint) text-sm"
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
                              className="px-6 py-10 text-center text-(--text-faint) text-sm"
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
                                    <span className="text-(--text-base) font-medium">
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
                                      className="text-(--text-faint) hover:text-[#13eca4] transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {copied === student.studentCode ? "check" : "content_copy"}
                                      </span>
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-(--text-muted) text-sm">
                                  {student.grade || "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  {(student.xp ?? 0) > 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-(--text-faint) border border-slate-500/20">
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
                                    <span className="text-(--text-base) font-medium">
                                      {enrollment.studentId}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-(--text-faint) text-sm">
                                  —
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-(--text-faint) text-sm">
                                  —
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-(--text-faint) border border-slate-500/20">
                                    Legacy
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-(--text-faint) text-sm">
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
                  <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border-subtle)">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-(--text-base)">Curriculum Visibility</h4>
                      <span className="material-symbols-outlined text-[#13eca4]">visibility</span>
                    </div>
                    <div className="space-y-4">
                      {classroomCourses.length === 0 ? (
                        <p className="text-xs text-(--text-faint) text-center py-2">
                          No courses assigned
                        </p>
                      ) : (
                        classroomCourses.slice(0, 3).map((course) => (
                          <div key={course.id} className="flex items-center justify-between">
                            <span className="text-sm text-(--text-muted) truncate max-w-32.5">
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
                  <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border-subtle)">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-bold text-(--text-base)">Class Average</h4>
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
                      <p className="text-xs text-(--text-faint) uppercase font-bold tracking-widest mt-1">
                        Mastery Score
                      </p>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border-subtle) flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-(--text-base) mb-2">Next Milestone</h4>
                      <p className="text-sm text-(--text-muted)">
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
                      <div className="flex justify-between mt-2 text-xs font-bold uppercase tracking-wider text-(--text-faint)">
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
              <div className="bg-(--bg-card) rounded-xl border border-(--border-subtle) overflow-hidden">
                <div className="px-6 py-4 border-b border-(--border-subtle) flex items-center justify-between">
                  <h3 className="text-(--text-base) font-bold">Course Access Control</h3>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#13eca4] hover:underline">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add Course
                  </button>
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {classroomCourses.length === 0 && (
                    <div className="px-6 py-8 text-center text-(--text-faint) text-sm">
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
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-(--text-base)"
                          style={{ background: course.color || "#13eca4" }}
                        >
                          {course.title.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-(--text-muted) font-medium text-sm">{course.title}</span>
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
                <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border-subtle)">
                  <h4 className="text-base font-bold text-(--text-base) mb-4">Enrollment Summary</h4>
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
                          <span className="text-(--text-muted)">{label}</span>
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
                <div className="bg-(--bg-card) rounded-xl p-6 border border-(--border-subtle)">
                  <h4 className="text-base font-bold text-(--text-base) mb-4">Courses Assigned</h4>
                  {classroomCourses.length === 0 ? (
                    <p className="text-(--text-faint) text-sm">No courses assigned yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {classroomCourses.map((course) => (
                        <div key={course.id} className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-(--text-base) shrink-0"
                            style={{ background: course.color || "#13eca4" }}
                          >
                            {course.title.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-(--text-muted) truncate">{course.title}</span>
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
          <div className="bg-(--bg-card) border border-(--border-medium) rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-(--text-base) font-bold text-lg mb-1">Create New Classroom</h2>
            <p className="text-(--text-muted) text-sm mb-5">Set up a new classroom for your students.</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Classroom Name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
              />
              <input
                type="text"
                placeholder="Subject (e.g. Robotics)"
                value={newClassSubject}
                onChange={(e) => setNewClassSubject(e.target.value)}
                className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
              />
              <input
                type="text"
                placeholder="Grade (e.g. Grade 8)"
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
              />
              <input
                type="number"
                placeholder="Capacity (default: 30)"
                value={newClassCapacity}
                onChange={(e) => setNewClassCapacity(e.target.value)}
                className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-(--border-subtle) text-(--text-muted) text-sm font-semibold py-2.5 rounded-xl hover:border-(--border-accent) transition-colors"
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
          <div className="bg-(--bg-card) border border-(--border-medium) rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {!createdStudentCode ? (
              <>
                <h2 className="text-(--text-base) font-bold text-lg mb-1">Add New Student</h2>
                <p className="text-(--text-muted) text-sm mb-5">
                  Create a student profile. A unique login code will be generated.
                </p>
                {addStudentError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {addStudentError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Mwangi"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={newStudentAge}
                        onChange={(e) => setNewStudentAge(e.target.value)}
                        min="4"
                        max="25"
                        className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                        Grade
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grade 6"
                        value={newStudentGrade}
                        onChange={(e) => setNewStudentGrade(e.target.value)}
                        className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={resetAddStudentModal}
                    className="flex-1 border border-(--border-subtle) text-(--text-muted) text-sm font-semibold py-2.5 rounded-xl hover:border-(--border-accent) transition-colors"
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
                  <h2 className="text-(--text-base) font-bold text-lg mb-1">Student Created!</h2>
                  <p className="text-(--text-muted) text-sm mb-6">
                    Share this login code with{" "}
                    <span className="text-(--text-base) font-semibold">{newStudentName}</span>
                  </p>
                  <div className="bg-(--bg-page) border-2 border-dashed border-(--border-strong) rounded-2xl p-6 mb-6">
                    <p className="text-xs font-bold text-(--text-faint) uppercase tracking-widest mb-2">
                      Student Login Code
                    </p>
                    <p className="text-[#13eca4] font-mono font-black text-4xl tracking-[0.3em]">
                      {createdStudentCode}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyCode(createdStudentCode)}
                      className="flex-1 flex items-center justify-center gap-2 border border-(--border-accent) text-[#13eca4] text-sm font-bold py-2.5 rounded-xl hover:bg-[rgba(19,236,164,0.1)] transition-colors"
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
