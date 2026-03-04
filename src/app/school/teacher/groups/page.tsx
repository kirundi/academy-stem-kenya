"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection, useCreateDoc, useUpdateDoc, useDeleteDoc } from "@/hooks/useFirestore";
import { where, documentId } from "firebase/firestore";
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
  currentStep?: number;
  totalSteps?: number;
}

const GROUP_COLORS = ["#13eca4", "#f59e0b", "#ff4d4d", "#3b82f6", "#8b5cf6"];

export default function TeacherGroupsPage() {
  const { appUser } = useAuthContext();
  const { classrooms, loading: teacherLoading } = useTeacherData();

  const primaryClassroom = classrooms[0] ?? null;

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: groups, loading: groupsLoading } = useCollection<Group>(
    "groups",
    appUser ? [where("teacherId", "==", appUser.uid)] : [],
    !!appUser
  );

  const { data: enrollments } = useCollection<Enrollment>(
    "enrollments",
    primaryClassroom ? [where("classroomId", "==", primaryClassroom.id)] : [],
    !!primaryClassroom
  );

  const allStudentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));

  const { data: studentUsers } = useCollection<AppUser>(
    "users",
    allStudentIds.length > 0 ? [where(documentId(), "in", allStudentIds.slice(0, 10))] : [],
    allStudentIds.length > 0
  );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { create: createGroup, loading: creatingGroup } = useCreateDoc("groups");
  const { update: updateGroup } = useUpdateDoc("groups");
  const { remove: deleteGroup } = useDeleteDoc("groups");

  // ── Local state ───────────────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStudentName = (studentId: string) => {
    const user = studentUsers.find((u) => (u as AppUser & { id: string }).id === studentId);
    return user?.displayName ?? studentId;
  };

  const assignedStudentIds = new Set(groups.flatMap((g) => g.studentIds ?? []));
  const unassignedStudents = allStudentIds
    .filter((id) => !assignedStudentIds.has(id))
    .map((id) => ({ id, name: getStudentName(id) }))
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const activeGroup =
    (selectedGroupId ? groups.find((g) => g.id === selectedGroupId) : groups[0]) ?? null;

  const totalGroupStudents = groups.reduce((a, g) => a + (g.studentIds?.length ?? 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateGroup = async () => {
    if (!appUser || !primaryClassroom) return;
    const groupNum = groups.length + 1;
    const id = await createGroup({
      name: `Group ${String.fromCharCode(64 + groupNum)}`,
      levelNum: 1,
      levelColor: GROUP_COLORS[groupNum % GROUP_COLORS.length],
      studentIds: [],
      courseIds: [],
      classroomId: primaryClassroom.id,
      teacherId: appUser.uid,
      currentStep: 1,
      totalSteps: 5,
    });
    if (id) setSelectedGroupId(id);
    await logActivity(
      appUser.uid,
      "create_group",
      `Created Group ${String.fromCharCode(64 + groupNum)}`
    );
  };

  const handleAssignStudent = async (studentId: string) => {
    if (!activeGroup) return;
    const updated = [...(activeGroup.studentIds ?? []), studentId];
    await updateGroup(activeGroup.id, { studentIds: updated });
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const updated = (group.studentIds ?? []).filter((id) => id !== studentId);
    await updateGroup(groupId, { studentIds: updated });
  };

  const handleDeleteGroup = async (groupId: string) => {
    await deleteGroup(groupId);
    if (selectedGroupId === groupId) setSelectedGroupId(null);
    setConfirmDeleteId(null);
  };

  const handleCopyLink = (groupId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/school/student/collaboration?groupId=${groupId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(groupId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Classroom Group Manager</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            {primaryClassroom?.name ?? "No classroom"} · {groups.length} group
            {groups.length !== 1 ? "s" : ""} · {totalGroupStudents} student
            {totalGroupStudents !== 1 ? "s" : ""} assigned
          </p>
        </div>
        <button
          onClick={handleCreateGroup}
          disabled={creatingGroup || !primaryClassroom}
          className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {creatingGroup ? "Creating…" : "New Group"}
        </button>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* ── LEFT: Groups grid ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-8">
          {groups.length === 0 && !creatingGroup ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <span className="material-symbols-outlined text-5xl text-(--text-faint)">group_work</span>
              <p className="text-(--text-muted) text-sm">No groups yet.</p>
              <button
                onClick={handleCreateGroup}
                disabled={!primaryClassroom}
                className="text-[#13eca4] text-sm hover:underline disabled:opacity-40"
              >
                Create your first group →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {groups.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`bg-(--bg-card) rounded-2xl border transition-all cursor-pointer ${
                    activeGroup?.id === g.id
                      ? "border-[rgba(19,236,164,0.4)] shadow-lg shadow-[rgba(19,236,164,0.06)]"
                      : "border-(--border-subtle) hover:border-(--border-accent)"
                  }`}
                >
                  {/* Card header */}
                  <div className="p-5 border-b border-(--border-subtle)">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-(--text-base) font-bold">{g.name}</h3>
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide"
                        style={{
                          color: g.levelColor,
                          background: `${g.levelColor}18`,
                        }}
                      >
                        Level {g.levelNum}
                      </span>
                    </div>
                    <p className="text-(--text-faint) text-xs">
                      {(g.studentIds ?? []).length} student
                      {(g.studentIds ?? []).length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Student list */}
                  <div className="p-4 space-y-2 max-h-44 overflow-y-auto">
                    {(g.studentIds ?? []).length === 0 && (
                      <p className="text-(--text-faint) text-xs text-center py-2">
                        No students — click unassigned students to add
                      </p>
                    )}
                    {(g.studentIds ?? []).map((sid) => (
                      <div
                        key={sid}
                        className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.03)] group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-6 h-6 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[10px] font-bold text-[#13eca4] shrink-0">
                          {getStudentName(sid)[0]}
                        </div>
                        <span className="text-(--text-muted) text-sm flex-1 truncate">
                          {getStudentName(sid)}
                        </span>
                        <button
                          onClick={() => handleRemoveStudent(g.id, sid)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-(--text-faint) hover:text-red-400"
                          title="Remove from group"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions row */}
                  <div
                    className="p-4 pt-0 flex items-center gap-2 border-t border-(--border-subtle) mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Copy link */}
                    <button
                      onClick={() => handleCopyLink(g.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[rgba(19,236,164,0.25)] text-[#13eca4] hover:bg-[#13eca4]/10 transition-colors"
                      title="Copy student collaboration link"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === g.id ? "check" : "link"}
                      </span>
                      {copiedId === g.id ? "Copied!" : "Copy Link"}
                    </button>

                    {/* Delete group */}
                    {confirmDeleteId === g.id ? (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[10px] text-red-400">Delete group?</span>
                        <button
                          onClick={() => handleDeleteGroup(g.id)}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/30"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] text-(--text-muted) hover:text-(--text-base)"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(g.id)}
                        className="ml-auto text-(--text-faint) hover:text-red-400 transition-colors"
                        title="Delete group"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Create new group card */}
              <div
                onClick={handleCreateGroup}
                className="bg-[rgba(255,255,255,0.02)] border-2 border-dashed border-(--border-subtle) rounded-2xl p-5 flex flex-col items-center justify-center gap-3 h-40 hover:border-(--border-strong) hover:bg-[rgba(19,236,164,0.02)] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-(--input-bg) group-hover:bg-[rgba(19,236,164,0.1)] flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[22px] text-(--text-faint) group-hover:text-[#13eca4]">
                    add
                  </span>
                </div>
                <span className="text-(--text-faint) group-hover:text-[#13eca4] text-sm font-semibold transition-colors">
                  Create New Group
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Unassigned students ────────────────────────────────── */}
        <div className="w-72 bg-(--bg-page) border-l border-(--border-subtle) flex flex-col">
          <div className="p-5 border-b border-(--border-subtle)">
            <h2 className="text-(--text-base) font-bold text-sm mb-1">Unassigned Students</h2>
            {activeGroup && (
              <p className="text-(--text-faint) text-xs mb-3">
                Click a student to add to <span className="text-[#13eca4]">{activeGroup.name}</span>
              </p>
            )}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students…"
                className="w-full bg-(--input-bg) border border-(--border-subtle) text-(--text-base) placeholder:text-(--text-faint) rounded-xl px-3 py-2 pl-9 text-sm focus:outline-none focus:border-[#13eca4]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!activeGroup && (
              <p className="text-(--text-faint) text-xs text-center py-4 px-2">
                Select a group card first, then click students to assign them.
              </p>
            )}
            {activeGroup && unassignedStudents.length === 0 && (
              <p className="text-(--text-faint) text-xs text-center py-4">All students are assigned</p>
            )}
            {activeGroup &&
              unassignedStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAssignStudent(s.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-(--hover-subtle) hover:border-(--border-accent) border border-transparent transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-full bg-(--bg-elevated) flex items-center justify-center text-xs font-bold text-(--text-muted) group-hover:bg-[rgba(19,236,164,0.15)] group-hover:text-[#13eca4] transition-colors shrink-0">
                    {s.name[0]}
                  </div>
                  <span className="text-(--text-muted) text-sm font-medium group-hover:text-(--text-base) transition-colors flex-1 truncate">
                    {s.name}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-(--text-faint) group-hover:text-[#13eca4] transition-colors">
                    add
                  </span>
                </button>
              ))}
          </div>

          <div className="p-3 border-t border-(--border-subtle)">
            <p className="text-(--text-faint) text-[10px] text-center">
              {allStudentIds.length} total enrolled ·{" "}
              {allStudentIds.length - assignedStudentIds.size} unassigned
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
