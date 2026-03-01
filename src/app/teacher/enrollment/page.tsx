"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection, useCreateDoc } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Enrollment, AppUser } from "@/lib/types";

type Tab = "roster" | "curriculum" | "insights";

export default function TeacherEnrollmentPage() {
  const { appUser } = useAuthContext();
  const { classrooms, pendingSubmissions, loading: teacherLoading } = useTeacherData();
  const { create: createEnrollment } = useCreateDoc("enrollments");

  const [activeClassroomIdx, setActiveClassroomIdx] = useState(0);
  const [tab, setTab] = useState<Tab>("roster");
  const [search, setSearch] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

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
    studentIds.length > 0
      ? [where("__name__", "in", studentIds.slice(0, 10))]
      : [],
    studentIds.length > 0
  );

  // Build student data combining user info with enrollment info
  const studentData = studentIds.map((sid) => {
    const user = studentUsers.find((u) => u.uid === sid || (u as AppUser & { id: string }).id === sid);
    const enrollment = enrollments.find((e) => e.studentId === sid);
    return {
      id: sid,
      name: user?.displayName ?? sid,
      email: user?.email ?? "",
      joined: enrollment?.startedAt instanceof Date ? enrollment.startedAt.toLocaleDateString() : "Unknown",
      lastActive: "Recently",
      status: enrollment?.progress === 0 ? "Pending" : "Active" as string,
      mastery: enrollment?.progress ?? 0,
    };
  });

  const loading = teacherLoading || enrollmentsLoading || studentsLoading;

  const filtered = studentData.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = () => {
    if (!cls) return;
    navigator.clipboard.writeText(cls.joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleAddStudent = useCallback(async () => {
    if (!cls || !appUser || !newEmail.trim()) return;
    setAddingStudent(true);
    try {
      // Create enrollment record for the student
      // In a real app, you'd look up the student by email first
      await createEnrollment({
        studentId: newEmail.trim(),
        classroomId: cls.id,
        courseId: cls.courseIds?.[0] ?? "",
        progress: 0,
        completedLessons: 0,
        startedAt: new Date(),
      });
      await logActivity(appUser.uid, "add_student", `Added student ${newEmail.trim()} to ${cls.name}`);
      setShowAddModal(false);
      setNewEmail("");
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("Error adding student:", err);
    } finally {
      setAddingStudent(false);
    }
  }, [cls, appUser, newEmail, createEnrollment]);

  const handleImportCSV = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !cls || !appUser) return;
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      // Skip header line if present
      const dataLines = lines[0]?.includes("@") ? lines : lines.slice(1);
      for (const line of dataLines) {
        const email = line.split(",")[0]?.trim();
        if (email) {
          await createEnrollment({
            studentId: email,
            classroomId: cls.id,
            courseId: cls.courseIds?.[0] ?? "",
            progress: 0,
            completedLessons: 0,
            startedAt: new Date(),
          });
        }
      }
      await logActivity(appUser.uid, "import_csv", `Imported ${dataLines.length} students to ${cls.name}`);
    };
    input.click();
  }, [cls, appUser, createEnrollment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  // Compute insights from real data
  const avgMastery = studentData.length > 0
    ? Math.round(studentData.reduce((sum, s) => sum + s.mastery, 0) / studentData.length)
    : 0;
  const pendingForClassroom = cls
    ? pendingSubmissions.filter((s) => s.classroomId === cls.id).length
    : 0;

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Enrollment Manager</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage student rosters & class access</p>
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
            <div className="text-slate-500 text-sm">No classrooms yet. Create one from the Classroom Manager.</div>
          )}
          {classrooms.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveClassroomIdx(idx)}
              className={`flex-shrink-0 flex items-start gap-3 px-5 py-3 rounded-xl border text-left transition-all ${
                activeClassroomIdx === idx
                  ? "bg-[rgba(19,236,164,0.08)] border-[rgba(19,236,164,0.25)] text-white"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.07)] text-slate-400 hover:border-[rgba(255,255,255,0.15)]"
              }`}
            >
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{c.grade} · {c.enrolled} students</p>
              </div>
            </button>
          ))}
        </div>

        {cls && (
          <>
            {/* Class Info Bar */}
            <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#13eca4]">class</span>
                </div>
                <div>
                  <p className="text-white font-bold">{cls.name}</p>
                  <p className="text-slate-400 text-xs">{cls.subject} · {cls.grade}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-slate-400 text-xs font-medium">Join Code</span>
                  <code className="text-[#13eca4] font-black tracking-widest text-sm">{cls.joinCode}</code>
                  <button onClick={copyCode} className="text-slate-500 hover:text-[#13eca4] transition-colors ml-1">
                    <span className="material-symbols-outlined text-[16px]">{codeCopied ? "check_circle" : "content_copy"}</span>
                  </button>
                </div>
                <button className="flex items-center gap-1 text-slate-400 hover:text-[#13eca4] text-sm font-medium transition-colors border border-[rgba(255,255,255,0.08)] hover:border-[rgba(19,236,164,0.2)] px-3 py-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Reset
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[rgba(255,255,255,0.04)] rounded-xl p-1 mb-6 w-fit">
              {(["roster", "curriculum", "insights"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                    tab === t ? "bg-[rgba(19,236,164,0.12)] text-[#13eca4]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "roster" && (
              <>
                {/* Search */}
                <div className="flex items-center gap-2 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 mb-4 w-full max-w-sm">
                  <span className="material-symbols-outlined text-slate-500 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
                  />
                </div>

                <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.06)] text-xs text-slate-500">
                        <th className="px-6 py-3 text-left font-medium">Student</th>
                        <th className="px-4 py-3 text-left font-medium">Email</th>
                        <th className="px-4 py-3 text-left font-medium">Joined</th>
                        <th className="px-4 py-3 text-left font-medium">Last Active</th>
                        <th className="px-4 py-3 text-center font-medium">Mastery</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                        <th className="px-4 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[#13eca4] font-bold text-xs">
                                {s.name[0]}
                              </div>
                              <span className="text-white font-semibold">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-xs">{s.email}</td>
                          <td className="px-4 py-4 text-slate-400 text-xs">{s.joined}</td>
                          <td className="px-4 py-4 text-slate-400 text-xs">{s.lastActive}</td>
                          <td className="px-4 py-4 text-center">
                            {s.mastery > 0 ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                      width: `${s.mastery}%`,
                                      background: s.mastery >= 90 ? "#13eca4" : s.mastery >= 70 ? "#3b82f6" : "#f59e0b",
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-white">{s.mastery}%</span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">&mdash;</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              s.status === "Active" ? "bg-emerald-500/10 text-emerald-400"
                              : s.status === "Pending" ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button className="text-slate-500 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-[rgba(59,130,246,0.08)]" title="Reset Password">
                                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                              </button>
                              <button className="text-slate-500 hover:text-[#13eca4] transition-colors p-1.5 rounded-lg hover:bg-[rgba(19,236,164,0.08)]" title="View Profile">
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              </button>
                              <button className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-[rgba(255,77,77,0.08)]" title="Remove Student">
                                <span className="material-symbols-outlined text-[16px]">person_remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-sm">No students match your search.</div>
                  )}
                  <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
                    <button
                      onClick={handleImportCSV}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-[#13eca4] text-xs font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload_file</span>
                      Import CSV
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === "curriculum" && (
              <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] divide-y divide-[rgba(255,255,255,0.05)]">
                {(cls.courseIds ?? []).length === 0 && (
                  <div className="px-6 py-12 text-center text-slate-500 text-sm">No courses assigned to this classroom.</div>
                )}
                {(cls.courseIds ?? []).map((courseId, i) => (
                  <div key={courseId} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[rgba(19,236,164,0.08)] flex items-center justify-center text-[#13eca4] text-xs font-bold">{i + 1}</div>
                      <span className="text-white text-sm font-medium">{courseId}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-slate-500 text-xs">Visible</span>
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
                  { icon: "trending_up", label: "Class Avg. Mastery", value: `${avgMastery}%`, sub: studentData.length > 0 ? `${studentData.length} students` : "No data yet", color: "#13eca4" },
                  { icon: "pending_actions", label: "Pending Submissions", value: String(pendingForClassroom), sub: "Awaiting your review", color: "#f59e0b" },
                  { icon: "emoji_events", label: "Students Enrolled", value: String(studentData.length), sub: "This classroom", color: "#8b5cf6" },
                ].map((c) => (
                  <div key={c.label} className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] p-5">
                    <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${c.color}18` }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: c.color }}>{c.icon}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{c.label}</p>
                    <p className="text-white text-2xl font-bold">{c.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{c.sub}</p>
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
          <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.12)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-white font-bold text-lg mb-1">Add Student</h2>
            <p className="text-slate-400 text-sm mb-5">Enter the student&apos;s email address to send an enrollment invite.</p>
            <input
              type="email"
              placeholder="student@school.edu"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-[#0d1f1a] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[rgba(19,236,164,0.4)] placeholder-slate-600 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-[rgba(255,255,255,0.1)] text-slate-300 text-sm font-semibold py-2.5 rounded-xl hover:border-[rgba(255,255,255,0.2)] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent || !newEmail.trim()}
                className="flex-1 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors disabled:opacity-50"
              >
                {addingStudent ? "Adding..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
