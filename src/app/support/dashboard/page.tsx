"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

const ROLE_COLORS: Record<string, string> = {
  student: "#2dd4bf",
  teacher: "#3b82f6",
  school_admin: "#f59e0b",
  editor: "#ec4899",
  admin: "#8b5cf6",
  super_admin: "#ef4444",
  parent: "#8b5cf6",
  mentor: "#10b981",
  support: "#3b82f6",
  observer: "#06b6d4",
  content_reviewer: "#f59e0b",
  analytics_viewer: "#a855f7",
};

interface UserResult {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  schoolId: string | null;
  requiresPasswordChange: boolean;
  createdAt: { seconds: number } | null;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(ts: { seconds: number } | null) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-KE", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function SupportDashboard() {
  const { appUser } = useAuthContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<UserResult | null>(null);

  const displayName = appUser?.displayName ?? "Support";

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearched(false);
    setSelected(null);
    try {
      const res = await fetch(`/api/support/users?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(59,130,246,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">User Lookup</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Platform Support · Read-only</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#3b82f6] flex items-center justify-center text-(--text-base) font-bold text-sm">
          {getInitials(displayName)}
        </div>
      </header>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative bg-linear-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-8 mb-8 border border-[rgba(59,130,246,0.15)] overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-[rgba(59,130,246,0.08)] rounded-full" />
          <div className="relative z-10">
            <p className="text-[#3b82f6] font-semibold text-sm mb-2 uppercase tracking-widest">Support Console</p>
            <h2 className="text-2xl font-bold text-(--text-base) mb-1">Hi, {displayName.split(" ")[0]}!</h2>
            <p className="text-(--text-muted) text-sm max-w-md">
              Search for any user by email address or display name to view their profile, role, and account status.
              This is a read-only view — no changes can be made here.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-(--bg-card) rounded-2xl border border-[rgba(59,130,246,0.12)] overflow-hidden mb-6">
          <div className="p-6 border-b border-[rgba(59,130,246,0.08)]">
            <h2 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">manage_search</span>
              Search Users
            </h2>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by email or name…"
                  className="w-full bg-(--input-bg) border border-(--border-subtle) rounded-xl pl-10 pr-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm focus:outline-none focus:border-[rgba(59,130,246,0.5)] focus:bg-[rgba(59,130,246,0.05)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={searching || query.trim().length < 2}
                className="px-5 py-3 rounded-xl bg-[#3b82f6] text-(--text-base) font-semibold text-sm hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {searching ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">search</span>
                )}
                Search
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && results.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-(--text-faint) mb-3 block">person_off</span>
              <p className="text-(--text-muted) text-sm">No users found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {results.length > 0 && !selected && (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {results.map((u) => {
                const roleColor = ROLE_COLORS[u.role] ?? "#64748b";
                return (
                  <button
                    key={u.uid}
                    onClick={() => setSelected(u)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[rgba(59,130,246,0.05)] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[rgba(59,130,246,0.15)] flex items-center justify-center text-[#3b82f6] font-bold text-sm shrink-0">
                      {getInitials(u.displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-(--text-base) font-medium text-sm">{u.displayName}</p>
                      <p className="text-(--text-muted) text-xs truncate">{u.email}</p>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: `${roleColor}18`, color: roleColor }}
                    >
                      {u.role}
                    </span>
                    <span className="material-symbols-outlined text-(--text-faint) text-[18px]">chevron_right</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected user detail */}
        {selected && (
          <div className="bg-(--bg-card) rounded-2xl border border-[rgba(59,130,246,0.15)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(59,130,246,0.08)] flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg bg-(--input-bg) hover:bg-(--bg-elevated) text-(--text-muted) hover:text-(--text-base) transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <h2 className="text-(--text-base) font-bold">User Profile</h2>
              <span className="ml-auto text-xs text-(--text-faint)">Read-only</span>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(59,130,246,0.15)] flex items-center justify-center text-[#3b82f6] font-bold text-2xl">
                  {getInitials(selected.displayName)}
                </div>
                <div>
                  <h3 className="text-(--text-base) font-bold text-lg">{selected.displayName}</h3>
                  <p className="text-(--text-muted) text-sm">{selected.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: `${ROLE_COLORS[selected.role] ?? "#64748b"}18`,
                        color: ROLE_COLORS[selected.role] ?? "#64748b",
                      }}
                    >
                      {selected.role}
                    </span>
                    {selected.requiresPasswordChange && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400">
                        Needs Password Reset
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "User UID", value: selected.uid, mono: true },
                  { label: "School ID", value: selected.schoolId ?? "None", mono: true },
                  { label: "Role", value: selected.role },
                  { label: "Account Created", value: formatDate(selected.createdAt) },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-(--border-subtle)">
                    <p className="text-(--text-faint) text-xs mb-1">{label}</p>
                    <p className={`text-(--text-base) text-sm ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.12)]">
                <p className="text-[#3b82f6] text-xs font-semibold mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Support Note
                </p>
                <p className="text-(--text-muted) text-xs leading-relaxed">
                  To reset this user&apos;s password, change their role, or deactivate their account,
                  contact a platform administrator. Support accounts are view-only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick reference */}
        {!searched && !selected && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "email", title: "Search by email", desc: "Enter a full or partial email address. Minimum 2 characters." },
              { icon: "person", title: "Search by name", desc: "Enter a display name prefix. Results are case-sensitive." },
              { icon: "lock", title: "View-only access", desc: "You can see account details but cannot make changes. Contact an admin for modifications." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-(--bg-card) rounded-2xl p-5 border border-[rgba(59,130,246,0.08)]">
                <span className="material-symbols-outlined text-[#3b82f6] text-[28px] mb-3 block">{icon}</span>
                <p className="text-(--text-base) font-semibold text-sm mb-1">{title}</p>
                <p className="text-(--text-muted) text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
