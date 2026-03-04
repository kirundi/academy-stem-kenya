"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSchoolAdminData } from "@/hooks/useAdminData";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatTimestamp } from "@/lib/timestamps";

export default function SchoolAdminDashboard() {
  const [dismissed, setDismissed] = useState(false);
  const { appUser } = useAuthContext();
  const { teachers, students, classrooms, activities, loading } = useSchoolAdminData();
  const router = useRouter();

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ displayName: "", email: "" });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ inviteLink: string; email: string } | null>(
    null
  );
  const [inviteError, setInviteError] = useState("");

  // Redirect to pending page if the school is not yet active.
  useEffect(() => {
    if (!appUser?.schoolId) return;
    getDoc(doc(db, "schools", appUser.schoolId)).then((snap) => {
      if (!snap.exists()) return;
      const status = snap.data()?.status;
      if (status !== "active") {
        router.replace("/school/admin/pending");
      }
    });
  }, [appUser?.schoolId, router]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteForm.displayName.trim() || !inviteForm.email.trim()) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email.trim(),
          displayName: inviteForm.displayName.trim(),
          role: "teacher",
          schoolId: appUser?.schoolId ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send invite");
      setInviteResult({ inviteLink: data.inviteLink, email: data.email });
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  }

  function closeInviteModal() {
    setShowInvite(false);
    setInviteForm({ displayName: "", email: "" });
    setInviteResult(null);
    setInviteError("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
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
      badgeColor: "text-(--text-muted) bg-(--input-bg)",
    },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted) text-[18px]">
              search
            </span>
            <input
              placeholder="Search teachers, classrooms, or logs..."
              className="w-full bg-[rgba(255,255,255,0.05)] border border-(--border-subtle) rounded-lg pl-10 pr-4 py-2 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-(--text-muted) hover:bg-(--input-bg) rounded-lg">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#10221c]" />
          </button>
          <button className="p-2 text-(--text-muted) hover:bg-(--input-bg) rounded-lg">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 bg-primary-green text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Invite Teacher
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-8">
        {/* Page Title */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-(--text-base) tracking-tight">School at a Glance</h2>
            <p className="text-(--text-muted) mt-1">
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
              className="bg-(--bg-card) border border-(--border-subtle) p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`material-symbols-outlined p-2 rounded-lg ${s.iconBg}`}>
                  {s.icon}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.badgeColor}`}>
                  {s.badge}
                </span>
              </div>
              <p className="text-(--text-muted) text-sm font-medium">{s.label}</p>
              <p className="text-(--text-base) text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-(--text-base) font-bold text-xl">Recent Teacher Activity</h3>
              <a href="/school/admin/analytics" className="text-sm text-primary-green hover:underline">
                View all activity
              </a>
            </div>
            <div className="bg-(--bg-card) border border-(--border-subtle) rounded-2xl overflow-hidden">
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No recent activity</div>
                ) : (
                  activities.slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      className="p-4 flex gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold text-sm shrink-0">
                        <span className="material-symbols-outlined text-[18px]">activity_zone</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-(--text-muted)">
                          <span className="text-primary-green">{a.description}</span>
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
                  <h4 className="text-(--text-base) font-bold text-lg mb-2">Upcoming Maintenance</h4>
                  <p className="text-(--text-muted) text-sm mb-4">
                    Server optimization scheduled for Saturday at 02:00 AM. Access might be limited.
                  </p>
                  <button
                    onClick={() => setDismissed(true)}
                    className="text-xs font-bold uppercase tracking-wider text-primary-green border border-[rgba(19,236,164,0.3)] px-3 py-1.5 rounded-lg hover:bg-primary-green/8 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-primary-green/10 text-8xl rotate-12">
                  build_circle
                </span>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-(--bg-card) border border-(--border-subtle) p-6 rounded-2xl">
              <h4 className="text-(--text-base) font-bold mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "description", label: "Reports" },
                  { icon: "calendar_month", label: "Schedule" },
                  { icon: "mail", label: "Messages" },
                  { icon: "security", label: "Permissions" },
                ].map((q) => (
                  <button
                    key={q.label}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-(--glass-bg) hover:ring-2 hover:ring-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.05)] transition-all gap-2"
                  >
                    <span className="material-symbols-outlined text-primary-green text-[22px]">
                      {q.icon}
                    </span>
                    <span className="text-xs font-medium text-(--text-muted)">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Teacher Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-(--bg-card) border border-(--border-subtle) rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {inviteResult ? (
              /* Success state */
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-green/10 border border-[rgba(19,236,164,0.2)] mb-4">
                  <span className="material-symbols-outlined text-primary-green text-3xl">
                    mark_email_read
                  </span>
                </div>
                <h2 className="text-(--text-base) font-bold text-lg mb-1">Invite Sent!</h2>
                <p className="text-(--text-muted) text-sm mb-5">
                  An invitation email has been sent to{" "}
                  <span className="text-(--text-base) font-semibold">{inviteResult.email}</span>. They can
                  also use the link below.
                </p>
                <div className="bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-4 py-3 mb-5">
                  <p className="text-xs text-slate-500 mb-1 text-left">Invite link (valid 48h)</p>
                  <p className="text-primary-green text-xs font-mono break-all text-left">
                    {inviteResult.inviteLink}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(inviteResult.inviteLink)}
                    className="mt-2 text-xs text-(--text-muted) hover:text-(--text-base) flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy link
                  </button>
                </div>
                <button
                  onClick={closeInviteModal}
                  className="w-full py-2.5 rounded-xl bg-(--input-bg) text-(--text-muted) font-semibold text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-(--text-base) font-bold text-base">Invite Teacher</h2>
                    <p className="text-(--text-muted) text-xs mt-0.5">
                      They&apos;ll receive a secure link to set their own password.
                    </p>
                  </div>
                  <button
                    onClick={closeInviteModal}
                    className="text-slate-500 hover:text-(--text-base) transition-colors"
                  >
                    <span className="material-symbols-outlined text-[22px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-(--text-muted) mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={inviteForm.displayName}
                      onChange={(e) =>
                        setInviteForm((p) => ({ ...p, displayName: e.target.value }))
                      }
                      placeholder="Jane Kamau"
                      required
                      className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-4 py-2.5 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-(--text-muted) mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="jane@school.ac.ke"
                      required
                      className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-4 py-2.5 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
                    />
                  </div>

                  {inviteError && (
                    <p className="text-red-400 text-xs bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] rounded-lg px-3 py-2">
                      {inviteError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeInviteModal}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-(--input-bg) text-(--text-muted) hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-green text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {inviteLoading ? "Sending…" : "Send Invite"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
