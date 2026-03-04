"use client";

import StudentSidebar from "@/components/StudentSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import type { Challenge } from "@/lib/types";

function getTimestamp(val: unknown): number | null {
  if (!val) return null;
  if (val instanceof Date) return val.getTime();
  if (typeof (val as { seconds?: number }).seconds === "number")
    return (val as { seconds: number }).seconds * 1000;
  return null;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24));
}

function timeRemaining(endsAt: number): string {
  const ms = endsAt - Date.now();
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m left`;
}

const SCOPE_COLOR: Record<string, string> = {
  global: "#a855f7",
  school: "#f59e0b",
};

export default function StudentCalendarPage() {
  const { appUser } = useAuthContext();

  const { data: challenges, loading } = useCollection<Challenge>(
    "challenges",
    [],
    true
  );

  const now = Date.now();

  // Filter to show global challenges or challenges for this student's school
  const visible = challenges.filter((c) => {
    return c.scope === "global" || c.schoolId === appUser?.schoolId;
  });

  const upcoming = visible
    .filter((c) => {
      const start = getTimestamp(c.startsAt);
      return start !== null && start > now;
    })
    .sort((a, b) => {
      const aStart = getTimestamp(a.startsAt) ?? 0;
      const bStart = getTimestamp(b.startsAt) ?? 0;
      return aStart - bStart;
    });

  const activeNow = visible.filter((c) => {
    const start = getTimestamp(c.startsAt);
    const end = getTimestamp(c.endsAt);
    return start !== null && end !== null && start <= now && end >= now;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-(--bg-page)">
        <StudentSidebar />
        <main className="ml-60 flex-1 overflow-y-auto flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
            progress_activity
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <StudentSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.1)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Calendar</h1>
            <p className="text-slate-400 text-xs mt-0.5">Upcoming challenges and deadlines</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(19,236,164,0.12)] border border-[rgba(19,236,164,0.2)]">
            <span className="material-symbols-outlined text-[#13eca4] text-[16px]">
              calendar_month
            </span>
            <span className="text-[#13eca4] text-xs font-semibold">
              {upcoming.length + activeNow.length} events
            </span>
          </div>
        </header>

        <div className="px-8 py-8 space-y-8">
          {/* Active Now */}
          {activeNow.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <h2 className="text-(--text-base) font-bold text-lg">Active Now</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-(--border-medium)">
                  {activeNow.length} live
                </span>
              </div>
              <div className="space-y-3">
                {activeNow.map((c) => {
                  const start = getTimestamp(c.startsAt);
                  const end = getTimestamp(c.endsAt);
                  const scopeColor = SCOPE_COLOR[c.scope] ?? "#64748b";

                  return (
                    <div
                      key={c.id}
                      className="bg-(--bg-card) rounded-2xl border border-[rgba(16,185,129,0.2)] p-5 flex items-center gap-4 hover:border-[rgba(16,185,129,0.35)] transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center shrink-0 text-2xl">
                        {c.icon ?? "🏆"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-(--text-base) font-bold text-sm">{c.title}</h3>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: `${scopeColor}18`, color: scopeColor }}
                          >
                            {c.scope}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">{c.theme}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {start ? formatDate(start) : "—"} → {end ? formatDate(end) : "—"}
                        </p>
                      </div>

                      {/* Time remaining badge */}
                      <div
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
                      >
                        {end ? timeRemaining(end) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#13eca4] text-[20px]">
                  event_upcoming
                </span>
                <h2 className="text-(--text-base) font-bold text-lg">Upcoming</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(19,236,164,0.12)] text-[#13eca4] border border-[rgba(19,236,164,0.2)]">
                  {upcoming.length}
                </span>
              </div>
              <div className="space-y-3">
                {upcoming.map((c) => {
                  const start = getTimestamp(c.startsAt);
                  const end = getTimestamp(c.endsAt);
                  const days = start ? daysUntil(start) : null;
                  const scopeColor = SCOPE_COLOR[c.scope] ?? "#64748b";

                  return (
                    <div
                      key={c.id}
                      className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] p-5 flex items-center gap-4 hover:border-[rgba(19,236,164,0.2)] transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-[rgba(19,236,164,0.08)] flex items-center justify-center shrink-0 text-2xl">
                        {c.icon ?? "🏆"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-(--text-base) font-bold text-sm">{c.title}</h3>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: `${scopeColor}18`, color: scopeColor }}
                          >
                            {c.scope}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">{c.theme}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {start ? formatDate(start) : "—"} → {end ? formatDate(end) : "—"}
                        </p>
                      </div>

                      {/* Days until countdown badge */}
                      <div
                        className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}
                      >
                        {days !== null ? (days === 0 ? "Today" : `in ${days}d`) : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {upcoming.length === 0 && activeNow.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)]">
              <span className="material-symbols-outlined text-[64px] text-slate-600 mb-3">
                calendar_month
              </span>
              <p className="text-(--text-base) font-semibold mb-1">No upcoming events</p>
              <p className="text-slate-400 text-sm">
                New challenges and events will appear here when available.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
