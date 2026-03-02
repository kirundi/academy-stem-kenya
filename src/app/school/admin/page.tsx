"use client";

import { useState } from "react";
import { useSchoolAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatTimestamp } from "@/lib/timestamps";

export default function SchoolAdminDashboard() {
  const [dismissed, setDismissed] = useState(false);
  const { appUser } = useAuthContext();
  const { teachers, students, classrooms, activities, loading } = useSchoolAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  const stats = [
    {
      icon: "person",
      iconBg: "bg-blue-500/10 text-blue-400",
      label: "Total Teachers",
      value: teachers.length.toLocaleString(),
      badge: `${teachers.length} active`,
      badgeColor: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: "school",
      iconBg: "bg-purple-500/10 text-purple-400",
      label: "Total Students",
      value: students.length.toLocaleString(),
      badge: `${students.length} enrolled`,
      badgeColor: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: "co_present",
      iconBg: "bg-amber-500/10 text-amber-400",
      label: "Active Classrooms",
      value: classrooms.length.toLocaleString(),
      badge: "Current",
      badgeColor: "text-slate-400 bg-[rgba(255,255,255,0.06)]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              placeholder="Search teachers, classrooms, or logs..."
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:bg-[rgba(255,255,255,0.06)] rounded-lg">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#10221c]" />
          </button>
          <button className="p-2 text-slate-400 hover:bg-[rgba(255,255,255,0.06)] rounded-lg">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Invite Teacher
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">School at a Glance</h2>
            <p className="text-slate-400 mt-1">
              Welcome back, {appUser?.displayName ?? "Administrator"}. Here&apos;s what&apos;s
              happening today.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#1a2e27] border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`material-symbols-outlined p-2 rounded-lg ${s.iconBg}`}>
                  {s.icon}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.badgeColor}`}>
                  {s.badge}
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              <p className="text-white text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-xl">Recent Teacher Activity</h3>
              <a href="/dashboard/audit" className="text-sm text-[#13eca4] hover:underline">
                View all logs
              </a>
            </div>
            <div className="bg-[#1a2e27] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No recent activity</div>
                ) : (
                  activities.slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      className="p-4 flex gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.1)] flex items-center justify-center text-[#13eca4] font-bold text-sm shrink-0">
                        <span className="material-symbols-outlined text-[18px]">activity_zone</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-300">
                          <span className="text-[#13eca4]">{a.description}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {a.type} · {formatTimestamp(a.timestamp, "Recently")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Widgets */}
          <div className="space-y-6">
            {/* Maintenance */}
            {!dismissed && (
              <div className="bg-[rgba(19,236,164,0.05)] border border-[rgba(19,236,164,0.15)] p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-white font-bold text-lg mb-2">Upcoming Maintenance</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Server optimization scheduled for Saturday at 02:00 AM. Access might be limited.
                  </p>
                  <button
                    onClick={() => setDismissed(true)}
                    className="text-xs font-bold uppercase tracking-wider text-[#13eca4] border border-[rgba(19,236,164,0.3)] px-3 py-1.5 rounded-lg hover:bg-[rgba(19,236,164,0.08)] transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[#13eca4]/10 text-8xl rotate-12">
                  build_circle
                </span>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-[#1a2e27] border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl">
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "description", label: "Reports" },
                  { icon: "calendar_month", label: "Schedule" },
                  { icon: "mail", label: "Messages" },
                  { icon: "security", label: "Permissions" },
                ].map((q) => (
                  <button
                    key={q.label}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-[rgba(255,255,255,0.04)] hover:ring-2 hover:ring-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.05)] transition-all gap-2"
                  >
                    <span className="material-symbols-outlined text-[#13eca4] text-[22px]">
                      {q.icon}
                    </span>
                    <span className="text-xs font-medium text-slate-300">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
