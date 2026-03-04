"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import type { School } from "@/lib/types";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active:    { color: "#10b981", label: "Active" },
  pending:   { color: "#f59e0b", label: "Pending" },
  review:    { color: "#3b82f6", label: "Under Review" },
  suspended: { color: "#ef4444", label: "Suspended" },
  rejected:  { color: "#ef4444", label: "Rejected" },
};

function formatDate(d: unknown): string {
  if (!d) return "—";
  if (d instanceof Date) return d.toLocaleDateString();
  const seconds = (d as { seconds?: number })?.seconds;
  if (seconds) return new Date(seconds * 1000).toLocaleDateString();
  return "—";
}

export default function ObserverReportsPage() {
  const { appUser } = useAuthContext();
  const schoolIds: string[] = appUser?.schoolIds ?? [];

  const { data: allSchools, loading } = useCollection<School>("schools", [], true);
  const schools = allSchools.filter((s) => schoolIds.includes(s.id));

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
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(6,182,212,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Reports</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">
            Summary data for your assigned schools
          </p>
        </div>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Access restriction note */}
        <div className="flex items-start gap-3 p-4 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-xl">
          <span className="material-symbols-outlined text-[#06b6d4] text-[20px] shrink-0 mt-0.5">
            lock
          </span>
          <p className="text-(--text-muted) text-sm leading-relaxed">
            Detailed student data is restricted. Contact the platform admin for full reports.
            You can view high-level school information below.
          </p>
        </div>

        {schoolIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">
              domain_disabled
            </span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">No schools assigned</p>
            <p className="text-(--text-muted) text-sm max-w-sm">
              Contact a platform administrator to assign schools to your observer account.
            </p>
          </div>
        ) : (
          <>
            {/* Per-school summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {schools.map((school) => {
                const status =
                  STATUS_CONFIG[school.status] ?? { color: "#64748b", label: school.status };
                return (
                  <div
                    key={school.id}
                    className="bg-(--bg-card) rounded-2xl border border-[rgba(6,182,212,0.08)] p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(6,182,212,0.1)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-[#06b6d4]">
                          domain
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-(--text-base) font-bold text-sm truncate">{school.name}</h3>
                        <p className="text-slate-500 text-xs">{school.location}</p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${status.color}18`, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-[rgba(6,182,212,0.06)] pt-3">
                      <div>
                        <span className="text-slate-500 block">Students</span>
                        <p className="text-(--text-base) font-semibold">{school.studentCount ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Health Score</span>
                        <p className="text-(--text-base) font-semibold">{school.healthScore ?? 0}%</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Plan</span>
                        <p className="text-(--text-base) font-semibold capitalize">{school.plan ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Type</span>
                        <p className="text-(--text-base) font-semibold">{school.type ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary table */}
            <div className="bg-(--bg-card) rounded-2xl border border-[rgba(6,182,212,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(6,182,212,0.08)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#06b6d4] text-[20px]">
                  table_chart
                </span>
                <h2 className="text-(--text-base) font-bold">School Summary Table</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--border-subtle)">
                      <th className="text-left px-6 py-3 text-(--text-muted) text-xs font-semibold">
                        School
                      </th>
                      <th className="text-left px-6 py-3 text-(--text-muted) text-xs font-semibold">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-(--text-muted) text-xs font-semibold">
                        Observable Since
                      </th>
                      <th className="text-right px-6 py-3 text-(--text-muted) text-xs font-semibold">
                        Students
                      </th>
                      <th className="text-right px-6 py-3 text-(--text-muted) text-xs font-semibold">
                        Health
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                    {schools.map((school) => {
                      const status =
                        STATUS_CONFIG[school.status] ?? { color: "#64748b", label: school.status };
                      return (
                        <tr
                          key={school.id}
                          className="hover:bg-[rgba(6,182,212,0.02)] transition-colors"
                        >
                          <td className="px-6 py-3">
                            <p className="text-(--text-base) font-medium text-sm">{school.name}</p>
                            <p className="text-slate-500 text-xs">{school.location}</p>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{
                                background: `${status.color}18`,
                                color: status.color,
                              }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-(--text-muted) text-xs">
                            {formatDate(school.createdAt)}
                          </td>
                          <td className="px-6 py-3 text-right text-(--text-base) font-medium text-sm">
                            {school.studentCount ?? "—"}
                          </td>
                          <td className="px-6 py-3 text-right text-(--text-base) font-medium text-sm">
                            {school.healthScore ?? 0}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {schools.length === 0 && (
                  <div className="py-10 text-center">
                    <span className="material-symbols-outlined text-[40px] text-slate-600 mb-2 block">
                      domain_disabled
                    </span>
                    <p className="text-(--text-muted) text-sm">No assigned schools found.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
