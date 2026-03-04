"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument } from "@/hooks/useFirestore";
import type { Challenge } from "@/lib/types";

function getTimestamp(val: Date | { seconds: number } | null): number | null {
  if (!val) return null;
  if (val instanceof Date) return val.getTime();
  if (typeof (val as { seconds: number }).seconds === "number")
    return (val as { seconds: number }).seconds * 1000;
  return null;
}

const stars = [1, 2, 3, 4, 5];

function WinnerInner() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id") ?? null;
  const { appUser } = useAuthContext();

  const { data: challenge } = useDocument<Challenge>("challenges", challengeId);

  const [copied, setCopied] = useState(false);
  const [printing, setPrinting] = useState(false);

  const displayName = appUser?.displayName ?? "Champion";
  const challengeTitle = challenge?.title ?? "STEM Challenge";
  const endMs = getTimestamp(challenge?.endsAt ?? null);
  const dateAwarded = endMs
    ? new Date(endMs).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  const verifyId = `STEM-${new Date().getFullYear()}-${(challengeId || appUser?.uid || "0000").slice(0, 4).toUpperCase()}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `I won ${challengeTitle}!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleDownload = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  };

  const stats = [
    { icon: "auto_awesome", label: "Skill Boost", value: "+500 XP", sub: "Added to your profile" },
    {
      icon: "leaderboard",
      label: "Community Rank",
      value: "Top 1%",
      sub: "Global participant rank",
    },
    {
      icon: "celebration",
      label: "Exclusive Perk",
      value: "2025 Summit",
      sub: "STEM Summit access granted",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a1a16] text-(--text-base) relative overflow-hidden">
      {/* Celebration glow background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-175 h-175 rounded-full blur-[160px] opacity-15 bg-[#13eca4]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-[80px] opacity-10 bg-yellow-400" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-[80px] opacity-10 bg-yellow-400" />
      </div>

      <div className="relative z-10">
        {/* Top nav */}
        <header className="flex items-center gap-6 px-8 py-5 border-b border-[rgba(19,236,164,0.12)] bg-(--bg-page)/80 backdrop-blur-sm">
          <Link
            href="/school/student/challenges"
            className="text-sm font-semibold text-slate-400 hover:text-[#13eca4] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Challenges
          </Link>
          <div className="h-4 w-px bg-[rgba(19,236,164,0.2)]" />
          <span className="text-sm font-semibold text-slate-300">{challengeTitle}</span>
          <Link
            href="/school/student/challenges/leaderboard"
            className="ml-auto text-sm font-semibold text-[#13eca4] hover:brightness-110 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">leaderboard</span>
            View Leaderboard
          </Link>
        </header>

        {/* Milestone pill + headings */}
        <div className="text-center pt-14 pb-10 px-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Milestone Achieved
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3">Challenge Winner!</h1>
          <p className="text-[#13eca4] text-xl font-bold tracking-wide">
            {challengeTitle} Champion
          </p>
        </div>

        {/* Main Content: Badge + Certificate */}
        <div className="px-8 pb-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            {/* ─── Badge ─── */}
            <div className="col-span-12 lg:col-span-5 flex flex-col items-center gap-8">
              {/* 3D Badge */}
              <div className="relative group">
                <div
                  className="w-72 h-72 rounded-full flex flex-col items-center justify-center relative overflow-hidden
                  border-[6px] border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.4),0_0_100px_rgba(250,204,21,0.15)]
                  bg-[#142a25]"
                >
                  {/* Dot grid pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(250,204,21,0.6) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <span className="material-symbols-outlined text-[7rem] text-yellow-400 drop-shadow-[0_0_24px_rgba(250,204,21,0.6)] relative z-10">
                    emoji_events
                  </span>
                  <p className="text-base font-black tracking-[0.2em] text-yellow-400 relative z-10 leading-tight text-center px-4 uppercase">
                    {challengeTitle.length > 20 ? "STEM CHAMPION" : challengeTitle}
                  </p>
                  {/* Outer ring glow */}
                  <div className="absolute inset-2 rounded-full border border-yellow-400/20 pointer-events-none" />
                  <div className="absolute inset-4 rounded-full border border-yellow-400/10 pointer-events-none" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2">
                {stars.map((s) => (
                  <span key={s} className="material-symbols-outlined text-yellow-400 text-2xl">
                    star
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#13eca4] text-[#0d1f1a] rounded-xl font-bold text-sm hover:brightness-105 transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    {copied ? "check" : "share"}
                  </span>
                  {copied ? "Link Copied!" : "Post to Social"}
                </button>
                <Link
                  href="/school/student/portfolio"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-(--bg-card) border border-[rgba(19,236,164,0.2)] text-(--text-base) rounded-xl font-bold text-sm hover:bg-[#243d40] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">work</span>
                  Portfolio
                </Link>
              </div>
            </div>

            {/* ─── Certificate ─── */}
            <div className="col-span-12 lg:col-span-7">
              <div className="w-full aspect-[1.414/1] relative bg-(--bg-page) border border-[rgba(19,236,164,0.2)] rounded-2xl overflow-hidden shadow-2xl">
                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#13eca4]/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#13eca4]/30 rounded-tr-lg" />
                <div className="absolute bottom-16 left-4 w-10 h-10 border-b-2 border-l-2 border-[#13eca4]/30 rounded-bl-lg" />
                <div className="absolute bottom-16 right-4 w-10 h-10 border-b-2 border-r-2 border-[#13eca4]/30 rounded-br-lg" />

                {/* Certificate body */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-12 py-8 bottom-12">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-[#13eca4] text-3xl">
                        verified
                      </span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#13eca4] mb-1">
                      STEM Impact Academy
                    </p>
                    <h2 className="text-lg font-black tracking-wide uppercase text-(--text-base) mb-1">
                      Certificate of Achievement
                    </h2>
                    <div className="w-20 h-px bg-linear-to-r from-transparent via-[#13eca4]/60 to-transparent mx-auto mb-4" />
                  </div>

                  <p className="text-xs text-slate-400 tracking-widest uppercase mb-1">
                    This is to certify that
                  </p>
                  <p className="text-2xl font-black tracking-tight border-b border-[#13eca4]/40 pb-1 mb-3">
                    {displayName}
                  </p>

                  <p className="text-xs text-slate-400 text-center leading-relaxed max-w-xs mb-2">
                    has demonstrated exceptional innovation and technical excellence in the
                  </p>
                  <p className="text-sm font-bold text-[#13eca4] text-center mb-6">
                    {challengeTitle}
                  </p>

                  {/* Bottom row */}
                  <div className="w-full grid grid-cols-3 items-end gap-4 mt-auto">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 mb-1">Date Awarded</p>
                      <p className="text-xs font-bold">{dateAwarded}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="size-10 rounded-full bg-[#13eca4]/20 border border-[#13eca4]/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#13eca4] text-lg">
                          shield
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Academy Seal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold italic">STEM Impact Center</p>
                      <p className="text-[10px] text-slate-500">Global Admin</p>
                    </div>
                  </div>
                </div>

                {/* Footer bar with verify ID */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#0a1a16]/80 border-t border-[rgba(19,236,164,0.12)] flex items-center justify-between px-6">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Verify ID: {verifyId}
                  </span>
                  <button
                    onClick={handleDownload}
                    disabled={printing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13eca4]/15 text-[#13eca4] border border-[#13eca4]/30 rounded-lg text-xs font-bold hover:bg-[#13eca4]/25 transition-colors disabled:opacity-60"
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${printing ? "animate-spin" : ""}`}
                    >
                      {printing ? "progress_activity" : "download"}
                    </span>
                    {printing ? "Preparing…" : "Download PDF Certificate"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-start gap-4 p-5 bg-(--bg-page) rounded-2xl border border-[rgba(19,236,164,0.1)] hover:border-[#13eca4]/30 transition-colors"
              >
                <div className="p-3 rounded-xl bg-[#13eca4]/15 text-[#13eca4] shrink-0">
                  <span className="material-symbols-outlined text-xl">{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-0.5">
                    {s.label}
                  </p>
                  <p className="text-xl font-black">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChallengeWinnerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#0a1a16]">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
            progress_activity
          </span>
        </div>
      }
    >
      <WinnerInner />
    </Suspense>
  );
}
