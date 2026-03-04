"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

interface SchoolResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  county?: string;
  createdAt: { seconds: number } | null;
}

function formatDate(ts: { seconds: number } | null) {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-KE", {
    year: "numeric", month: "short", day: "numeric",
  });
}

const STATUS_COLOR: Record<string, string> = {
  active: "#10b981",
  pending: "#f59e0b",
  review: "#3b82f6",
  suspended: "#ef4444",
  rejected: "#ef4444",
};

export default function SupportSchoolsPage() {
  const { appUser } = useAuthContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<SchoolResult | null>(null);

  const displayName = appUser?.displayName ?? "Support";

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearched(false);
    setSelected(null);
    try {
      const res = await fetch(`/api/support/schools?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(59,130,246,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">School Lookup</h1>
          <p className="text-slate-400 text-xs mt-0.5">Platform Support · Read-only</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-bold text-sm">
          {displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </div>
      </header>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="relative bg-gradient-to-r from-[#1a2e27] to-[#162820] rounded-2xl p-8 mb-8 border border-[rgba(59,130,246,0.15)] overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border-2 border-[rgba(59,130,246,0.08)] rounded-full" />
          <div className="relative z-10">
            <p className="text-[#3b82f6] font-semibold text-sm mb-2 uppercase tracking-widest">School Lookup</p>
            <h2 className="text-2xl font-bold text-white mb-1">Search Schools</h2>
            <p className="text-slate-400 text-sm max-w-md">
              Search for any school by name to view its profile, status, and registration details.
              This is a read-only view — contact an admin to make changes.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(59,130,246,0.12)] overflow-hidden mb-6">
          <div className="p-6 border-b border-[rgba(59,130,246,0.08)]">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3b82f6] text-[20px]">manage_search</span>
              Search Schools
            </h2>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by school name…"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[rgba(59,130,246,0.5)] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={searching || query.trim().length < 2}
                className="px-5 py-3 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

          {searched && results.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3 block">domain_disabled</span>
              <p className="text-slate-400 text-sm">No schools found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {results.length > 0 && !selected && (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {results.map((school) => {
                const statusColor = STATUS_COLOR[school.status] ?? "#64748b";
                return (
                  <button
                    key={school.id}
                    onClick={() => setSelected(school)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[rgba(59,130,246,0.05)] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[rgba(59,130,246,0.15)] flex items-center justify-center text-[#3b82f6] shrink-0">
                      <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{school.name}</p>
                      <p className="text-slate-400 text-xs truncate">{school.county ?? "No county"} · {formatDate(school.createdAt)}</p>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 capitalize"
                      style={{ background: `${statusColor}18`, color: statusColor }}
                    >
                      {school.status}
                    </span>
                    <span className="material-symbols-outlined text-slate-600 text-[18px]">chevron_right</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(59,130,246,0.15)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(59,130,246,0.08)] flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <h2 className="text-white font-bold">School Profile</h2>
              <span className="ml-auto text-xs text-slate-500">Read-only</span>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[rgba(59,130,246,0.15)] flex items-center justify-center text-[#3b82f6]">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  {selected.email && <p className="text-slate-400 text-sm">{selected.email}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize"
                      style={{ background: `${STATUS_COLOR[selected.status] ?? "#64748b"}18`, color: STATUS_COLOR[selected.status] ?? "#64748b" }}
                    >
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "School ID", value: selected.id, mono: true },
                  { label: "County", value: selected.county ?? "Not set" },
                  { label: "Status", value: selected.status },
                  { label: "Registered", value: formatDate(selected.createdAt) },
                  ...(selected.phone ? [{ label: "Phone", value: selected.phone }] : []),
                  ...(selected.email ? [{ label: "Email", value: selected.email }] : []),
                ].map(({ label, value, mono }) => (
                  <div key={label} className="p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]">
                    <p className="text-slate-500 text-xs mb-1">{label}</p>
                    <p className={`text-white text-sm ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.12)]">
                <p className="text-[#3b82f6] text-xs font-semibold mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Support Note
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  To update school information, change its status, or manage its administrators, contact a platform admin. Support accounts are view-only.
                </p>
              </div>
            </div>
          </div>
        )}

        {!searched && !selected && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "domain", title: "Search by name", desc: "Enter a full or partial school name. Minimum 2 characters." },
              { icon: "location_on", title: "County filtering", desc: "Results include county information for easy geographic lookup." },
              { icon: "lock", title: "View-only access", desc: "You can view school details but cannot make changes. Contact an admin for modifications." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#1a2e27] rounded-2xl p-5 border border-[rgba(59,130,246,0.08)]">
                <span className="material-symbols-outlined text-[#3b82f6] text-[28px] mb-3 block">{icon}</span>
                <p className="text-white font-semibold text-sm mb-1">{title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
