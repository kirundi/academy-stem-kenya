"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatTimestamp } from "@/lib/timestamps";

const roleColors: Record<string, string> = {
  student: "#3b82f6",
  teacher: "#13eca4",
  school_admin: "#f59e0b",
  admin: "#ff4d4d",
  super_admin: "#f59e0b",
};

const roleBadge: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School Admin",
  admin: "Admin",
  super_admin: "Super Admin",
};

type InviteRole = "admin" | "school_admin" | "teacher";

interface ConfirmAction {
  type: "role_change" | "delete";
  userId: string;
  userName: string;
  newRole?: string;
}

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const { allUsers, schools, loading } = useGlobalAdminData();
  const { appUser } = useAuthContext();

  const isSuperAdmin = appUser?.role === "super_admin";

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("teacher");
  const [inviteSchoolId, setInviteSchoolId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [inviteError, setInviteError] = useState("");

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));

  const filtered = allUsers.filter((u) => {
    const matchSearch =
      (u.displayName?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (u.email?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts: Record<string, number> = {};
  allUsers.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  });

  // Roles available for invite based on caller's role
  const inviteRoleOptions: InviteRole[] = isSuperAdmin
    ? ["admin", "school_admin", "teacher"]
    : ["school_admin", "teacher"];

  // Roles available for role change in context menu
  const changeableRoles = isSuperAdmin
    ? ["student", "teacher", "school_admin", "admin"] as const
    : ["student", "teacher", "school_admin"] as const;

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          displayName: inviteName,
          role: inviteRole,
          schoolId: inviteSchoolId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to invite user");
      } else {
        setInviteResult({ email: data.email, tempPassword: data.tempPassword });
      }
    } catch {
      setInviteError("Network error");
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    setShowInvite(false);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("teacher");
    setInviteSchoolId("");
    setInviteResult(null);
    setInviteError("");
  };

  const handleRoleChange = (userId: string, userName: string, newRole: string) => {
    setOpenMenu(null);
    setConfirmAction({ type: "role_change", userId, userName, newRole });
  };

  const handleDelete = (userId: string, userName: string) => {
    setOpenMenu(null);
    setConfirmAction({ type: "delete", userId, userName });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === "role_change") {
        await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: confirmAction.userId, role: confirmAction.newRole }),
        });
      } else if (confirmAction.type === "delete") {
        await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: confirmAction.userId, role: "deleted" }),
        });
      }
      window.location.reload();
    } catch {
      // silently fail — reload shows current state
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  // Can the current user modify this target user?
  const canModifyUser = (targetRole: string) => {
    if (targetRole === "super_admin") return false; // Nobody can modify super_admin
    if (!isSuperAdmin && targetRole === "admin") return false; // Only super_admin can modify admins
    return true;
  };

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-xs mt-0.5">{allUsers.length} users on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.12)] text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:border-[#13eca4] hover:text-[#13eca4] transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Invite User
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-[#1a2e27] p-5 rounded-2xl border border-[rgba(19,236,164,0.07)]">
            <span className="text-slate-400 text-sm font-medium">Total Users</span>
            <p className="text-white text-3xl font-bold mt-2">{allUsers.length}</p>
          </div>
          {Object.entries(roleBadge).map(([key, label]) => (
            <div key={key} className="bg-[#1a2e27] p-5 rounded-2xl border border-[rgba(19,236,164,0.07)]">
              <span className="text-slate-400 text-sm font-medium">{label}s</span>
              <p className="text-3xl font-bold mt-2" style={{ color: roleColors[key] }}>{roleCounts[key] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "student", "teacher", "school_admin", "admin", "super_admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  roleFilter === r ? "bg-[#13eca4] text-[#10221c]" : "bg-[rgba(255,255,255,0.06)] text-slate-400 hover:text-white"
                }`}
              >
                {r === "all" ? "All" : roleBadge[r] ?? r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-[rgba(255,255,255,0.05)]">
                <th className="px-6 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-center font-medium">Role</th>
                <th className="px-4 py-3 text-center font-medium">School</th>
                <th className="px-4 py-3 text-center font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found</td>
                </tr>
              ) : (
                filtered.map((u, i) => {
                  const color = roleColors[u.role] ?? "#13eca4";
                  const joined = formatTimestamp(u.createdAt, "--");
                  const modifiable = canModifyUser(u.role);
                  return (
                    <tr key={u.id} className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${color}15`, color }}>
                            {u.displayName?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{u.displayName}</p>
                            <p className="text-slate-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color, background: `${color}18` }}>
                          {roleBadge[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-300 text-xs">{u.schoolId ? schoolMap.get(u.schoolId) ?? "Unknown" : "--"}</td>
                      <td className="px-4 py-4 text-center text-slate-400 text-xs">{joined}</td>
                      <td className="px-4 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-[rgba(19,236,164,0.08)] rounded-lg text-slate-400 hover:text-[#13eca4] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          {modifiable && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === i ? null : i)}
                                className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                              </button>
                              {openMenu === i && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-[#1a2e27] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-20 overflow-hidden">
                                  <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.05)]">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Change Role</p>
                                  </div>
                                  {changeableRoles.map((role) => (
                                    <button
                                      key={role}
                                      disabled={u.role === role}
                                      onClick={() => handleRoleChange(u.id, u.displayName, role)}
                                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                                        u.role === role
                                          ? "text-slate-600 cursor-not-allowed"
                                          : "text-slate-300 hover:bg-[rgba(255,255,255,0.05)]"
                                      }`}
                                    >
                                      <span className="w-2 h-2 rounded-full" style={{ background: roleColors[role] }} />
                                      {roleBadge[role]}
                                      {u.role === role && <span className="text-[10px] text-slate-600 ml-auto">Current</span>}
                                    </button>
                                  ))}
                                  <div className="border-t border-[rgba(255,255,255,0.05)]">
                                    <button
                                      onClick={() => handleDelete(u.id, u.displayName)}
                                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 font-bold hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                                    >
                                      Delete User
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.05)]">
            <p className="text-slate-500 text-xs">Showing {filtered.length} of {allUsers.length} users</p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={closeInviteModal}>
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.12)] w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Invite User</h2>
                <p className="text-slate-400 text-xs mt-0.5">Create a new account with a temporary password</p>
              </div>
              <button onClick={closeInviteModal} className="p-1.5 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {inviteResult ? (
              <div className="px-6 py-6">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-2xl text-[#13eca4]">check_circle</span>
                  </div>
                  <p className="text-white font-bold">Account Created</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Email</label>
                    <p className="text-white text-sm font-mono mt-0.5">{inviteResult.email}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">Temporary Password</label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[#13eca4] font-mono font-bold tracking-wider">{inviteResult.tempPassword}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(inviteResult.tempPassword)}
                        className="p-1 hover:bg-[rgba(19,236,164,0.08)] rounded text-slate-400 hover:text-[#13eca4] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeInviteModal}
                  className="mt-5 w-full bg-[#13eca4] text-[#10221c] font-bold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Display Name</label>
                  <input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Role</label>
                  <div className="flex gap-2">
                    {inviteRoleOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => setInviteRole(r)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
                          inviteRole === r
                            ? "border-[#13eca4] bg-[rgba(19,236,164,0.08)] text-[#13eca4]"
                            : "border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white"
                        }`}
                      >
                        {roleBadge[r]}
                      </button>
                    ))}
                  </div>
                </div>
                {inviteRole === "school_admin" && (
                  <div>
                    <label className="text-slate-400 text-xs font-medium block mb-1.5">School</label>
                    <select
                      value={inviteSchoolId}
                      onChange={(e) => setInviteSchoolId(e.target.value)}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                    >
                      <option value="">Select a school</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {inviteError && (
                  <div className="bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] rounded-lg px-4 py-2.5">
                    <p className="text-[#ff4d4d] text-sm">{inviteError}</p>
                  </div>
                )}

                <button
                  onClick={handleInvite}
                  disabled={inviteLoading || !inviteEmail || !inviteName}
                  className="w-full bg-[#13eca4] text-[#10221c] font-bold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {inviteLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  )}
                  {inviteLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setConfirmAction(null)}>
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(255,255,255,0.1)] w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                confirmAction.type === "delete" ? "bg-[rgba(255,77,77,0.1)]" : "bg-[rgba(245,158,11,0.1)]"
              }`}>
                <span className={`material-symbols-outlined text-2xl ${
                  confirmAction.type === "delete" ? "text-[#ff4d4d]" : "text-amber-500"
                }`}>
                  {confirmAction.type === "delete" ? "delete_forever" : "swap_horiz"}
                </span>
              </div>
              <h3 className="text-white font-bold">
                {confirmAction.type === "delete" ? "Delete User" : "Change Role"}
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                {confirmAction.type === "delete"
                  ? `Are you sure you want to delete ${confirmAction.userName}? This action cannot be undone.`
                  : `Change ${confirmAction.userName}'s role to ${roleBadge[confirmAction.newRole!] ?? confirmAction.newRole}?`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 border border-[rgba(255,255,255,0.1)] text-slate-300 font-semibold text-sm py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className={`flex-1 font-bold text-sm py-2.5 rounded-lg transition-opacity disabled:opacity-50 ${
                  confirmAction.type === "delete"
                    ? "bg-[#ff4d4d] text-white hover:opacity-90"
                    : "bg-[#13eca4] text-[#10221c] hover:opacity-90"
                }`}
              >
                {actionLoading ? "Processing..." : confirmAction.type === "delete" ? "Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
