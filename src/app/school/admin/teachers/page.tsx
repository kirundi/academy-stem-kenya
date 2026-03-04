"use client";

import { useState } from "react";
import { useSchoolAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDeleteDoc } from "@/hooks/useFirestore";

const statusBadge: Record<string, string> = {
  active: "text-emerald-500",
  inactive: "text-(--text-muted)",
  invited: "text-amber-500",
};
const statusDot: Record<string, string> = {
  active: "bg-emerald-500",
  inactive: "bg-slate-400",
  invited: "bg-amber-500",
};

const deptColors: Record<string, string> = {
  Physics: "#13eca4",
  Robotics: "#3b82f6",
  Biotech: "#8b5cf6",
  "Comp Sci": "#13eca4",
  "Game Design": "#ec4899",
  "Green Tech": "#10b981",
  "Data Sci": "#f59e0b",
  Cybersec: "#06b6d4",
  default: "#13eca4",
};

export default function TeacherManagementPage() {
  const { appUser } = useAuthContext();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; inviteLink: string } | null>(
    null
  );
  const [inviteError, setInviteError] = useState("");
  const [copied, setCopied] = useState(false);

  const { teachers, classrooms, loading } = useSchoolAdminData();
  const { remove } = useDeleteDoc("users");

  const pendingInvites = teachers.filter((t) => t.requiresPasswordChange).length;

  const filtered = teachers.filter(
    (t) =>
      (t.displayName?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (t.email?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (t.department?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          displayName: inviteName.trim(),
          role: "teacher",
          schoolId: appUser?.schoolId ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      setInviteResult({ email: inviteEmail.trim(), inviteLink: data.inviteLink });
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInviteLoading(false);
    }
  };

  const resetInviteModal = () => {
    setShowInvite(false);
    setInviteName("");
    setInviteEmail("");
    setInviteResult(null);
    setInviteError("");
    setCopied(false);
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
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgba(19,236,164,0.1)] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#13eca4] text-[18px]">school</span>
            </div>
            <span className="text-(--text-base) font-bold">STEM Academy</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="/school/admin"
              className="text-(--text-muted) hover:text-[#13eca4] font-medium transition-colors"
            >
              Dashboard
            </a>
            <span className="text-[#13eca4] font-semibold border-b-2 border-[#13eca4] pb-0.5">
              Staff Management
            </span>
            <a
              href="/school/admin/classrooms"
              className="text-(--text-muted) hover:text-[#13eca4] font-medium transition-colors"
            >
              Curriculum
            </a>
            <a
              href="/school/admin/students"
              className="text-(--text-muted) hover:text-[#13eca4] font-medium transition-colors"
            >
              Students
            </a>
            <a
              href="/school/admin/analytics"
              className="text-(--text-muted) hover:text-[#13eca4] font-medium transition-colors"
            >
              Analytics
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-(--input-bg) rounded-lg border border-(--border-subtle) px-3 py-1.5">
            <span className="material-symbols-outlined text-(--text-muted) text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="bg-transparent border-none text-(--text-base) text-sm placeholder:text-(--text-faint) focus:outline-none ml-2 w-40"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Page Title */}
        <section className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#13eca4] mb-1">
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span className="text-xs font-bold uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-(--text-base) text-4xl font-black leading-tight">Teacher Management</h1>
            <p className="text-(--text-muted) mt-1 max-w-2xl">
              Manage your educational staff, oversee department performance, and invite new
              educators.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-(--border-subtle) text-(--text-muted) text-sm font-bold hover:bg-(--input-bg) transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>Export Report
            </button>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>Invite
              Teachers
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Total Teachers",
              value: String(teachers.length),
              badge: `${teachers.length} on platform`,
              badgeColor: "text-emerald-500",
              icon: "groups",
              iconColor: "#13eca4",
            },
            {
              label: "Active Classes",
              value: String(classrooms.length),
              badge: "Across departments",
              badgeColor: "text-(--text-muted)",
              icon: "class",
              iconColor: "#13eca4",
            },
            {
              label: "Pending Invites",
              value: String(pendingInvites),
              badge: pendingInvites > 0 ? "Requires follow-up" : "All accepted",
              badgeColor: pendingInvites > 0 ? "text-amber-500" : "text-emerald-500",
              icon: "mail",
              iconColor: "#f59e0b",
            },
            {
              label: "Staff Attendance",
              value: "--",
              badge: "Not tracked",
              badgeColor: "text-(--text-muted)",
              icon: "verified_user",
              iconColor: "#13eca4",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-(--bg-card) p-6 rounded-2xl border border-(--border-subtle)"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-(--text-muted) text-sm font-medium">{s.label}</span>
                <span
                  className="material-symbols-outlined p-2 rounded-lg bg-[rgba(19,236,164,0.08)] text-[20px]"
                  style={{ color: s.iconColor }}
                >
                  {s.icon}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-(--text-base) text-3xl font-bold">{s.value}</span>
                <span className={`text-xs font-bold ${s.badgeColor}`}>{s.badge}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Table */}
        <section className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
          <div className="px-6 py-5 border-b border-(--border-subtle) flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-60">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) text-[18px]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or department..."
                  className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg pl-10 pr-4 py-2 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
                />
              </div>
            </div>
            <span className="text-(--text-faint) text-sm">
              Showing {filtered.length} of {teachers.length} teachers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)] text-(--text-faint) text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Teacher Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Subjects</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-(--text-faint)">
                      {teachers.length === 0
                        ? "No teachers yet. Invite the first one!"
                        : "No teachers found."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const dept = t.department ?? "General";
                    const deptColor = deptColors[dept] ?? deptColors.default;
                    const status = t.requiresPasswordChange ? "invited" : "active";
                    const tid = t.uid ?? (t as { id?: string }).id ?? "";
                    return (
                      <tr key={tid} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-[rgba(19,236,164,0.1)] text-[#13eca4]">
                              <span className="material-symbols-outlined text-[18px]">person</span>
                            </div>
                            <div>
                              <p className="font-bold text-(--text-base)">{t.displayName}</p>
                              <p className="text-xs text-(--text-faint)">{t.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight"
                            style={{ background: `${deptColor}15`, color: deptColor }}
                          >
                            {dept}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-(--text-muted) font-medium">
                          {t.subjects?.join(", ") ?? "--"}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${statusBadge[status]}`}>
                            <span
                              className={`w-2 h-2 rounded-full ${statusDot[status]} ${status === "invited" ? "animate-pulse" : ""}`}
                            />
                            <span className="text-xs font-bold capitalize">{status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 relative">
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === tid ? null : tid)}
                                className="p-2 hover:bg-(--input-bg) rounded-lg text-(--text-muted) hover:text-slate-200 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  more_vert
                                </span>
                              </button>
                              {openMenu === tid && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-(--bg-card) border border-(--border-subtle) rounded-xl shadow-2xl z-20 overflow-hidden">
                                  <button className="w-full text-left px-4 py-2.5 text-sm text-(--text-muted) hover:bg-(--input-bg) transition-colors">
                                    Edit Profile
                                  </button>
                                  <button
                                    onClick={() => {
                                      remove(tid);
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 font-bold hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                                  >
                                    Revoke Access
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-(--bg-card) border border-(--border-medium) rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {!inviteResult ? (
              <>
                <h2 className="text-(--text-base) font-bold text-lg mb-1">Invite a Teacher</h2>
                <p className="text-(--text-muted) text-sm mb-5">
                  A secure invite link will be emailed to the teacher.
                </p>
                {inviteError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {inviteError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Wanjiku Maina"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="teacher@school.org"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-(--bg-page) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm outline-none focus:border-(--border-strong) placeholder:text-(--text-faint)"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={resetInviteModal}
                    className="flex-1 border border-(--border-subtle) text-(--text-muted) text-sm font-semibold py-2.5 rounded-xl hover:border-(--border-accent) transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading || !inviteEmail.trim() || !inviteName.trim()}
                    className="flex-1 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0dd494] transition-colors disabled:opacity-50"
                  >
                    {inviteLoading ? "Sending..." : "Send Invite"}
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
                <h2 className="text-(--text-base) font-bold text-lg mb-1">Invite Sent!</h2>
                <p className="text-(--text-muted) text-sm mb-5">
                  Invite link for{" "}
                  <span className="text-(--text-base) font-semibold">{inviteResult.email}</span>
                </p>
                <div className="bg-(--bg-page) border border-dashed border-(--border-strong) rounded-xl p-4 mb-5 text-left">
                  <p className="text-xs font-mono text-[#13eca4] break-all">
                    {inviteResult.inviteLink}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteResult.inviteLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border border-(--border-accent) text-[#13eca4] text-sm font-bold py-2.5 rounded-xl hover:bg-[rgba(19,236,164,0.1)] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copied ? "check" : "content_copy"}
                    </span>
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    onClick={resetInviteModal}
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
