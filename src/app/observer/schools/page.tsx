"use client";

import Link from "next/link";
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

export default function ObserverSchoolsPage() {
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
          <h1 className="text-xl font-bold text-(--text-base)">My Schools</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Schools assigned to your observer account
          </p>
        </div>
      </header>

      <div className="px-8 py-8">
        {schoolIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">
              domain_disabled
            </span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">No schools assigned</p>
            <p className="text-slate-400 text-sm max-w-sm">
              Contact a platform administrator to assign schools to your observer account.
            </p>
          </div>
        ) : schools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">
              hourglass_empty
            </span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">Loading schools…</p>
            <p className="text-slate-400 text-sm max-w-sm">
              Your assigned schools are being fetched. If this persists, contact support.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {schools.map((school) => {
              const status =
                STATUS_CONFIG[school.status] ?? { color: "#64748b", label: school.status };
              return (
                <div
                  key={school.id}
                  className="bg-(--bg-card) rounded-2xl border border-[rgba(6,182,212,0.08)] hover:border-[rgba(6,182,212,0.22)] transition-all p-5 flex flex-col gap-4"
                >
                  {/* School header */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(6,182,212,0.1)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px] text-[#06b6d4]">
                        domain
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-(--text-base) font-bold text-sm truncate">{school.name}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{school.location}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${status.color}18`, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-[rgba(6,182,212,0.06)] pt-3">
                    <div>
                      <span className="text-slate-500 block">Students</span>
                      <p className="text-(--text-base) font-semibold">{school.studentCount ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Type</span>
                      <p className="text-(--text-base) font-semibold">{school.type ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Plan</span>
                      <p className="text-(--text-base) font-semibold capitalize">{school.plan ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Health</span>
                      <p className="text-(--text-base) font-semibold">{school.healthScore ?? 0}%</p>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    href="/observer/dashboard"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-[rgba(6,182,212,0.1)] text-[#06b6d4] hover:bg-[rgba(6,182,212,0.2)] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Overview
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
