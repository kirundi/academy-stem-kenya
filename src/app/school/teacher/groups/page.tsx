"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection, useCreateDoc } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import { logActivity } from "@/lib/activity-logger";
import type { Enrollment, AppUser } from "@/lib/types";

interface Group {
  id: string;
  name: string;
  levelNum: number;
  levelColor: string;
  studentIds: string[];
  courseIds: string[];
  classroomId: string;
  teacherId: string;
}

export default function TeacherGroupsPage() {
  const { appUser } = useAuthContext();
  const { classrooms, loading: teacherLoading } = useTeacherData();

  // Use first classroom by default for groups context
  const primaryClassroom = classrooms[0] ?? null;

  // Fetch groups for teacher
  const { data: groups, loading: groupsLoading } = useCollection<Group>(
    "groups",
    appUser ? [where("teacherId", "==", appUser.uid)] : [],
    !!appUser
  );

  // Fetch enrollments for primary classroom to find unassigned students
  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    primaryClassroom ? [where("classroomId", "==", primaryClassroom.id)] : [],
    !!primaryClassroom
  );

  // Get all student IDs from enrollments
  const allStudentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));

  // Fetch user data for students
  const { data: studentUsers } = useCollection<AppUser>(
    "users",
    allStudentIds.length > 0 ? [where("__name__", "in", allStudentIds.slice(0, 10))] : [],
    allStudentIds.length > 0
  );

  const { create: createGroup, loading: creatingGroup } = useCreateDoc("groups");

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loading = teacherLoading || groupsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  // Determine which students are assigned to groups
  const assignedStudentIds = new Set(groups.flatMap((g) => g.studentIds ?? []));
  const unassignedStudentIds = allStudentIds.filter((id) => !assignedStudentIds.has(id));
  const unassignedStudents = unassignedStudentIds.map((id) => {
    const user = studentUsers.find(
      (u) => (u as AppUser & { id: string }).id === id || u.uid === id
    );
    return { id, name: user?.displayName ?? id };
  });

  // Helper to get student name
  const getStudentName = (studentId: string) => {
    const user = studentUsers.find(
      (u) => (u as AppUser & { id: string }).id === studentId || u.uid === studentId
    );
    return user?.displayName ?? studentId;
  };

  const activeGroup = selectedGroup ? groups.find((g) => g.id === selectedGroup) : groups[0];
  const totalGroupStudents = groups.reduce((a, g) => a + (g.studentIds?.length ?? 0), 0);

  const handleCreateGroup = async () => {
    if (!appUser || !primaryClassroom) return;
    const groupNum = groups.length + 1;
    const colors = ["#13eca4", "#f59e0b", "#ff4d4d", "#3b82f6", "#8b5cf6"];
    await createGroup({
      name: `Group ${String.fromCharCode(64 + groupNum)}`,
      levelNum: 1,
      levelColor: colors[groupNum % colors.length],
      studentIds: [],
      courseIds: [],
      classroomId: primaryClassroom.id,
      teacherId: appUser.uid,
    });
    await logActivity(
      appUser.uid,
      "create_group",
      `Created Group ${String.fromCharCode(64 + groupNum)}`
    );
  };

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Classroom Group Manager</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {primaryClassroom?.name ?? "No classroom"} · Managing {groups.length} group
            {groups.length !== 1 ? "s" : ""} and {totalGroupStudents} student
            {totalGroupStudents !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          disabled={creatingGroup}
          className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {creatingGroup ? "Creating..." : "Add New Group"}
        </button>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left -- Groups Panel */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`bg-[#1a2e27] rounded-2xl border transition-all cursor-pointer ${
                  activeGroup?.id === g.id
                    ? "border-[rgba(19,236,164,0.4)] shadow-lg shadow-[rgba(19,236,164,0.06)]"
                    : "border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.2)]"
                }`}
              >
                {/* Card header */}
                <div className="p-5 border-b border-[rgba(255,255,255,0.04)]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold">{g.name}</h3>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                      style={{ color: g.levelColor, background: `${g.levelColor}18` }}
                    >
                      Level {g.levelNum}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    {(g.studentIds ?? []).length} student
                    {(g.studentIds ?? []).length !== 1 ? "s" : ""} enrolled
                  </p>
                </div>

                {/* Students list */}
                <div className="p-4 space-y-2 max-h-44 overflow-y-auto">
                  {(g.studentIds ?? []).length === 0 && (
                    <p className="text-slate-600 text-xs text-center py-2">No students assigned</p>
                  )}
                  {(g.studentIds ?? []).map((sid) => {
                    const name = getStudentName(sid);
                    return (
                      <div
                        key={sid}
                        className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] group cursor-grab"
                      >
                        <span className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-400">
                          drag_indicator
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[10px] font-bold text-[#13eca4]">
                          {name[0]}
                        </div>
                        <span className="text-slate-300 text-sm">{name}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Courses */}
                <div className="p-4 pt-0 flex flex-wrap gap-1.5">
                  {(g.courseIds ?? []).map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1 text-xs bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-slate-400 px-2 py-0.5 rounded-full"
                    >
                      {c}
                      <span className="material-symbols-outlined text-[12px] hover:text-[#ff4d4d] cursor-pointer">
                        close
                      </span>
                    </span>
                  ))}
                  <button className="text-xs text-[#13eca4] hover:underline flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">add</span> Add course
                  </button>
                </div>
              </div>
            ))}

            {/* Create New Group Card */}
            <div
              onClick={handleCreateGroup}
              className="bg-[rgba(255,255,255,0.02)] border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 h-40 hover:border-[rgba(19,236,164,0.3)] hover:bg-[rgba(19,236,164,0.02)] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-[rgba(19,236,164,0.1)] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[22px] text-slate-500 group-hover:text-[#13eca4]">
                  add
                </span>
              </div>
              <span className="text-slate-500 group-hover:text-[#13eca4] text-sm font-semibold transition-colors">
                Create New Group
              </span>
            </div>
          </div>
        </div>

        {/* Right -- Unassigned Students Sidebar */}
        <div className="w-72 bg-[#0d1f1a] border-l border-[rgba(19,236,164,0.08)] flex flex-col">
          <div className="p-5 border-b border-[rgba(19,236,164,0.08)]">
            <h2 className="text-white font-bold text-sm mb-3">Unassigned Students</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white placeholder-slate-600 rounded-xl px-3 py-2 pl-9 text-sm focus:outline-none focus:border-[#13eca4]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {unassignedStudents.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-4">No unassigned students</p>
            )}
            {unassignedStudents
              .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] group cursor-grab"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-600 group-hover:text-slate-400">
                    drag_indicator
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-xs font-bold text-slate-400">
                    {s.name[0]}
                  </div>
                  <span className="text-slate-400 text-sm font-medium">{s.name}</span>
                </div>
              ))}
          </div>
          <div className="p-3 border-t border-[rgba(19,236,164,0.08)]">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-slate-400 text-sm font-semibold hover:border-[#13eca4] hover:text-[#13eca4] transition-colors">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Import Roster (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
