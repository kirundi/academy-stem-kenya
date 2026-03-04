"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatTimestamp } from "@/lib/timestamps";
import { exportToCsv } from "@/lib/csv-export";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS,
  ROLE_DEFAULT_PERMISSIONS,
} from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";

const roleColors: Record<string, string> = {
  student: "#3b82f6",
  teacher: "#13eca4",
  school_admin: "#f59e0b",
  editor: "#ec4899",
  admin: "#ff4d4d",
  super_admin: "#f59e0b",
  parent: "#8b5cf6",
  support: "#3b82f6",
  observer: "#06b6d4",
  content_reviewer: "#f59e0b",
  analytics_viewer: "#a855f7",
  mentor: "#10b981",
};

const roleBadge: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School Admin",
  editor: "Editor",
  admin: "Admin",
  super_admin: "Super Admin",
  parent: "Parent",
  support: "Support",
  observer: "Observer",
  content_reviewer: "Reviewer",
  analytics_viewer: "Analytics",
  mentor: "Mentor",
};

// Roles that can be granted as secondary roles (not admin/super_admin)
const GRANTABLE_SECONDARY_ROLES = [
  "teacher", "school_admin", "editor", "parent",
  "support", "observer", "content_reviewer", "analytics_viewer", "mentor",
] as const;

// Incompatible combinations (shown as warnings in UI)
const INCOMPATIBLE_PAIRS: [string, string][] = [
  ["editor", "content_reviewer"],
];

const USER_EXPORT_COLS = [
  { key: "displayName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "school", label: "School" },
  { key: "createdAt", label: "Joined" },
  { key: "updatedAt", label: "Last Active" },
  { key: "additionalRoles", label: "Additional Roles" },
];

const INVITE_EXPORT_COLS = [
  { key: "displayName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "invitedByName", label: "Invited By" },
  { key: "invitedAt", label: "Sent" },
  { key: "expiresAt", label: "Expires" },
  { key: "status", label: "Status" },
];

type InviteRole = "admin" | "school_admin" | "teacher";

interface ConfirmAction {
  type: "role_change" | "delete";
  userId: string;
  userName: string;
  newRole?: string;
}

interface InviteRecord {
  id: string;
  email: string;
  displayName: string;
  role: string;
  schoolId?: string | null;
  invitedByName: string;
  invitedAt: { seconds: number } | null;
  expiresAt: string | null;
  status: "pending" | "expired" | "accepted";
}

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const { allUsers, schools, loading } = useGlobalAdminData();
  const { appUser, hasPermission: ctxHasPermission } = useAuthContext();

  const isSuperAdmin = appUser?.role === "super_admin";
  const canManageUsers = ctxHasPermission("manage_users");

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("teacher");
  const [inviteSchoolId, setInviteSchoolId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; inviteLink: string } | null>(
    null
  );
  const [inviteError, setInviteError] = useState("");
  const [inviteShowAdvanced, setInviteShowAdvanced] = useState(false);
  const [invitePermissions, setInvitePermissions] = useState<Permission[]>([]);
  const [inviteSchoolIds, setInviteSchoolIds] = useState<string[]>([]);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Roles modal state
  const [rolesUser, setRolesUser] = useState<{ id: string; name: string; primaryRole: string } | null>(null);
  const [rolesChecked, setRolesChecked] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesSaving, setRolesSaving] = useState(false);
  const [rolesError, setRolesError] = useState("");

  // Permissions modal state
  const [permUser, setPermUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [permLoading, setPermLoading] = useState(false);
  const [permSaving, setPermSaving] = useState(false);
  const [permChecked, setPermChecked] = useState<Permission[]>([]);
  const [permSchoolIds, setPermSchoolIds] = useState<string[]>([]);
  const [permCustomized, setPermCustomized] = useState(false);

  // Export modal state
  const [showExport, setShowExport] = useState(false);
  const [exportDataset, setExportDataset] = useState<"users" | "invites" | "both">("users");
  const [exportUserCols, setExportUserCols] = useState<string[]>(
    USER_EXPORT_COLS.map((c) => c.key)
  );
  const [exportInviteCols, setExportInviteCols] = useState<string[]>(
    INVITE_EXPORT_COLS.map((c) => c.key)
  );
  const [exportRoleFilter, setExportRoleFilter] = useState("all");

  // Invites tab state
  const [activeTab, setActiveTab] = useState<"users" | "invites">("users");
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [inviteIs409, setInviteIs409] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
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
    ? (["student", "teacher", "school_admin", "admin"] as const)
    : (["student", "teacher", "school_admin"] as const);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const inviteBody: Record<string, unknown> = {
        email: inviteEmail,
        displayName: inviteName,
        role: inviteRole,
        schoolId: inviteSchoolId || null,
      };
      if (inviteShowAdvanced && invitePermissions.length > 0) {
        inviteBody.permissions = invitePermissions;
      }
      if (inviteShowAdvanced && inviteSchoolIds.length > 0) {
        inviteBody.schoolIds = inviteSchoolIds;
      }
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteBody),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setInviteIs409(true);
        setInviteError(data.error || "Failed to invite user");
      } else {
        setInviteResult({ email: data.email, inviteLink: data.inviteLink });
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
    setInviteIs409(false);
    setInviteShowAdvanced(false);
    setInvitePermissions([]);
    setInviteSchoolIds([]);
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

  // Open permissions modal for a user
  const openPermissions = async (userId: string, userName: string, role: string) => {
    setOpenMenu(null);
    setPermUser({ id: userId, name: userName, role });
    setPermLoading(true);
    try {
      const res = await fetch(`/api/admin/permissions?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setPermChecked(data.permissions || []);
        setPermSchoolIds(data.schoolIds || []);
        setPermCustomized(data.customized || false);
      }
    } catch {
      // Use role defaults on error
      setPermChecked([...(ROLE_DEFAULT_PERMISSIONS[role] || [])]);
      setPermSchoolIds([]);
      setPermCustomized(false);
    } finally {
      setPermLoading(false);
    }
  };

  const savePermissions = async () => {
    if (!permUser) return;
    setPermSaving(true);
    try {
      await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: permUser.id,
          permissions: permChecked,
          schoolIds: permSchoolIds.length > 0 ? permSchoolIds : null,
        }),
      });
      setPermUser(null);
    } catch {
      // Keep modal open on error
    } finally {
      setPermSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!permUser) return;
    setPermChecked([...(ROLE_DEFAULT_PERMISSIONS[permUser.role] || [])]);
    setPermCustomized(false);
  };

  const openRoles = async (userId: string, userName: string, primaryRole: string) => {
    setOpenMenu(null);
    setRolesUser({ id: userId, name: userName, primaryRole });
    setRolesChecked([]);
    setRolesError("");
    setRolesLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles`);
      const data = await res.json();
      if (res.ok) setRolesChecked(data.additionalRoles ?? []);
    } catch {
      // Start with empty list on error
    } finally {
      setRolesLoading(false);
    }
  };

  const saveRoles = async () => {
    if (!rolesUser) return;
    setRolesSaving(true);
    setRolesError("");
    try {
      const res = await fetch(`/api/admin/users/${rolesUser.id}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalRoles: rolesChecked }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRolesError(data.error || "Failed to update roles");
      } else {
        setRolesUser(null);
      }
    } catch {
      setRolesError("Network error — please try again");
    } finally {
      setRolesSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    setRolesError("");
    setRolesChecked((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const getRoleConflict = (primaryRole: string, additional: string[]): string | null => {
    for (const [a, b] of INCOMPATIBLE_PAIRS) {
      const all = [primaryRole, ...additional];
      if (all.includes(a) && all.includes(b)) return `"${roleBadge[a]}" and "${roleBadge[b]}" conflict`;
    }
    return null;
  };

  const loadInvites = async () => {
    setInvitesLoading(true);
    try {
      const res = await fetch("/api/admin/invites");
      const data = await res.json();
      if (res.ok) setInvites(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    } finally {
      setInvitesLoading(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    setInviteActionId(email);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) await loadInvites();
    } catch {
      // silently fail
    } finally {
      setInviteActionId(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setInviteActionId(inviteId);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (res.ok) await loadInvites();
    } catch {
      // silently fail
    } finally {
      setInviteActionId(null);
    }
  };

  const handleResendFrom409 = async () => {
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteResult({ email: data.email, inviteLink: data.inviteLink });
        setInviteError("");
        setInviteIs409(false);
      } else {
        setInviteError(data.error || "Failed to resend invite");
      }
    } catch {
      setInviteError("Network error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleExport = async () => {
    const ts = (v: unknown) => {
      if (!v) return "";
      const sec = (v as { seconds?: number })?.seconds;
      if (sec) return new Date(sec * 1000).toLocaleDateString("en-KE");
      if (v instanceof Date) return v.toLocaleDateString("en-KE");
      if (typeof v === "string") return new Date(v).toLocaleDateString("en-KE");
      return "";
    };

    if (exportDataset === "users" || exportDataset === "both") {
      const roleFiltered = exportRoleFilter === "all"
        ? allUsers
        : allUsers.filter((u) => u.role === exportRoleFilter);
      const rows = roleFiltered.map((u) => ({
        displayName: u.displayName ?? "",
        email: u.email ?? "",
        role: roleBadge[u.role] ?? u.role,
        school: u.schoolId ? (schoolMap.get(u.schoolId) ?? u.schoolId) : "",
        createdAt: ts(u.createdAt),
        updatedAt: ts((u as unknown as Record<string, unknown>).updatedAt),
        additionalRoles: ((u.additionalRoles ?? []) as string[]).map((r) => roleBadge[r] ?? r).join("; "),
      }));
      const cols = USER_EXPORT_COLS.filter((c) => exportUserCols.includes(c.key));
      exportToCsv("users", rows, cols);
    }

    if (exportDataset === "invites" || exportDataset === "both") {
      let inviteRows = invites;
      if (inviteRows.length === 0) {
        const res = await fetch("/api/admin/invites");
        const data = await res.json();
        inviteRows = Array.isArray(data) ? data : [];
      }
      const rows = inviteRows.map((inv) => ({
        displayName: inv.displayName ?? "",
        email: inv.email ?? "",
        role: roleBadge[inv.role] ?? inv.role,
        invitedByName: inv.invitedByName ?? "",
        invitedAt: inv.invitedAt ? ts(inv.invitedAt) : "",
        expiresAt: inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("en-KE") : "",
        status: inv.status,
      }));
      const cols = INVITE_EXPORT_COLS.filter((c) => exportInviteCols.includes(c.key));
      exportToCsv("invites", rows, cols);
    }

    setShowExport(false);
  };

  const togglePermission = (p: Permission) => {
    setPermChecked((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
    setPermCustomized(true);
  };

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-xs mt-0.5">{allUsers.length} users on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setExportDataset(activeTab === "invites" ? "invites" : "users");
              setShowExport(true);
            }}
            className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.12)] text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:border-[#13eca4] hover:text-[#13eca4] transition-colors"
          >
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
            <div
              key={key}
              className="bg-[#1a2e27] p-5 rounded-2xl border border-[rgba(19,236,164,0.07)]"
            >
              <span className="text-slate-400 text-sm font-medium">{label}s</span>
              <p className="text-3xl font-bold mt-2" style={{ color: roleColors[key] }}>
                {roleCounts[key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-[#1a2e27] p-1 rounded-xl border border-[rgba(19,236,164,0.08)] self-start">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "users"
                ? "bg-[#13eca4] text-[#10221c]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Active Users
            <span className="ml-2 text-xs opacity-70">({allUsers.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("invites");
              if (invites.length === 0) loadInvites();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "invites"
                ? "bg-[#13eca4] text-[#10221c]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Invites
            {invites.filter((i) => i.status === "pending").length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "invites" ? "bg-[#10221c] text-[#13eca4]" : "bg-[rgba(19,236,164,0.15)] text-[#13eca4]"
              }`}>
                {invites.filter((i) => i.status === "pending").length}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className={`flex flex-wrap items-center gap-4 ${activeTab !== "users" ? "hidden" : ""}`}>
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              "all", "student", "teacher", "school_admin", "editor", "admin", "super_admin",
              "parent", "support", "observer", "content_reviewer", "analytics_viewer", "mentor",
            ].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  roleFilter === r
                    ? "bg-[#13eca4] text-[#10221c]"
                    : "bg-[rgba(255,255,255,0.06)] text-slate-400 hover:text-white"
                }`}
              >
                {r === "all" ? "All" : (roleBadge[r] ?? r)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={`bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden ${activeTab !== "users" ? "hidden" : ""}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-[rgba(255,255,255,0.05)]">
                <th className="px-6 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-center font-medium">Role</th>
                <th className="px-4 py-3 text-center font-medium">School</th>
                <th className="px-4 py-3 text-center font-medium">Joined</th>
                <th className="px-4 py-3 text-center font-medium">Last Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => {
                  const color = roleColors[u.role] ?? "#13eca4";
                  const joined = formatTimestamp(u.createdAt, "--");
                  const lastActive = formatTimestamp((u as unknown as Record<string, unknown>).updatedAt, "--");
                  const modifiable = canModifyUser(u.role);
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: `${color}15`, color }}
                          >
                            {u.displayName
                              ?.split(" ")
                              .map((w: string) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) ?? "?"}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{u.displayName}</p>
                            <p className="text-slate-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ color, background: `${color}18` }}
                          >
                            {roleBadge[u.role] ?? u.role}
                          </span>
                          {(u.additionalRoles ?? []).map((r: string) => {
                            const rc = roleColors[r] ?? "#64748b";
                            return (
                              <span
                                key={r}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                                style={{ color: rc, borderColor: `${rc}40`, background: `${rc}10` }}
                                title={`Secondary: ${roleBadge[r] ?? r}`}
                              >
                                +{roleBadge[r] ?? r}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-300 text-xs">
                        {u.schoolId ? (schoolMap.get(u.schoolId) ?? "Unknown") : "--"}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-400 text-xs">{joined}</td>
                      <td className="px-4 py-4 text-center text-slate-400 text-xs">{lastActive}</td>
                      <td className="px-4 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-[rgba(19,236,164,0.08)] rounded-lg text-slate-400 hover:text-[#13eca4] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          {modifiable && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === i ? null : i)}
                                className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  more_vert
                                </span>
                              </button>
                              {openMenu === i && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-[#1a2e27] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-20 overflow-hidden">
                                  <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.05)]">
                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">
                                      Change Role
                                    </p>
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
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: roleColors[role] }}
                                      />
                                      {roleBadge[role]}
                                      {u.role === role && (
                                        <span className="text-[10px] text-slate-600 ml-auto">
                                          Current
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                  {canManageUsers && (
                                    <div className="border-t border-[rgba(255,255,255,0.05)]">
                                      <button
                                        onClick={() => openRoles(u.id, u.displayName, u.role)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">
                                          manage_accounts
                                        </span>
                                        Manage Roles
                                      </button>
                                      <button
                                        onClick={() => openPermissions(u.id, u.displayName, u.role)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-2"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">
                                          admin_panel_settings
                                        </span>
                                        Manage Permissions
                                      </button>
                                    </div>
                                  )}
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
            <p className="text-slate-500 text-xs">
              Showing {filtered.length} of {allUsers.length} users
            </p>
          </div>
        </div>

        {/* Invites Panel */}
        {activeTab === "invites" && (
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold">Sent Invites</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  {invites.filter((i) => i.status === "pending").length} pending ·{" "}
                  {invites.filter((i) => i.status === "expired").length} expired ·{" "}
                  {invites.filter((i) => i.status === "accepted").length} accepted
                </p>
              </div>
              <button
                onClick={loadInvites}
                disabled={invitesLoading}
                className="p-2 rounded-lg text-slate-400 hover:text-[#13eca4] hover:bg-[rgba(19,236,164,0.08)] transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <span className={`material-symbols-outlined text-[18px] ${invitesLoading ? "animate-spin" : ""}`}>
                  refresh
                </span>
              </button>
            </div>

            {invitesLoading && invites.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#13eca4]">progress_activity</span>
              </div>
            ) : invites.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-600 block mb-3">mark_email_unread</span>
                <p className="text-white font-semibold mb-1">No invites sent yet</p>
                <p className="text-slate-500 text-sm">Invite users with the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs border-b border-[rgba(255,255,255,0.05)]">
                      <th className="px-6 py-3 text-left font-medium">Invitee</th>
                      <th className="px-4 py-3 text-center font-medium">Role</th>
                      <th className="px-4 py-3 text-center font-medium">Invited By</th>
                      <th className="px-4 py-3 text-center font-medium">Sent</th>
                      <th className="px-4 py-3 text-center font-medium">Expires</th>
                      <th className="px-4 py-3 text-center font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv, i) => {
                      const color = roleColors[inv.role] ?? "#13eca4";
                      const sentTs = inv.invitedAt ? new Date((inv.invitedAt as { seconds: number }).seconds * 1000) : null;
                      const expiresTs = inv.expiresAt ? new Date(inv.expiresAt) : null;
                      const statusConfig = {
                        pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                        expired: { label: "Expired", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
                        accepted: { label: "Accepted", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                      }[inv.status] ?? { label: inv.status, color: "#64748b", bg: "rgba(100,116,139,0.1)" };

                      const isActioning = inviteActionId === inv.email || inviteActionId === inv.id;

                      return (
                        <tr
                          key={inv.id}
                          className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ background: `${color}15`, color }}
                              >
                                {inv.displayName?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{inv.displayName}</p>
                                <p className="text-slate-500 text-xs">{inv.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ color, background: `${color}18` }}
                            >
                              {roleBadge[inv.role] ?? inv.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center text-slate-400 text-xs">{inv.invitedByName}</td>
                          <td className="px-4 py-4 text-center text-slate-400 text-xs">
                            {sentTs ? sentTs.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                          <td className="px-4 py-4 text-center text-slate-400 text-xs">
                            {expiresTs ? expiresTs.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ color: statusConfig.color, background: statusConfig.bg }}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {inv.status !== "accepted" && (
                                <button
                                  onClick={() => handleResendInvite(inv.email)}
                                  disabled={isActioning}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#13eca4] hover:bg-[rgba(19,236,164,0.08)] transition-colors disabled:opacity-50"
                                  title="Resend invite"
                                >
                                  {isActioning ? (
                                    <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-[14px]">forward_to_inbox</span>
                                  )}
                                  Resend
                                </button>
                              )}
                              <button
                                onClick={() => handleRevokeInvite(inv.id)}
                                disabled={isActioning}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-colors disabled:opacity-50"
                                title="Revoke invite"
                              >
                                {isActioning ? (
                                  <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                )}
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={closeInviteModal}
        >
          <div
            className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.12)] w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Invite User</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  They&apos;ll receive a secure link to set their own password.
                </p>
              </div>
              <button
                onClick={closeInviteModal}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {inviteResult ? (
              <div className="px-6 py-6">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-2xl text-[#13eca4]">
                      mark_email_read
                    </span>
                  </div>
                  <p className="text-white font-bold">Invite Sent!</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Email delivered to{" "}
                    <span className="text-white font-semibold">{inviteResult.email}</span>
                  </p>
                </div>
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
                  <label className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">
                    Invite link (valid 48h)
                  </label>
                  <p className="text-[#13eca4] text-xs font-mono break-all mt-1">
                    {inviteResult.inviteLink}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(inviteResult.inviteLink)}
                    className="mt-2 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy link
                  </button>
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
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">
                    Display Name
                  </label>
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
                    placeholder="user@stemimpactcenterkenya.org"
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
                {(inviteRole === "school_admin" || inviteRole === "teacher") && (
                  <div>
                    <label className="text-slate-400 text-xs font-medium block mb-1.5">
                      School
                    </label>
                    <select
                      value={inviteSchoolId}
                      onChange={(e) => setInviteSchoolId(e.target.value)}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                    >
                      <option value="">Select a school</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Advanced: custom permissions & school scope for admin invites */}
                {inviteRole === "admin" && isSuperAdmin && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setInviteShowAdvanced(!inviteShowAdvanced);
                        if (!inviteShowAdvanced && invitePermissions.length === 0) {
                          setInvitePermissions([...(ROLE_DEFAULT_PERMISSIONS.admin || [])]);
                        }
                      }}
                      className="text-slate-400 text-xs font-medium hover:text-[#13eca4] transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {inviteShowAdvanced ? "expand_less" : "expand_more"}
                      </span>
                      {inviteShowAdvanced ? "Hide" : "Customize"} permissions &amp; school scope
                    </button>

                    {inviteShowAdvanced && (
                      <div className="mt-3 space-y-3">
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {ALL_PERMISSIONS.map((p) => {
                            const callerHas = ctxHasPermission(p);
                            return (
                              <label
                                key={p}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                                  invitePermissions.includes(p)
                                    ? "border-[rgba(19,236,164,0.15)] bg-[rgba(19,236,164,0.03)]"
                                    : "border-transparent"
                                } ${!callerHas ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={invitePermissions.includes(p)}
                                  disabled={!callerHas}
                                  onChange={() =>
                                    setInvitePermissions((prev) =>
                                      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                                    )
                                  }
                                  className="accent-[#13eca4]"
                                />
                                <span className="text-white text-xs">{PERMISSION_LABELS[p]}</span>
                              </label>
                            );
                          })}
                        </div>

                        <div>
                          <label className="text-slate-400 text-xs font-medium block mb-1.5">
                            Restrict to schools
                            <span className="text-slate-600 ml-1">(optional)</span>
                          </label>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {schools.map((s) => (
                              <label
                                key={s.id}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={inviteSchoolIds.includes(s.id)}
                                  onChange={() =>
                                    setInviteSchoolIds((prev) =>
                                      prev.includes(s.id)
                                        ? prev.filter((id) => id !== s.id)
                                        : [...prev, s.id]
                                    )
                                  }
                                  className="accent-[#13eca4]"
                                />
                                <span className="text-white text-xs">{s.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {inviteError && (
                  <div className="bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] rounded-lg px-4 py-3">
                    <p className="text-[#ff4d4d] text-sm">{inviteError}</p>
                    {inviteIs409 && (
                      <button
                        onClick={handleResendFrom409}
                        disabled={inviteLoading}
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#13eca4] hover:opacity-80 transition-opacity disabled:opacity-50"
                      >
                        {inviteLoading ? (
                          <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">forward_to_inbox</span>
                        )}
                        Resend the existing invite instead
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={handleInvite}
                  disabled={inviteLoading || !inviteEmail || !inviteName}
                  className="w-full bg-[#13eca4] text-[#10221c] font-bold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {inviteLoading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  )}
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Roles Modal */}
      {rolesUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setRolesUser(null)}
        >
          <div
            className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.12)] w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Manage Roles</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {rolesUser.name} — primary role:{" "}
                  <span
                    className="font-bold"
                    style={{ color: roleColors[rolesUser.primaryRole] ?? "#13eca4" }}
                  >
                    {roleBadge[rolesUser.primaryRole] ?? rolesUser.primaryRole}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setRolesUser(null)}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {rolesLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#13eca4]">
                  progress_activity
                </span>
              </div>
            ) : (
              <div className="px-6 py-5">
                <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                  Secondary roles grant access to additional portals without changing the user&apos;s
                  primary dashboard. Changes take effect on their next login.
                </p>

                {/* Current primary role (locked) */}
                <div className="mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-2">
                    Primary Role (locked)
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      color: roleColors[rolesUser.primaryRole] ?? "#13eca4",
                      background: `${roleColors[rolesUser.primaryRole] ?? "#13eca4"}18`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    {roleBadge[rolesUser.primaryRole] ?? rolesUser.primaryRole}
                  </span>
                </div>

                {/* Secondary role checkboxes */}
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-3">
                  Additional Roles
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {GRANTABLE_SECONDARY_ROLES.filter((r) => r !== rolesUser.primaryRole).map((r) => {
                    const isChecked = rolesChecked.includes(r);
                    const rc = roleColors[r] ?? "#64748b";
                    // Check if this role would create a conflict
                    const wouldConflict = (() => {
                      const testSet = isChecked
                        ? rolesChecked.filter((x) => x !== r)
                        : [...rolesChecked, r];
                      return getRoleConflict(rolesUser.primaryRole, testSet) !== null;
                    })();
                    return (
                      <label
                        key={r}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "border-[rgba(19,236,164,0.25)] bg-[rgba(19,236,164,0.05)]"
                            : wouldConflict && !isChecked
                            ? "border-[rgba(239,68,68,0.2)] opacity-50 cursor-not-allowed"
                            : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={wouldConflict && !isChecked}
                          onChange={() => toggleRole(r)}
                          className="accent-[#13eca4] shrink-0"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: rc }}
                          />
                          <div className="min-w-0">
                            <p className="text-white text-xs font-semibold truncate">
                              {roleBadge[r]}
                            </p>
                            <p className="text-slate-500 text-[10px] truncate">/{r.replace("_", "-")}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Conflict warning */}
                {(() => {
                  const conflict = getRoleConflict(rolesUser.primaryRole, rolesChecked);
                  return conflict ? (
                    <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
                      <span className="material-symbols-outlined text-red-400 text-[16px]">warning</span>
                      <p className="text-red-400 text-xs">{conflict}</p>
                    </div>
                  ) : null;
                })()}

                {/* Current selection summary */}
                {rolesChecked.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {rolesChecked.map((r) => {
                      const rc = roleColors[r] ?? "#64748b";
                      return (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                          style={{ color: rc, background: `${rc}18` }}
                        >
                          {roleBadge[r] ?? r}
                          <button
                            onClick={() => toggleRole(r)}
                            className="hover:opacity-70 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[11px]">close</span>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {rolesError && (
                  <div className="mt-3 bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] rounded-lg px-4 py-2.5">
                    <p className="text-[#ff4d4d] text-sm">{rolesError}</p>
                  </div>
                )}
              </div>
            )}

            <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <button
                onClick={() => { setRolesChecked([]); setRolesError(""); }}
                className="text-slate-400 text-xs font-medium hover:text-white transition-colors"
                disabled={rolesLoading}
              >
                Clear All
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setRolesUser(null)}
                className="border border-[rgba(255,255,255,0.1)] text-slate-300 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRoles}
                disabled={rolesSaving || rolesLoading || !!getRoleConflict(rolesUser.primaryRole, rolesChecked)}
                className="bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {rolesSaving && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">
                    progress_activity
                  </span>
                )}
                {rolesSaving ? "Saving…" : "Save Roles"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setPermUser(null)}
        >
          <div
            className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.12)] w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Manage Permissions</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {permUser.name} — {roleBadge[permUser.role] || permUser.role}
                  {permCustomized && (
                    <span className="ml-2 text-amber-400 text-[10px] font-bold uppercase">
                      Customized
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setPermUser(null)}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {permLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-3xl text-[#13eca4]">
                  progress_activity
                </span>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  {ALL_PERMISSIONS.map((p) => {
                    const isDefault = (ROLE_DEFAULT_PERMISSIONS[permUser.role] || []).includes(p);
                    const isChecked = permChecked.includes(p);
                    const callerHas = ctxHasPermission(p);
                    return (
                      <label
                        key={p}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                          isChecked
                            ? "border-[rgba(19,236,164,0.2)] bg-[rgba(19,236,164,0.04)]"
                            : "border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
                        } ${!callerHas ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!callerHas}
                          onChange={() => togglePermission(p)}
                          className="mt-0.5 accent-[#13eca4]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-semibold">
                              {PERMISSION_LABELS[p]}
                            </span>
                            {isDefault && !permCustomized && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                default
                              </span>
                            )}
                            {permCustomized && isChecked !== isDefault && (
                              <span className="text-[10px] text-amber-400 font-bold">
                                {isChecked ? "added" : "removed"}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {PERMISSION_DESCRIPTIONS[p]}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* School Scope */}
                {(permUser.role === "admin" || permUser.role === "school_admin") && (
                  <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                    <label className="text-slate-400 text-xs font-medium block mb-2">
                      School Scope
                      <span className="text-slate-600 ml-1">
                        (leave empty for unrestricted access)
                      </span>
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {schools.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permSchoolIds.includes(s.id)}
                            onChange={() =>
                              setPermSchoolIds((prev) =>
                                prev.includes(s.id)
                                  ? prev.filter((id) => id !== s.id)
                                  : [...prev, s.id]
                              )
                            }
                            className="accent-[#13eca4]"
                          />
                          <span className="text-white text-sm">{s.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <button
                onClick={resetToDefaults}
                className="text-slate-400 text-xs font-medium hover:text-white transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setPermUser(null)}
                className="border border-[rgba(255,255,255,0.1)] text-slate-300 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePermissions}
                disabled={permSaving}
                className="bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {permSaving ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="bg-[#1a2e27] rounded-2xl border border-[rgba(255,255,255,0.1)] w-full max-w-sm shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  confirmAction.type === "delete"
                    ? "bg-[rgba(255,77,77,0.1)]"
                    : "bg-[rgba(245,158,11,0.1)]"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    confirmAction.type === "delete" ? "text-[#ff4d4d]" : "text-amber-500"
                  }`}
                >
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
                {actionLoading
                  ? "Processing..."
                  : confirmAction.type === "delete"
                    ? "Delete"
                    : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Export Modal */}
      {showExport && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowExport(false)}
        >
          <div
            className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.12)] w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Export Data</h2>
                <p className="text-slate-400 text-xs mt-0.5">Downloads a CSV file to your device.</p>
              </div>
              <button
                onClick={() => setShowExport(false)}
                className="p-1.5 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Dataset */}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-2">Dataset</label>
                <div className="flex gap-2">
                  {(["users", "invites", "both"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setExportDataset(d)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
                        exportDataset === d
                          ? "border-[#13eca4] bg-[rgba(19,236,164,0.08)] text-[#13eca4]"
                          : "border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white"
                      }`}
                    >
                      {d === "both" ? "Both" : d === "users" ? "Active Users" : "Invites"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns — Users */}
              {(exportDataset === "users" || exportDataset === "both") && (
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">
                    User Columns
                    <button
                      onClick={() =>
                        setExportUserCols(
                          exportUserCols.length === USER_EXPORT_COLS.length
                            ? []
                            : USER_EXPORT_COLS.map((c) => c.key)
                        )
                      }
                      className="ml-2 text-[#13eca4] hover:opacity-70 transition-opacity"
                    >
                      {exportUserCols.length === USER_EXPORT_COLS.length ? "Deselect all" : "Select all"}
                    </button>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {USER_EXPORT_COLS.map((col) => (
                      <label
                        key={col.key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          exportUserCols.includes(col.key)
                            ? "border-[rgba(19,236,164,0.2)] bg-[rgba(19,236,164,0.04)]"
                            : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={exportUserCols.includes(col.key)}
                          onChange={() =>
                            setExportUserCols((prev) =>
                              prev.includes(col.key) ? prev.filter((k) => k !== col.key) : [...prev, col.key]
                            )
                          }
                          className="accent-[#13eca4]"
                        />
                        <span className="text-white text-xs">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Columns — Invites */}
              {(exportDataset === "invites" || exportDataset === "both") && (
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-2">
                    Invite Columns
                    <button
                      onClick={() =>
                        setExportInviteCols(
                          exportInviteCols.length === INVITE_EXPORT_COLS.length
                            ? []
                            : INVITE_EXPORT_COLS.map((c) => c.key)
                        )
                      }
                      className="ml-2 text-[#13eca4] hover:opacity-70 transition-opacity"
                    >
                      {exportInviteCols.length === INVITE_EXPORT_COLS.length ? "Deselect all" : "Select all"}
                    </button>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {INVITE_EXPORT_COLS.map((col) => (
                      <label
                        key={col.key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          exportInviteCols.includes(col.key)
                            ? "border-[rgba(19,236,164,0.2)] bg-[rgba(19,236,164,0.04)]"
                            : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={exportInviteCols.includes(col.key)}
                          onChange={() =>
                            setExportInviteCols((prev) =>
                              prev.includes(col.key) ? prev.filter((k) => k !== col.key) : [...prev, col.key]
                            )
                          }
                          className="accent-[#13eca4]"
                        />
                        <span className="text-white text-xs">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Role filter */}
              {(exportDataset === "users" || exportDataset === "both") && (
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Filter by Role</label>
                  <select
                    value={exportRoleFilter}
                    onChange={(e) => setExportRoleFilter(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                  >
                    <option value="all">All roles</option>
                    {Object.entries(roleBadge).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preview */}
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#13eca4] text-[20px]">table_chart</span>
                <div className="text-xs text-slate-400">
                  {exportDataset === "users" && (
                    <>Exporting <span className="text-white font-bold">{exportRoleFilter === "all" ? allUsers.length : allUsers.filter((u) => u.role === exportRoleFilter).length}</span> users · <span className="text-white font-bold">{exportUserCols.length}</span> columns → <span className="text-[#13eca4] font-mono">users.csv</span></>
                  )}
                  {exportDataset === "invites" && (
                    <>Exporting <span className="text-white font-bold">{invites.length > 0 ? invites.length : "all"}</span> invites · <span className="text-white font-bold">{exportInviteCols.length}</span> columns → <span className="text-[#13eca4] font-mono">invites.csv</span></>
                  )}
                  {exportDataset === "both" && (
                    <>Two files: <span className="text-[#13eca4] font-mono">users.csv</span> + <span className="text-[#13eca4] font-mono">invites.csv</span></>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <button
                onClick={() => setShowExport(false)}
                className="border border-[rgba(255,255,255,0.1)] text-slate-300 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={(exportDataset !== "invites" && exportUserCols.length === 0) || (exportDataset !== "users" && exportInviteCols.length === 0 && exportDataset === "invites")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
