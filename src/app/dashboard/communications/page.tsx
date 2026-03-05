"use client";

import { useState, useEffect, useCallback } from "react";

const ALL_ROLES = [
  { value: "student",           label: "Student",          color: "#3b82f6" },
  { value: "teacher",           label: "Teacher",          color: "var(--primary-green)" },
  { value: "school_admin",      label: "School Admin",     color: "#f59e0b" },
  { value: "parent",            label: "Parent",           color: "#8b5cf6" },
  { value: "mentor",            label: "Mentor",           color: "#10b981" },
  { value: "editor",            label: "Editor",           color: "#ec4899" },
  { value: "content_reviewer",  label: "Reviewer",         color: "#f59e0b" },
  { value: "analytics_viewer",  label: "Analytics Viewer", color: "#a855f7" },
  { value: "support",           label: "Support",          color: "#3b82f6" },
  { value: "observer",          label: "Observer",         color: "#06b6d4" },
  { value: "admin",             label: "Admin",            color: "var(--accent-red)" },
  { value: "super_admin",       label: "Super Admin",      color: "#f59e0b" },
];

interface BroadcastLog {
  id: string;
  subject: string;
  message: string;
  sentByEmail: string;
  recipientCount: number;
  errorCount: number;
  audience: { roles?: string[]; status?: string };
  createdAt: string | null;
}

interface PreviewRecipient {
  uid: string;
  name: string;
  email: string;
  role: string;
}

type SendState = "idle" | "previewing" | "confirming" | "sending" | "done" | "error";

const roleColor: Record<string, string> = Object.fromEntries(
  ALL_ROLES.map((r) => [r.value, r.color])
);

export default function CommunicationsPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState(false);

  const [sendState, setSendState] = useState<SendState>("idle");
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewRecipients, setPreviewRecipients] = useState<PreviewRecipient[]>([]);
  const [resultMsg, setResultMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [logs, setLogs] = useState<BroadcastLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/broadcast");
      const data = await res.json();
      if (res.ok) setLogs(data.logs ?? []);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const isSending = sendState === "sending";
  const audiencePayload = allUsers ? {} : { roles: selectedRoles };
  const audienceReady = allUsers || selectedRoles.length > 0;
  const formReady = subject.trim() && message.trim() && audienceReady;

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handlePreview = async () => {
    if (!formReady) return;
    setSendState("previewing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, audience: audiencePayload, dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Failed to preview"); setSendState("idle"); return; }
      setPreviewCount(data.count);
      setPreviewRecipients(data.recipients ?? []);
      setSendState("confirming");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setSendState("idle");
    }
  };

  const handleSend = async () => {
    setSendState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, audience: audiencePayload, dryRun: false }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Send failed"); setSendState("confirming"); return; }
      setResultMsg(data.message ?? `Sent to ${data.sent} recipients.`);
      setSendState("done");
      setSubject(""); setMessage(""); setSelectedRoles([]); setAllUsers(false);
      setPreviewCount(null); setPreviewRecipients([]);
      fetchLogs();
    } catch {
      setErrorMsg("Network error. Please try again.");
      setSendState("confirming");
    }
  };

  const reset = () => {
    setSendState("idle");
    setPreviewCount(null);
    setPreviewRecipients([]);
    setErrorMsg("");
    setResultMsg("");
  };

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-(--text-base) tracking-tight">Communications</h1>
        <p className="text-(--text-muted) text-sm mt-1">
          Compose and send a branded email to a filtered group of platform users.
        </p>
      </div>

      {/* Success banner */}
      {sendState === "done" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-[rgba(45,212,191,0.08)] border border-[rgba(45,212,191,0.2)] px-5 py-4">
          <span className="material-symbols-outlined text-(--primary-green) text-xl mt-0.5">check_circle</span>
          <div className="flex-1">
            <p className="text-(--primary-green) font-semibold text-sm">{resultMsg}</p>
          </div>
          <button onClick={reset} className="text-(--text-faint) hover:text-(--text-muted) transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Compose card */}
      <div className="rounded-2xl bg-(--bg-card) border border-(--border-subtle) p-6 mb-8">
        <h2 className="text-base font-bold text-(--text-base) mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-(--primary-green)">edit_note</span>
          Compose Message
        </h2>

        {/* Subject */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-widest text-(--text-faint) block mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sendState !== "idle" && sendState !== "done"}
            placeholder="e.g. Welcome to STEM Impact Academy!"
            className="w-full rounded-lg bg-(--input-bg) border border-(--border-subtle) px-4 py-3 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--primary-green) transition-colors disabled:opacity-50"
          />
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-(--text-faint) block mb-2">
            Message Body
          </label>
          <textarea
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendState !== "idle" && sendState !== "done"}
            placeholder="Write your message here. This will be rendered in the branded STEM Impact Academy email template."
            className="w-full rounded-lg bg-(--input-bg) border border-(--border-subtle) px-4 py-3 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--primary-green) transition-colors resize-y disabled:opacity-50"
          />
          <p className="text-(--text-faint) text-xs mt-1.5">
            Plain text only — line breaks are preserved. The branded header, footer and logo are added automatically.
          </p>
        </div>

        {/* Audience */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-(--text-faint) block mb-3">
            Audience
          </label>

          {/* All users toggle */}
          <button
            onClick={() => { setAllUsers((v) => !v); setSelectedRoles([]); }}
            disabled={sendState !== "idle" && sendState !== "done"}
            className={`mb-4 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all disabled:opacity-50 ${
              allUsers
                ? "bg-[rgba(45,212,191,0.1)] border-[rgba(45,212,191,0.3)] text-(--primary-green)"
                : "bg-(--bg-elevated) border-(--border-subtle) text-(--text-muted) hover:border-(--border-medium)"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {allUsers ? "check_box" : "check_box_outline_blank"}
            </span>
            All Users (every role)
          </button>

          {/* Role chips */}
          {!allUsers && (
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((r) => {
                const active = selectedRoles.includes(r.value);
                return (
                  <button
                    key={r.value}
                    onClick={() => toggleRole(r.value)}
                    disabled={sendState !== "idle" && sendState !== "done"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all disabled:opacity-50"
                    style={{
                      background: active ? `${r.color}18` : "transparent",
                      borderColor: active ? r.color : "var(--border-subtle)",
                      color: active ? r.color : "var(--text-muted)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: r.color }}
                    />
                    {r.label}
                  </button>
                );
              })}
            </div>
          )}
          {!allUsers && selectedRoles.length === 0 && (
            <p className="text-(--text-faint) text-xs mt-2">
              Select at least one role, or enable "All Users".
            </p>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 text-(--accent-red) text-sm">
            <span className="material-symbols-outlined text-base">error</span>
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-(--border-subtle)">
          <button
            onClick={handlePreview}
            disabled={!formReady || (sendState !== "idle" && sendState !== "done")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-medium) text-(--text-base) text-sm font-semibold hover:bg-(--hover-subtle) transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sendState === "previewing" ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">visibility</span>
            )}
            Preview Recipients
          </button>

          <div className="text-(--text-faint) text-xs">
            {!audienceReady
              ? "Select an audience first"
              : allUsers
              ? "Targeting all platform users"
              : `Targeting ${selectedRoles.length} role(s)`}
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {sendState === "confirming" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-7 max-w-lg w-full shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <span className="material-symbols-outlined text-[#f59e0b] text-2xl mt-0.5">campaign</span>
              <div>
                <h3 className="text-lg font-bold text-(--text-base)">Confirm Broadcast</h3>
                <p className="text-(--text-muted) text-sm mt-1">
                  This will send <strong className="text-(--text-base)">{previewCount} email{previewCount !== 1 ? "s" : ""}</strong> using the branded STEM Impact Academy template.
                </p>
              </div>
            </div>

            {/* Subject preview */}
            <div className="bg-(--bg-elevated) rounded-lg px-4 py-3 mb-5 border border-(--border-subtle)">
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-faint) mb-1">Subject</p>
              <p className="text-sm text-(--text-base) font-medium">{subject}</p>
            </div>

            {/* Recipient preview */}
            {previewRecipients.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-(--text-faint) mb-2">
                  Sample Recipients {previewCount! > 20 ? `(showing 20 of ${previewCount})` : ""}
                </p>
                <div className="rounded-lg border border-(--border-subtle) overflow-hidden max-h-48 overflow-y-auto">
                  {previewRecipients.map((r) => (
                    <div key={r.uid} className="flex items-center gap-3 px-3 py-2.5 border-b border-(--border-subtle) last:border-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: `${roleColor[r.role] ?? "#64748b"}20`, color: roleColor[r.role] ?? "#64748b" }}
                      >
                        {r.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-(--text-base) truncate">{r.name}</p>
                        <p className="text-xs text-(--text-faint) truncate">{r.email}</p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0"
                        style={{ background: `${roleColor[r.role] ?? "#64748b"}15`, color: roleColor[r.role] ?? "#64748b" }}
                      >
                        {r.role.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-(--accent-red) text-sm mb-4">
                <span className="material-symbols-outlined text-base">error</span>
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setSendState("idle"); setErrorMsg(""); }}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) text-(--text-muted) text-sm font-semibold hover:bg-(--hover-subtle) transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-(--primary-green) text-[#10221c] text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Sending…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Send to {previewCount} {previewCount === 1 ? "recipient" : "recipients"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast history */}
      <div className="rounded-2xl bg-(--bg-card) border border-(--border-subtle) overflow-hidden">
        <div className="px-6 py-4 border-b border-(--border-subtle) flex items-center justify-between">
          <h2 className="text-base font-bold text-(--text-base) flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-(--text-muted)">history</span>
            Broadcast History
          </h2>
          <button
            onClick={fetchLogs}
            className="text-(--text-faint) hover:text-(--primary-green) transition-colors"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-3xl text-(--primary-green)">
              progress_activity
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-(--text-faint) block mb-3">
              mark_email_unread
            </span>
            <p className="text-(--text-faint) text-sm">No broadcasts sent yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border-subtle)">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 hover:bg-(--hover-subtle) transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-(--text-base) truncate">{log.subject}</p>
                    <p className="text-xs text-(--text-muted) mt-0.5 truncate">{log.message}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-(--text-faint)">
                        Sent by <span className="text-(--text-muted) font-medium">{log.sentByEmail}</span>
                      </span>
                      {log.audience?.roles?.length ? (
                        <div className="flex gap-1 flex-wrap">
                          {log.audience.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                              style={{ background: `${roleColor[r] ?? "#64748b"}15`, color: roleColor[r] ?? "#64748b" }}
                            >
                              {r.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(45,212,191,0.1)] text-(--primary-green) uppercase">
                          All Users
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end mb-1">
                      <span className="material-symbols-outlined text-[14px] text-(--primary-green)">check_circle</span>
                      <span className="text-sm font-bold text-(--primary-green)">{log.recipientCount}</span>
                      <span className="text-xs text-(--text-faint)">sent</span>
                    </div>
                    {log.errorCount > 0 && (
                      <div className="flex items-center gap-1.5 justify-end mb-1">
                        <span className="material-symbols-outlined text-[14px] text-(--accent-red)">error</span>
                        <span className="text-sm font-bold text-(--accent-red)">{log.errorCount}</span>
                        <span className="text-xs text-(--text-faint)">failed</span>
                      </div>
                    )}
                    {log.createdAt && (
                      <p className="text-xs text-(--text-faint)">
                        {new Date(log.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
