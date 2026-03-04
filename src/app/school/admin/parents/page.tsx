"use client";

import { useState, useMemo } from "react";
import { useCollection } from "@/hooks/useFirestore";
import { useSchoolAdminData } from "@/hooks/useAdminData";
import { where } from "firebase/firestore";
import type { AppUser } from "@/lib/types";
import SchoolAdminSidebar from "@/components/SchoolAdminSidebar";

function formatDate(d: unknown) {
  if (!d) return "—";
  const date =
    (d as { toDate?: () => Date })?.toDate?.() ??
    (d instanceof Date ? d : null) ??
    ((d as { seconds?: number })?.seconds
      ? new Date((d as { seconds: number }).seconds * 1000)
      : null);
  if (!date) return "—";
  return date.toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
}

export default function SchoolAdminParentsPage() {
  // First get students for this school, then find parents linked to them
  const { students, loading: studentsLoading } = useSchoolAdminData();

  const schoolStudentIds = useMemo(() => new Set(students.map((s) => s.id ?? s.uid)), [students]);

  const { data: allParents, loading: parentsLoading } = useCollection<AppUser>(
    "users",
    [where("role", "==", "parent")],
    true
  );

  // Filter parents to only those whose childIds overlap with this school's students
  const parents = useMemo(
    () => allParents.filter((p) => p.childIds?.some((cid) => schoolStudentIds.has(cid))),
    [allParents, schoolStudentIds]
  );

  const loading = studentsLoading || parentsLoading;

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = parents.filter(
    (p) =>
      !searchQuery ||
      (p.displayName?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
      (p.email?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <SchoolAdminSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Parents</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">
              Parents linked to students in your school.
            </p>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
                progress_activity
              </span>
            </div>
          ) : (
            <>
              {/* Stat card */}
              <div className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] max-w-xs">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-primary-green/12">
                  <span className="material-symbols-outlined text-[22px] text-primary-green">
                    family_restroom
                  </span>
                </div>
                <div>
                  <p className="text-(--text-base) font-bold text-2xl leading-none">{parents.length}</p>
                  <p className="text-(--text-muted) text-xs mt-0.5">Total Parents</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl pl-9 pr-4 py-2.5 text-(--text-base) text-sm placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
                />
              </div>

              {/* Table */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)]">
                  <span className="material-symbols-outlined text-[56px] text-slate-600 mb-3">
                    family_restroom
                  </span>
                  <p className="text-(--text-base) font-semibold mb-1">No parents found</p>
                  <p className="text-(--text-muted) text-sm">
                    {searchQuery
                      ? "Try adjusting your search."
                      : "No parent accounts have been registered yet."}
                  </p>
                </div>
              ) : (
                <div className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(19,236,164,0.08)]">
                        <th className="text-left px-5 py-3.5 text-(--text-muted) font-semibold text-xs uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left px-5 py-3.5 text-(--text-muted) font-semibold text-xs uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left px-5 py-3.5 text-(--text-muted) font-semibold text-xs uppercase tracking-wider">
                          Children
                        </th>
                        <th className="text-left px-5 py-3.5 text-(--text-muted) font-semibold text-xs uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(19,236,164,0.05)]">
                      {filtered.map((parent) => {
                        const initials = parent.displayName
                          ? parent.displayName
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "?";
                        return (
                          <tr
                            key={parent.uid}
                            className="hover:bg-[rgba(19,236,164,0.03)] transition-colors"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-green/12 flex items-center justify-center text-primary-green text-xs font-bold shrink-0">
                                  {initials}
                                </div>
                                <span className="text-(--text-base) font-medium">
                                  {parent.displayName || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-(--text-muted)">{parent.email || "—"}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(19,236,164,0.10)] text-primary-green">
                                <span className="material-symbols-outlined text-[12px]">
                                  person
                                </span>
                                {parent.childIds?.length ?? 0}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-(--text-muted) text-xs">
                              {formatDate(parent.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
