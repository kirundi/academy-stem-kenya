"use client";

import { useState } from "react";
import { useGlobalAdminData } from "@/hooks/useAdminData";
import { useUpdateDoc } from "@/hooks/useFirestore";

const planColors: Record<string, string> = {
  premium: "#13eca4",
  standard: "#3b82f6",
  community: "#8b5cf6",
};

const healthColor = (h: number) => {
  if (h >= 80) return "#13eca4";
  if (h >= 60) return "#f59e0b";
  return "#ff4d4d";
};

export default function SchoolsManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ schoolId: string; schoolName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { schools, loading } = useGlobalAdminData();
  const { update } = useUpdateDoc("schools");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  const filtered = schools.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.location?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const needsAttention = schools.filter((s) => (s.healthScore ?? 0) < 60);

  async function handleApprove(schoolId: string) {
    setActionLoading(schoolId + "_approve");
    try {
      await update(schoolId, { status: "active" });
      await fetch("/api/admin/notify-school-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, decision: "approved" }),
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal.schoolId + "_reject");
    try {
      await fetch("/api/admin/notify-school-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: rejectModal.schoolId,
          decision: "rejected",
          reason: rejectReason.trim(),
        }),
      });
      setRejectModal(null);
      setRejectReason("");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Schools Management</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {schools.length} partner schools on the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-[rgba(255,255,255,0.12)] text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:border-[#13eca4] hover:text-[#13eca4] transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Onboard School
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Schools", value: schools.length, icon: "domain", iconColor: "#13eca4" },
            {
              label: "Active",
              value: schools.filter((s) => s.status === "active").length,
              icon: "check_circle",
              iconColor: "#13eca4",
            },
            {
              label: "In Review",
              value: schools.filter((s) => s.status === "review").length,
              icon: "pending",
              iconColor: "#f59e0b",
            },
            {
              label: "Needs Attention",
              value: needsAttention.length,
              icon: "warning",
              iconColor: "#ff4d4d",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1a2e27] p-5 rounded-2xl border border-[rgba(19,236,164,0.07)]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium">{s.label}</span>
                <span
                  className="material-symbols-outlined p-2 rounded-lg bg-[rgba(19,236,164,0.08)] text-[20px]"
                  style={{ color: s.iconColor }}
                >
                  {s.icon}
                </span>
              </div>
              <span className="text-white text-3xl font-bold">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schools..."
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "review", "pending", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-[#13eca4] text-[#10221c]"
                    : "bg-[rgba(255,255,255,0.06)] text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-[rgba(255,255,255,0.05)]">
                <th className="px-6 py-3 text-left font-medium">School</th>
                <th className="px-4 py-3 text-center font-medium">Type</th>
                <th className="px-4 py-3 text-center font-medium">Plan</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Health</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No schools match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const plan =
                    (s.plan ?? "community").charAt(0).toUpperCase() +
                    (s.plan ?? "community").slice(1);
                  const hc = healthColor(s.healthScore ?? 0);
                  const isApproving = actionLoading === s.id + "_approve";
                  const isRejecting = actionLoading === s.id + "_reject";
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(19,236,164,0.02)] transition-colors ${i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.01)]"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[rgba(19,236,164,0.08)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px] text-[#13eca4]">
                              domain
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{s.name}</p>
                            <p className="text-slate-500 text-xs">{s.location ?? "Kenya"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-300 text-xs capitalize">
                        {s.type ?? "--"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            color: planColors[s.plan] ?? "#8b5cf6",
                            background: `${planColors[s.plan] ?? "#8b5cf6"}18`,
                          }}
                        >
                          {plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`text-xs font-bold capitalize ${
                            s.status === "active"
                              ? "text-emerald-500"
                              : s.status === "review"
                              ? "text-amber-500"
                              : s.status === "rejected"
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full max-w-15">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ background: hc, width: `${s.healthScore ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold" style={{ color: hc }}>
                            {s.healthScore ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {s.status === "review" && (
                          <>
                            <button
                              disabled={isApproving || isRejecting}
                              onClick={() => handleApprove(s.id)}
                              className="text-[#13eca4] hover:opacity-80 transition-colors text-xs font-semibold mr-3 disabled:opacity-40"
                            >
                              {isApproving ? "Approving…" : "Approve"}
                            </button>
                            <button
                              disabled={isApproving || isRejecting}
                              onClick={() => {
                                setRejectModal({ schoolId: s.id, schoolName: s.name });
                                setRejectReason("");
                              }}
                              className="text-red-400 hover:opacity-80 transition-colors text-xs font-semibold mr-3 disabled:opacity-40"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="text-slate-400 hover:text-[#13eca4] transition-colors text-xs font-semibold mr-3">
                          Audit
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.05)]">
            <p className="text-slate-500 text-xs">
              Showing {filtered.length} of {schools.length} schools
            </p>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,77,77,0.12)] flex items-center justify-center">
                <span className="material-symbols-outlined text-red-400 text-[22px]">
                  cancel
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Reject Application</h2>
                <p className="text-slate-400 text-xs">{rejectModal.schoolName}</p>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Please provide a reason for rejection. This will be shared with the school admin.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={300}
              rows={4}
              placeholder="e.g. Incomplete documentation provided. Please resubmit with your school registration certificate."
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(255,77,77,0.5)] resize-none mb-1"
            />
            <p className="text-slate-600 text-xs text-right mb-5">
              {rejectReason.length}/300
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[rgba(255,255,255,0.06)] text-slate-300 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || actionLoading === rejectModal.schoolId + "_reject"}
                onClick={handleRejectSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading === rejectModal.schoolId + "_reject" ? "Rejecting…" : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
