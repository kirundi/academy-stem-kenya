"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDocument } from "@/hooks/useFirestore";
import type { Challenge } from "@/lib/types";

function useCountdownToMs(targetMs: number | null) {
  const [remaining, setRemaining] = useState(targetMs ? Math.max(0, targetMs - Date.now()) : 0);
  useEffect(() => {
    if (!targetMs) return;
    const id = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const total = Math.floor(remaining / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { display: `${pad(h)}:${pad(m)}:${pad(sec)}`, expired: remaining === 0 };
}


type Tab = "prompt" | "resources" | "guidelines";

const milestones = [
  { id: 1, label: "Ideation", status: "done" },
  { id: 2, label: "Prototyping", status: "active" },
  { id: 3, label: "Testing", status: "pending" },
  { id: 4, label: "Final Polish", status: "pending" },
];

const team = [
  { name: "Alex Chen", initials: "AC", online: true },
  { name: "Sarah Jenkins", initials: "SJ", online: false },
  { name: "Marcus Wright", initials: "MW", online: true },
];

const resources = [
  { title: "Grid Capacity Calculator", meta: "Excel Sheet (.xlsx) • 2.4MB", icon: "description" },
  { title: "Coastal City Topography", meta: "GIS Data (.json) • 8.1MB", icon: "map" },
];

const rules = [
  "All code and designs must be original and created during the challenge.",
  "Final submission must include a 2-minute demonstration video.",
  "Late submissions (up to 15 mins) will face a 10% point penalty.",
];

function WorkspaceInner() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id") ?? null;

  const { data: challenge } = useDocument<Challenge>("challenges", challengeId);

  const [activeTab, setActiveTab] = useState<Tab>("prompt");
  const switchToResources = () => setActiveTab("resources");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function getEndMs(c: Challenge | null): number | null {
    if (!c) return null;
    if (c.endsAt instanceof Date) return c.endsAt.getTime();
    if (typeof (c.endsAt as unknown as { seconds: number }).seconds === "number")
      return (c.endsAt as unknown as { seconds: number }).seconds * 1000;
    return null;
  }

  const endMs = getEndMs(challenge);
  const timer = useCountdownToMs(endMs);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a1a16] text-white">
      {/* ── PERSISTENT TOP NAV BAR ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[rgba(19,236,164,0.2)] bg-[#0d1f1a] z-20 relative">
        <div className="flex items-center gap-8">
          <Link
            href="/school/student/challenges"
            className="flex items-center gap-2 text-[#13eca4]"
          >
            <span className="material-symbols-outlined text-2xl">deployed_code</span>
            <span className="text-white font-bold text-sm">STEM Impact Academy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/school/student/dashboard"
              className="text-sm font-medium text-slate-400 hover:text-[#13eca4] transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-sm font-medium text-[#13eca4]">Active Challenge</span>
            <button
              onClick={switchToResources}
              className="text-sm font-medium text-slate-400 hover:text-[#13eca4] transition-colors"
            >
              Resources
            </button>
          </nav>
        </div>

        {/* Persistent Timer */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 rounded-full border shadow-lg ${
            timer.expired
              ? "bg-red-900/40 border-red-500/40 shadow-red-500/20"
              : "bg-[#1a2e30]/80 border-[rgba(19,236,164,0.3)] shadow-[rgba(19,236,164,0.1)]"
          }`}
        >
          <span
            className={`material-symbols-outlined ${timer.expired ? "text-red-400 animate-pulse" : "text-[#13eca4]"}`}
          >
            timer
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-xl font-black tabular-nums tracking-tighter ${timer.expired ? "text-red-400 animate-pulse" : ""}`}
            >
              {timer.display}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {timer.expired ? "Expired" : "Remaining"}
            </span>
          </div>
          {timer.expired && (
            <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-wider">
              Late Submission
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || submitted}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              submitted
                ? "bg-green-700/40 border border-green-500/30 text-green-400 cursor-default"
                : "bg-[#13eca4] text-[#0d1f1a] hover:brightness-105"
            }`}
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-lg">
                progress_activity
              </span>
            ) : submitted ? (
              <>
                <span className="material-symbols-outlined text-lg">check_circle</span> Submitted!
              </>
            ) : (
              <>
                <span>Submit Project</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Milestones */}
        <aside className="w-60 border-r border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] overflow-y-auto p-4 hidden lg:flex flex-col">
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Milestones
            </h3>
            <nav className="space-y-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    m.status === "done"
                      ? "bg-[#13eca4]/10 text-[#13eca4] border border-[#13eca4]/20"
                      : m.status === "active"
                        ? "text-slate-300 hover:bg-[#1a2e30]"
                        : "text-slate-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {m.status === "done"
                      ? "check_circle"
                      : m.status === "active"
                        ? "radio_button_checked"
                        : "radio_button_unchecked"}
                  </span>
                  <span className="text-sm font-medium">
                    {m.id}. {m.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-[rgba(19,236,164,0.1)]">
            <div className="p-3 bg-[#1a2e30] rounded-lg">
              <p className="text-xs font-semibold mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-400">All systems operational</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[#13eca4] mb-2">
              <span className="text-xs font-bold uppercase tracking-widest">
                {challenge?.theme ?? "Active Challenge"}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4">
              {challenge?.title ?? "Loading…"}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              {challenge?.description ?? ""}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[rgba(19,236,164,0.1)] gap-8 mb-8">
            {(
              [
                { key: "prompt", label: "Challenge Prompt" },
                { key: "resources", label: "Resources" },
                { key: "guidelines", label: "Guidelines" },
              ] as Array<{ key: Tab; label: string }>
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 border-b-2 font-bold text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-[#13eca4] text-[#13eca4]"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "prompt" && (
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13eca4]">lightbulb</span>
                  The Problem
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {challenge?.description ?? "Challenge details are loading…"}
                </p>
                <div className="aspect-video w-full rounded-xl bg-[#1a2e30] border border-[rgba(19,236,164,0.1)] overflow-hidden relative group flex items-center justify-center">
                  <div className="absolute inset-0 bg-linear-to-br from-[#13eca4]/10 to-transparent" />
                  <button className="size-16 rounded-full bg-[#13eca4]/90 text-[#0d1f1a] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 z-10">
                    <span className="material-symbols-outlined text-4xl">play_arrow</span>
                  </button>
                  <div className="absolute bottom-4 left-4 bg-[#0d1f1a]/80 px-3 py-1 rounded text-xs font-medium border border-[rgba(19,236,164,0.2)] text-[#13eca4]">
                    Reference: {challenge?.title ?? "Challenge Reference"}
                  </div>
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13eca4]">inventory_2</span>
                  Core Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((r) => (
                    <div
                      key={r.title}
                      className="p-4 rounded-xl border border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] hover:border-[#13eca4]/40 transition-colors flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-[#13eca4]/20 text-[#13eca4]">
                        <span className="material-symbols-outlined">{r.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-[#13eca4] transition-colors">
                          {r.title}
                        </h4>
                        <p className="text-xs text-slate-500">{r.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((r) => (
                <div
                  key={r.title}
                  className="p-4 rounded-xl border border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] hover:border-[#13eca4]/40 transition-colors flex items-start gap-4 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-[#13eca4]/20 text-[#13eca4]">
                    <span className="material-symbols-outlined">{r.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#13eca4] transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-xs text-slate-500">{r.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "guidelines" && (
            <ul className="space-y-4">
              {rules.map((rule, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm p-4 bg-[#0d1f1a] rounded-xl border border-[rgba(19,236,164,0.1)]"
                >
                  <span className="material-symbols-outlined text-[#13eca4] text-xl shrink-0">
                    verified
                  </span>
                  <span className="text-slate-300">{rule}</span>
                </li>
              ))}
            </ul>
          )}
        </main>

        {/* Right Sidebar: Team & Rules */}
        <aside className="w-72 border-l border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] overflow-y-auto p-6 hidden xl:flex flex-col gap-8">
          {/* Team */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex justify-between items-center">
              Team Members
              <span className="px-2 py-0.5 rounded-full bg-[#13eca4]/20 text-[#13eca4] text-[10px] font-bold">
                Team Delta
              </span>
            </h3>
            <div className="space-y-3">
              {team.map((m) => (
                <div
                  key={m.name}
                  className={`flex items-center justify-between ${!m.online ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#1a2e30] border border-[rgba(19,236,164,0.3)] flex items-center justify-center text-[10px] font-bold text-[#13eca4]">
                      {m.initials}
                    </div>
                    <span className="text-sm font-medium">{m.name}</span>
                  </div>
                  <span
                    className={`size-2 rounded-full ${m.online ? "bg-green-500" : "bg-slate-500"}`}
                  />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold border border-[rgba(19,236,164,0.2)] rounded-lg hover:bg-[#13eca4]/5 transition-colors text-[#13eca4]">
              Open Team Chat
            </button>
          </section>

          {/* Rules */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Challenge Rules
            </h3>
            <ul className="space-y-3">
              {rules.map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="material-symbols-outlined text-[#13eca4] text-lg shrink-0">
                    verified
                  </span>
                  <span className="text-slate-400 text-xs leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Help box */}
          <div className="p-4 rounded-xl bg-[#13eca4]/5 border border-[#13eca4]/20">
            <div className="flex items-center gap-2 mb-2 text-[#13eca4]">
              <span className="material-symbols-outlined">help_outline</span>
              <h4 className="text-sm font-bold">Stuck?</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Our mentors are online. Send a help request to get a quick guidance session.
            </p>
            <button className="w-full py-2 bg-[#13eca4]/20 text-[#13eca4] rounded-lg text-xs font-bold hover:bg-[#13eca4]/30 transition-colors">
              Request Mentor
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function StudentActiveChallengeWorkspace() {
  return (
    <Suspense>
      <WorkspaceInner />
    </Suspense>
  );
}
