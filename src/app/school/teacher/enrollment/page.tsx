"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection, useUpdateDoc, useDeleteDoc } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Enrollment, AppUser } from "@/lib/types";
import { generateJoinCode } from "@/lib/client-code";

type Tab = "roster" | "curriculum" | "insights";

export default function TeacherEnrollmentPage() {
  const { appUser } = useAuthContext();
  const { classrooms, pendingSubmissions, loading: teacherLoading } = useTeacherData();
  const [activeClassroomIdx, setActiveClassroomIdx] = useState(0);
  const [tab, setTab] = useState<Tab>("roster");
  const [search, setSearch] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAge, setNewStudentAge] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [addStudentError, setAddStudentError] = useState("");
  const [createdStudentCode, setCreatedStudentCode] = useState("");
  const [codeCopiedStudent, setCodeCopiedStudent] = useState<string | null>(null);
  const [resettingCode, setResettingCode] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  const { update: updateClassroom } = useUpdateDoc("classrooms");
  const { remove: removeEnrollment } = useDeleteDoc("enrollments");

  const cls = classrooms[activeClassroomIdx] ?? null;

  // Fetch enrollments for the selected classroom
  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
    "enrollments",
    cls ? [where("classroomId", "==", cls.id)] : [],
    !!cls
  );

  // Get unique student IDs
  const studentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));

  // Fetch user docs for students in this classroom
  const { data: studentUsers, loading: studentsLoading } = useCollection<AppUser>(
    "users",
    studentIds.length > 0 ? [where("__name__", "in", studentIds.slice(0, 10))] : [],
    studentIds.length > 0
  );

  // Build student data combining user info with enrollment info
  const studentData = studentIds.map((sid) => {
    const user = studentUsers.find(
      (u) => u.uid === sid || (u as AppUser & { id: string }).id === sid
    );
    const enrollment = enrollments.find((e) => e.studentId === sid);
    return {
      id: sid,
      enrollmentId: enrollment?.id ?? null,
      name: user?.displayName ?? sid,
      studentCode: user?.studentCode ?? null,
      grade: user?.grade ?? null,
      lastActive: "Recently",
      status: enrollment?.progress === 0 ? "Pending" : ("Active" as string),
      mastery: enrollment?.progress ?? 0,
    };
  });

  const loading = teacherLoading || enrollmentsLoading || studentsLoading;

  const filtered = studentData.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentCode?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const copyCode = () => {
    if (!cls) return;
    navigator.clipboard.writeText(cls.joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleAddStudent = useCallback(async () => {
    if (!cls || !appUser || !newStudentName.trim()) return;
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
          classroomId: cls.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");
      setCreatedStudentCode(data.student.studentCode);
      await logActivity(
        appUser.uid,
        "add_student",
        `Created student ${newStudentName.trim()} in ${cls.name}`
      );
    } catch (err) {
      setAddStudentError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingStudent(false);
    }
  }, [cls, appUser, newStudentName, newStudentAge, newStudentGrade]);

  const resetAddModal = () => {
    setShowAddModal(false);
    setNewStudentName("");
    setNewStudentAge("");
    setNewStudentGrade("");
    setAddStudentError("");
    setCreatedStudentCode("");
  };

  const copyStudentCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopiedStudent(code);
    setTimeout(() => setCodeCopiedStudent(null), 2000);
  };

  const handleResetCode = useCallback(async () => {
    if (!cls) return;
    setResettingCode(true);
    try {
      const newCode = generateJoinCode();
      await updateClassroom(cls.id, { joinCode: newCode });
    } finally {
      setResettingCode(false);
    }
  }, [cls, updateClassroom]);

  const handleRemoveStudent = useCallback(
    async (enrollmentId: string | null, studentName: string) => {
      if (!enrollmentId) return;
      if (!confirm(`Remove ${studentName} from ${cls?.name ?? "this class"}?`)) return;
      setRemovingStudentId(enrollmentId);
      try {
        await removeEnrollment(enrollmentId);
      } finally {
        setRemovingStudentId(null);
      }
    },
    [cls, removeEnrollment]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  // Compute insights from real data
  const avgMastery =
    studentData.length > 0
      ? Math.round(studentData.reduce((sum, s) => sum + s.mastery, 0) / studentData.length)
      : 0;
  const pendingForClassroom = cls
    ? pendingSubmissions.filter((s) => s.classroomId === cls.id).length
    : 0;

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Enrollment Manager</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Manage student rosters & class access</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#0dd494] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Student
        </button>
      </header>

      <div className="px-8 py-8">
        {/* Classroom Selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {classrooms.length === 0 && (
            <div className="text-(--text-faint) text-sm">
              No classrooms yet. Create one from the Classroom Manager.
            </div>
          )}
          {classrooms.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveClassroomIdx(idx)}
              className={`shrink-0 flex items-start gap-3 px-5 py-3 rounded-xl border text-left transition-all ${
                activeClassroomIdx === idx
                  ? "bg-[rgba(19,236,164,0.08)] border-[rgba(19,236,164,0.25)] text-(--text-base)"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.07)] text-(--text-muted) hover:border-(--border-medium)"
              }`}
            >
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-(--text-faint) mt-0.5">
                  {c.grade} · {c.enrolled} students
                </p>
              </div>
            </button>
          ))}
        </div>

        {cls && (
          <>
            {/* Class Info Bar */}
            <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13eca4]">class</span>
                </div>
                <div>
                  <p className="text-(--text-base) font-bold">{cls.name}</p>
                  <p className="text-(--text-muted) text-xs">
                    {cls.subject} · {cls.grade}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-(--bg-page) border border-(--border-medium) rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-(--text-muted) text-xs font-medium">Join Code</span>
                  <code className="text-[#13eca4] font-black tracking-widest text-sm">
                    {cls.joinCode}
                  </code>
                  <button
                    onClick={copyCode}
                    className="text-(--text-faint) hover:text-[#13eca4] transition-colors ml-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {codeCopied ? "check_circle" : "content_copy"}
                    </span>
                  </button>
                </div>
                <button
                  onClick={handleResetCode}
                  disabled={resettingCode}
                  className="flex items-center gap-1 text-(--text-muted) hover:text-[#13eca4] text-sm font-medium transition-colors border border-(--border-subtle) hover:border-(--border-accent) px-3 py-2.5 rounded-xl disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-[16px] ${resettingCode ? "animate-spin" : ""}`}
                  >
                    refresh
                  </span>
                  {resettingCode ? "Resetting…" : "Reset"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-(--glass-bg) rounded-xl p-1 mb-6 w-fit">
              {(["roster", "curriculum", "insights"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                    tab === t
                      ? "bg-[rgba(19,236,164,0.12)] text-[#13eca4]"
                      : "text-(--text-muted) hover:text-(--text-base)"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "roster" && (
              <>
                {/* Search */}
                <div className="flex items-center gap-2 bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-2.5 mb-4 w-full max-w-sm">
                  <span className="material-symbols-outlined text-(--text-faint) text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-(--text-base) placeholder:text-(--text-faint) outline-none flex-1"
                  />
                </div>

                <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-(--border-subtle) text-xs text-(--text-faint)">
                        <th className="px-6 py-3 text-left font-medium">Student</th>
                        <th className="px-4 py-3 text-left font-medium">Code</th>
                        <th className="px-4 py-3 text-left font-medium">Grade</th>
                        <th className="px-4 py-3 text-left font-medium">Last Active</th>
                        <th className="px-4 py-3 text-center font-medium">Mastery</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                        <th className="px-4 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[#13eca4] font-bold text-xs">
                                {s.name[0]}
                              </div>
                              <span className="text-(--text-base) font-semibold">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {s.studentCode ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#13eca4] font-mono font-bold tracking-wider text-xs">
                                  {s.studentCode}
                                </span>
                                <button
                                  onClick={() => copyStudentCode(s.studentCode!)}
                                  className="text-(--text-faint) hover:text-[#13eca4] transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {codeCopiedStudent === s.studentCode ? "check" : "content_copy"}
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-(--text-faint) text-xs">&mdash;</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-(--text-muted) text-xs">{s.grade || "—"}</td>
                          <td className="px-4 py-4 text-(--text-muted) text-xs">{s.lastActive}</td>
                          <td className="px-4 py-4 text-center">
                            {s.mastery > 0 ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-(--bg-elevated) rounded-full">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                      width: `${s.mastery}%`,
                                      background:
                                        s.mastery >= 90
                                          ? "#13eca4"
                                          : s.mastery >= 70
                                            ? "#3b82f6"
                                            : "#f59e0b",
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-(--text-base)">{s.mastery}%</span>
                              </div>
                            ) : (
                              <span className="text-(--text-faint) text-xs">&mdash;</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                s.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : s.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {s.studentCode && (
                                <button
                                  onClick={() => copyStudentCode(s.studentCode!)}
                                  className="text-(--text-faint) hover:text-[#13eca4] transition-colors p-1.5 rounded-lg hover:bg-(--hover-subtle)"
                                  title="Copy Student Code"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    {codeCopiedStudent === s.studentCode ? "check" : "content_copy"}
                                  </span>
                                </button>
                              )}
                              <button
                                className="text-(--text-faint) hover:text-[#13eca4] transition-colors p-1.5 rounded-lg hover:bg-(--hover-subtle)"
                                title="View Profile"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  open_in_new
                                </span>
                              </button>
                              <button
                                onClick={() => handleRemoveStudent(s.enrollmentId, s.name)}
                                disabled={removingStudentId === s.enrollmentId}
                                className="text-(--text-faint) hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-[rgba(255,77,77,0.08)] disabled:opacity-50"
                                title="Remove Student"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {removingStudentId === s.enrollmentId
                                    ? "hourglass_empty"
                                    : "person_remove"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-(--text-faint) text-sm">
                      No students match your search.
                    </div>
                  )}
                  <div className="px-6 py-3 border-t border-(--border-subtle) flex items-center justify-between">
                    <span className="text-(--text-faint) text-xs">
                      {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </>
            )}

            {tab === "curriculum" && (
              <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) divide-y divide-[rgba(255,255,255,0.05)]">
                {(cls.courseIds ?? []).length === 0 && (
                  <div className="px-6 py-12 text-center text-(--text-faint) text-sm">
                    No courses assigned to this classroom.
                  </div>
                )}
                {(cls.courseIds ?? []).map((courseId, i) => (
                  <div key={courseId} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[rgba(19,236,164,0.08)] flex items-center justify-center text-[#13eca4] text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-(--text-base) text-sm font-medium">{courseId}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-(--text-faint) text-xs">Visible</span>
                      <div className="w-9 h-5 rounded-full transition-colors relative bg-[#13eca4]">
                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-4" />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {tab === "insights" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: "trending_up",
                    label: "Class Avg. Mastery",
                    value: `${avgMastery}%`,
                    sub: studentData.length > 0 ? `${studentData.length} students` : "No data yet",
                    color: "#13eca4",
                  },
                  {
                    icon: "pending_actions",
                    label: "Pending Submissions",
                    value: String(pendingForClassroom),
                    sub: "Awaiting your review",
                    color: "#f59e0b",
                  },
                  {
                    icon: "emoji_events",
                    label: "Students Enrolled",
                    value: String(studentData.length),
                    sub: "This classroom",
                    color: "#8b5cf6",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-5"
                  >
                    <div
                      className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center"
                      style={{ background: `${c.color}18` }}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: c.color }}
                      >
                        {c.icon}
                      </span>
                    </div>
                    <p className="text-(--text-muted) text-xs">{c.label}</p>
                    <p className="text-(--text-base) text-2xl font-bold">{c.value}</p>
                    <p className="text-(--text-faint) text-xs mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
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
                    onClick={resetAddModal}
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
                    onClick={() => copyStudentCode(createdStudentCode)}
                    className="flex-1 flex items-center justify-center gap-2 border border-(--border-accent) text-[#13eca4] text-sm font-bold py-2.5 rounded-xl hover:bg-[rgba(19,236,164,0.1)] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {codeCopiedStudent === createdStudentCode ? "check" : "content_copy"}
                    </span>
                    {codeCopiedStudent === createdStudentCode ? "Copied!" : "Copy Code"}
                  </button>
                  <button
                    onClick={resetAddModal}
                    className="flex-1 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
