"use client";

import ReviewerSidebar from "@/components/ReviewerSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import type { Activity } from "@/lib/types";

function formatDate(ts: unknown): string {
  if (!ts) return "—";
  const sec = (ts as { seconds?: number })?.seconds;
  const date = sec ? new Date(sec * 1000) : ts instanceof Date ? ts : null;
  if (!date) return "—";
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewerHistoryPage() {
  const { appUser } = useAuthContext();

  const { data: activities, loading } = useCollection<Activity>(
    "activities",
    appUser?.uid
      ? [
          where("userId", "==", appUser.uid),
          where("type", "in", ["course_approved", "course_rejected"]),
          orderBy("timestamp", "desc"),
        ]
      : [],
    !!appUser?.uid
  );

  const approved = activities.filter((a) => a.type === "course_approved");
  const rejected = activities.filter((a) => a.type === "course_rejected");

  if (loading) {
    return (
      <div className="flex h-screen bg-(--bg-page)">
        <ReviewerSidebar />
        <main className="ml-60 flex-1 overflow-y-auto flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#f59e0b]">
            progress_activity
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <ReviewerSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(245,158,11,0.1)] px-8 h-16 flex items-center">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Review History</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Your past approval and rejection decisions
            </p>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Reviews",
                value: activities.length,
                color: "#f59e0b",
                icon: "rate_review",
              },
              {
                label: "Approved",
                value: approved.length,
                color: "#10b981",
                icon: "check_circle",
              },
              {
                label: "Rejected",
                value: rejected.length,
                color: "#ef4444",
                icon: "cancel",
              },
            ].map(({ label, value, color, icon }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-5 bg-(--bg-card) rounded-2xl border border-(--border-subtle)"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ color }}
                  >
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="text-(--text-base) font-bold text-2xl leading-none">{value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
            <div className="px-6 py-4 border-b border-(--border-subtle) flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">history</span>
              <h2 className="text-(--text-base) font-bold">Decision History</h2>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-[56px] text-slate-600 mb-3">
                  history
                </span>
                <p className="text-(--text-base) font-semibold mb-1">No review history yet</p>
                <p className="text-slate-400 text-sm">
                  Your approved and rejected course decisions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--border-subtle)">
                      <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                        Course
                      </th>
                      <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                        Decision
                      </th>
                      <th className="text-left px-6 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                    {activities.map((a) => {
                      const isApproved = a.type === "course_approved";
                      const decisionColor = isApproved ? "#10b981" : "#ef4444";
                      const decisionLabel = isApproved ? "Approved" : "Rejected";
                      const decisionIcon = isApproved ? "check_circle" : "cancel";

                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-[rgba(245,158,11,0.03)] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-(--text-base) font-medium text-sm line-clamp-2">
                              {a.description}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{
                                background: `${decisionColor}18`,
                                color: decisionColor,
                              }}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {decisionIcon}
                              </span>
                              {decisionLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {formatDate(
                              (a as unknown as Record<string, unknown>).timestamp
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
