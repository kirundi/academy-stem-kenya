"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import { documentId, where } from "firebase/firestore";
import type { School } from "@/lib/types";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active:    { color: "#10b981", label: "Active" },
  pending:   { color: "#f59e0b", label: "Pending" },
  review:    { color: "#3b82f6", label: "Under Review" },
  suspended: { color: "#ef4444", label: "Suspended" },
  rejected:  { color: "#ef4444", label: "Rejected" },
};

const PLAN_CONFIG: Record<string, { color: string }> = {
  premium:   { color: "#f59e0b" },
  standard:  { color: "#3b82f6" },
  community: { color: "#10b981" },
};

function healthColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

export default function ObserverDashboard() {
  const { appUser } = useAuthContext();
  const schoolIds: string[] = appUser?.schoolIds ?? [];

  const { data: schools, loading } = useCollection<School>(
    "schools",
    schoolIds.length > 0 ? [where(documentId(), "in", schoolIds.slice(0, 10))] : [],
    schoolIds.length > 0
  );

  const displayName = appUser?.displayName ?? "Observer";

  const totalStudents = schools.reduce((s, sc) => s + (sc.studentCount ?? 0), 0);
  const activeSchools = schools.filter((sc) => sc.status === "active").length;
  const avgHealth =
    schools.length > 0
      ? Math.round(schools.reduce((s, sc) => s + (sc.healthScore ?? 0), 0) / schools.length)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#06b6d4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(6,182,212,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">School Overview</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Observer · Read-only</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[rgba(6,182,212,0.2)] flex items-center justify-center text-[#06b6d4] font-bold text-sm">
          {getInitials(displayName)}
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Hero */}
        <div className="relative bg-linear-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-8 mb-8 border border-[rgba(6,182,212,0.15)] overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-[rgba(6,182,212,0.08)] rounded-full" />
          <div className="relative z-10">
            <p className="text-[#06b6d4] font-semibold text-sm mb-2 uppercase tracking-widest">Observer Dashboard</p>
            <h2 className="text-2xl font-bold text-(--text-base) mb-1">Welcome, {displayName.split(" ")[0]}</h2>
            <p className="text-(--text-muted) text-sm mb-6 max-w-md">
              You have visibility into {schoolIds.length} assigned {schoolIds.length === 1 ? "school" : "schools"}.
              This is a read-only view — no data can be modified.
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: "domain", color: "#06b6d4", label: "Assigned Schools", value: String(schools.length) },
                { icon: "check_circle", color: "#10b981", label: "Active", value: String(activeSchools) },
                { icon: "groups", color: "#3b82f6", label: "Total Students", value: String(totalStudents) },
                { icon: "favorite", color: "#ec4899", label: "Avg Health Score", value: `${avgHealth}%` },
              ].map(({ icon, color, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
                  <div>
                    <p className="text-(--text-base) font-bold leading-none">{value}</p>
                    <p className="text-slate-500 text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schools grid */}
        {schools.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">domain_disabled</span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">No schools assigned</p>
            <p className="text-(--text-muted) text-sm max-w-sm">
              Contact a platform administrator to assign schools to your observer account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {schools.map((school) => {
              const status = STATUS_CONFIG[school.status] ?? { color: "#64748b", label: school.status };
              const plan = PLAN_CONFIG[school.plan] ?? { color: "#64748b" };
              const hColor = healthColor(school.healthScore ?? 0);

              return (
                <details key={school.id} className="bg-(--bg-card) rounded-2xl border border-[rgba(6,182,212,0.08)] hover:border-[rgba(6,182,212,0.2)] transition-all p-5 cursor-pointer group [&_summary]:list-none">
                  <summary className="[&::-webkit-details-marker]:hidden">
                  {/* School header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(6,182,212,0.1)] flex items-center justify-center shrink-0 mr-3">
                      <span className="material-symbols-outlined text-[24px] text-[#06b6d4]">domain</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-(--text-base) font-bold text-sm truncate">{school.name}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{school.location}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2"
                      style={{ background: `${status.color}18`, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Health score */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-(--text-muted)">Platform Health</span>
                      <span className="font-bold" style={{ color: hColor }}>{school.healthScore ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${school.healthScore ?? 0}%`, background: hColor }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-(--border-subtle) pt-4">
                    {[
                      { label: "Students", value: school.studentCount ?? 0, icon: "groups" },
                      { label: "Type", value: school.type ?? "—", icon: "category" },
                      {
                        label: "Plan",
                        value: school.plan,
                        icon: "workspace_premium",
                        color: plan.color,
                      },
                    ].map(({ label, value, icon, color }) => (
                      <div key={label} className="text-center">
                        <span
                          className="material-symbols-outlined text-[16px] text-slate-500 block mb-0.5"
                          style={color ? { color } : {}}
                        >
                          {icon}
                        </span>
                        <p className="text-(--text-base) font-bold text-sm leading-none">{value}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  </summary>
                  <div className="mt-4 pt-4 border-t border-[rgba(6,182,212,0.08)]">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Location</span>
                        <p className="text-(--text-base) font-medium">{school.location}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Admin</span>
                        <p className="text-(--text-base) font-medium font-mono text-[11px]">{school.adminId?.slice(0, 12)}...</p>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
