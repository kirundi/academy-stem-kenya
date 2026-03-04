"use client";

import { useState } from "react";
import { useSchoolAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCreateDoc, useUpdateDoc } from "@/hooks/useFirestore";
import { generateJoinCode } from "@/lib/client-code";

export default function ClassroomsPage() {
  const { appUser } = useAuthContext();
  const [search, setSearch] = useState("");
  const [, setPrefix] = useState("TECH-");
  const [pendingPrefix, setPendingPrefix] = useState("TECH-");
  const [codeMode, setCodeMode] = useState("Alphanumeric (8 chars)");
  const [editedCodes, setEditedCodes] = useState<Record<string, string>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);

  // Create class modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", subject: "", grade: "", teacherId: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const { classrooms, teachers, loading } = useSchoolAdminData();
  const { create } = useCreateDoc("classrooms");
  const { update } = useUpdateDoc("classrooms");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
          progress_activity
        </span>
      </div>
    );
  }

  const teacherMap = new Map(
    teachers.map((t) => [t.uid ?? (t as { id?: string }).id ?? "", t.displayName])
  );

  const filtered = classrooms.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (teacherMap.get(c.teacherId) ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCodes = classrooms.filter((c) => c.joinCode && c.joinCode.trim() !== "").length;
  const expiredCodes = classrooms.filter((c) => !c.joinCode || c.joinCode.trim() === "").length;

  const getCodeForClassroom = (id: string, defaultCode: string) =>
    editedCodes[id] !== undefined ? editedCodes[id] : defaultCode;

  const regenerateCode = (id: string) => {
    const code = generateJoinCode();
    setEditedCodes((prev) => ({ ...prev, [id]: code }));
  };

  const saveCode = async (id: string) => {
    const code = editedCodes[id];
    if (!code) return;
    setSavingCode(id);
    try {
      await update(id, { joinCode: code });
      setEditedCodes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setSavingCode(null);
    }
  };

  const handleBulkGenerate = async () => {
    for (const c of classrooms) {
      const code = generateJoinCode();
      await update(c.id, { joinCode: code });
    }
  };

  const handleCreateClass = async () => {
    if (!createForm.name.trim()) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const teacherId =
        createForm.teacherId || (teachers[0]?.uid ?? (teachers[0] as { id?: string })?.id ?? "");
      const teacherName = teacherMap.get(teacherId) ?? "";
      await create({
        name: createForm.name.trim(),
        subject: createForm.subject.trim(),
        grade: createForm.grade.trim(),
        teacherId,
        teacherName,
        schoolId: appUser?.schoolId ?? "",
        joinCode: generateJoinCode(),
        enrolled: 0,
        capacity: 30,
        avgProgress: 0,
        courseIds: [],
      });
      setShowCreate(false);
      setCreateForm({ name: "", subject: "", grade: "", teacherId: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create class");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) text-[18px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teachers or classes..."
              className="w-full bg-(--bg-card) border-none rounded-lg py-1.5 pl-10 pr-4 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:ring-1 focus:ring-[#13eca4]"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary-green text-white font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Class
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-(--text-base) mb-2">
            Classroom Setup &amp; Code Configuration
          </h1>
          <p className="text-(--text-muted) text-base">
            Manage and distribute unique access codes for teacher classrooms across the district.
          </p>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-(--bg-card) border border-(--border-subtle) p-6 rounded-xl">
            <p className="text-(--text-muted) text-sm font-medium mb-1">Total Classrooms</p>
            <p className="text-3xl font-bold text-(--text-base)">{classrooms.length}</p>
          </div>
          <div className="bg-(--bg-card) border border-(--border-subtle) p-6 rounded-xl">
            <p className="text-(--text-muted) text-sm font-medium mb-1">Active Codes</p>
            <p className="text-3xl font-bold text-(--text-base)">{activeCodes}</p>
            <div className="mt-2 text-xs text-primary-green flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              {classrooms.length > 0
                ? `${Math.round((activeCodes / classrooms.length) * 100)}%`
                : "0%"}{" "}
              utilization
            </div>
          </div>
          <div className="bg-(--bg-card) border border-(--border-subtle) p-6 rounded-xl">
            <p className="text-(--text-muted) text-sm font-medium mb-1">Expired Codes</p>
            <p className="text-3xl font-bold text-red-400">{expiredCodes}</p>
            <div className="mt-2 text-xs text-(--text-faint) flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              Renewal required
            </div>
          </div>
        </section>

        {/* Global Configuration */}
        <section className="bg-(--bg-card) border border-(--border-subtle) p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-(--text-base) flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-green">settings_suggest</span>
              Global Configuration
            </h2>
            <button
              onClick={() => {
                setPendingPrefix("TECH-");
                setPrefix("TECH-");
                setCodeMode("Alphanumeric (8 chars)");
              }}
              className="text-primary-green text-sm font-medium hover:underline"
            >
              Reset Defaults
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-muted)">Set Custom School Prefix</label>
              <div className="flex gap-2">
                <input
                  value={pendingPrefix}
                  onChange={(e) => setPendingPrefix(e.target.value.toUpperCase())}
                  className="flex-1 bg-(--bg-page) border border-(--border-medium) rounded-lg px-3 py-2 text-sm text-(--text-base) uppercase focus:outline-none focus:ring-1 focus:ring-[#13eca4]"
                />
                <button
                  onClick={() => setPrefix(pendingPrefix)}
                  className="bg-primary-green/15 text-primary-green px-3 py-2 rounded-lg text-sm font-bold border border-[rgba(19,236,164,0.25)] hover:bg-[rgba(19,236,164,0.25)] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--text-muted)">Auto-generation Mode</label>
              <select
                value={codeMode}
                onChange={(e) => setCodeMode(e.target.value)}
                className="w-full bg-(--bg-page) border border-(--border-medium) rounded-lg px-3 py-2 text-sm text-(--text-base) focus:outline-none focus:ring-1 focus:ring-[#13eca4]"
              >
                <option>Alphanumeric (8 chars)</option>
                <option>Numeric (6 chars)</option>
                <option>Word-based (Random)</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <button
                onClick={handleBulkGenerate}
                className="w-full bg-primary-green text-white h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-base">bolt</span>
                Bulk Generate Codes
              </button>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="bg-(--bg-card) border border-(--border-subtle) rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-(--border-subtle) flex items-center justify-between">
            <h3 className="font-bold text-(--text-base)">Classrooms &amp; Code Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-(--text-muted) uppercase bg-[rgba(0,0,0,0.2)]">
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Classroom Name</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Class Code</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-(--text-faint)">
                      {classrooms.length === 0
                        ? "No classrooms yet. Create one above."
                        : "No classrooms found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const code = getCodeForClassroom(c.id, c.joinCode ?? "");
                    const isExpired = !code || code.trim() === "";
                    const teacherName = teacherMap.get(c.teacherId) ?? "Unassigned";
                    const teacherInitials =
                      teacherName !== "Unassigned"
                        ? teacherName
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "?";
                    const hasUnsavedCode = editedCodes[c.id] !== undefined;

                    return (
                      <tr key={c.id} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-green/10 flex items-center justify-center text-primary-green text-xs font-bold shrink-0">
                              {teacherInitials}
                            </div>
                            <span className="text-sm font-medium text-(--text-base)">{teacherName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-(--text-muted)">{c.name}</td>
                        <td className="px-6 py-4 text-sm text-(--text-muted)">{c.grade}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 group">
                            <input
                              value={isExpired ? "EXPIRED" : code}
                              onChange={(e) =>
                                setEditedCodes((prev) => ({ ...prev, [c.id]: e.target.value }))
                              }
                              className={`w-28 border-none rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 ${
                                isExpired
                                  ? "bg-red-900/20 text-red-400 focus:ring-red-500"
                                  : "bg-[rgba(0,0,0,0.2)] text-primary-green focus:ring-[#13eca4]"
                              }`}
                            />
                            {isExpired ? (
                              <span className="text-red-400">
                                <span className="material-symbols-outlined text-base">warning</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => regenerateCode(c.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-(--text-muted) hover:text-primary-green"
                                title="Regenerate code"
                              >
                                <span className="material-symbols-outlined text-base">refresh</span>
                              </button>
                            )}
                            {hasUnsavedCode && (
                              <button
                                onClick={() => saveCode(c.id)}
                                disabled={savingCode === c.id}
                                className="text-xs font-bold text-primary-green border border-(--border-strong) px-2 py-0.5 rounded hover:bg-primary-green/10 transition-colors"
                              >
                                {savingCode === c.id ? "..." : "Save"}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-900/20 text-red-400 border border-red-900/40">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-green/15 text-primary-green border border-[rgba(19,236,164,0.25)]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigator.clipboard.writeText(code)}
                            className="text-(--text-muted) hover:text-primary-green transition-colors"
                            title="Copy code"
                          >
                            <span className="material-symbols-outlined text-base">
                              content_copy
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination info */}
          <div className="px-6 py-4 border-t border-(--border-subtle) flex items-center justify-between text-xs text-(--text-muted)">
            <span>
              Showing {filtered.length} of {classrooms.length} classrooms
            </span>
          </div>
        </section>
      </main>

      {/* Create Class Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-(--bg-card) border border-(--border-medium) rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-(--text-base) font-bold text-lg mb-1">Create New Classroom</h2>
            <p className="text-(--text-muted) text-sm mb-5">
              A join code will be automatically generated.
            </p>
            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {createError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                  Class Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Robotics 101-A"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robotics"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                    Grade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 8"
                    value={createForm.grade}
                    onChange={(e) => setCreateForm((f) => ({ ...f, grade: e.target.value }))}
                    className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                  />
                </div>
              </div>
              {teachers.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                    Assign Teacher
                  </label>
                  <select
                    value={createForm.teacherId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, teacherId: e.target.value }))}
                    className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong)"
                  >
                    <option value="">Select a teacher...</option>
                    {teachers.map((t) => {
                      const tid = t.uid ?? (t as { id?: string }).id ?? "";
                      return (
                        <option key={tid} value={tid}>
                          {t.displayName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setCreateForm({ name: "", subject: "", grade: "", teacherId: "" });
                  setCreateError("");
                }}
                className="flex-1 border border-(--border-subtle) text-(--text-muted) text-sm font-semibold py-2.5 rounded-xl hover:border-(--border-accent) transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                disabled={createLoading || !createForm.name.trim()}
                className="flex-1 bg-primary-green text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors disabled:opacity-50"
              >
                {createLoading ? "Creating..." : "Create Classroom"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
