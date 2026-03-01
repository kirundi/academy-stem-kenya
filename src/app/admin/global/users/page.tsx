"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { useUpdateDoc, useDeleteDoc } from "@/hooks/useFirestore";

const roleColors: Record<string, string> = {
  student: "#3b82f6",
  teacher: "#13eca4",
  school_admin: "#f59e0b",
  global_admin: "#ff4d4d",
};

const roleBadge: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  school_admin: "School Admin",
  global_admin: "Global Admin",
};

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const { allUsers, schools, loading } = useGlobalAdminData();
  const { update } = useUpdateDoc("users");
  const { remove } = useDeleteDoc("users");

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

  // Role breakdown
  const roleCounts: Record<string, number> = {};
  allUsers.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  });

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
        </div>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            {["all", "student", "teacher", "school_admin", "global_admin"].map((r) => (
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
                  const ca = u.createdAt as unknown as { toDate?: () => Date } | Date | undefined;
                  const joined = ca && typeof (ca as { toDate?: () => Date }).toDate === "function"
                    ? (ca as { toDate: () => Date }).toDate().toLocaleDateString()
                    : ca
                    ? new Date(ca as unknown as string | number).toLocaleDateString()
                    : "--";
                  return (
                    <tr key={u.id} className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${color}15`, color }}>
                            {u.displayName?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
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
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === i ? null : i)}
                              className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                            {openMenu === i && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a2e27] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-20 overflow-hidden">
                                <button
                                  onClick={() => { update(u.id, { role: "teacher" }); setOpenMenu(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                >
                                  Set as Teacher
                                </button>
                                <button
                                  onClick={() => { update(u.id, { role: "school_admin" }); setOpenMenu(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                >
                                  Set as School Admin
                                </button>
                                <button
                                  onClick={() => { remove(u.id); setOpenMenu(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 font-bold hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                                >
                                  Delete User
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
          <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.05)]">
            <p className="text-slate-500 text-xs">Showing {filtered.length} of {allUsers.length} users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
