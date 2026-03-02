"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PRIMARY = "#13eca4";

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

const leaderboardTop3 = [
  { rank: 2, name: "Sarah L.", initials: "SL", pts: 14200, color: "#94a3b8" },
  { rank: 1, name: "Marcus V.", initials: "MV", pts: 17850, color: PRIMARY },
  { rank: 3, name: "Elena R.", initials: "ER", pts: 11900, color: "#fb923c" },
];

const leaderboardRest = [
  { rank: 4, name: "Alex Chen", initials: "AC", pts: 12450, isMe: true },
  { rank: 5, name: "Jordan K.", initials: "JK", pts: 11900 },
  { rank: 6, name: "Ryan M.", initials: "RM", pts: 10200 },
  { rank: 7, name: "Sofia G.", initials: "SG", pts: 9850 },
];

export default function StudentChallengesHub() {
  const deadline = useCountdown(5 * 3600 + 22 * 60 + 45);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex min-h-screen bg-[#0a1a16] text-white">
      {/* ── MAIN ─────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">CHALLENGES HUB</h2>
            <p className="text-slate-400 max-w-lg text-sm">
              Conquer time-bound coding challenges, build high-impact solutions, and rise through
              the ranks.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#1a2e30] border border-[rgba(19,236,164,0.2)] rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13eca4] text-lg">toll</span>
              <span className="font-bold text-[#13eca4]">2,450 Bits</span>
            </div>
            <Link
              href="/school/student/challenges/active"
              className="bg-[#13eca4] text-[#0d1f1a] font-bold px-6 py-2 rounded-xl hover:brightness-105 transition-all flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Quick Start
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left 8 cols */}
            <div className="col-span-8 space-y-10">
              {/* Active Challenges */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">Active Challenges</h3>
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 animate-pulse uppercase tracking-tighter">
                      Live Now
                    </span>
                  </div>
                  <button className="text-[#13eca4] text-sm font-medium hover:underline">
                    View archive
                  </button>
                </div>

                {/* Hero Challenge Card */}
                <div className="relative overflow-hidden rounded-2xl bg-[#1a2e30] border border-[rgba(19,236,164,0.3)] shadow-lg shadow-[rgba(19,236,164,0.1)]">
                  <div className="grid grid-cols-2">
                    <div className="p-8 flex flex-col justify-between">
                      <div>
                        <h4 className="text-3xl font-black text-white mb-3">Eco-Hack 2024</h4>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                          Design and prototype a decentralized application to track and offset
                          carbon footprints for urban communities.
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono text-[#13eca4] mb-8">
                          <div className="flex items-center gap-1.5 bg-[#13eca4]/10 px-3 py-1.5 rounded-lg border border-[#13eca4]/20">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            $5,000 PRIZE
                          </div>
                          <div className="flex items-center gap-1.5 bg-[#13eca4]/10 px-3 py-1.5 rounded-lg border border-[#13eca4]/20">
                            <span className="material-symbols-outlined text-[16px]">groups</span>
                            1.2K CODERS
                          </div>
                        </div>
                      </div>

                      {/* Countdown */}
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-400">
                          Submission Deadline In
                        </p>
                        <div className="flex gap-3">
                          {[
                            { v: pad(deadline.h), l: "Hrs" },
                            { v: pad(deadline.m), l: "Min" },
                            { v: pad(deadline.s), l: "Sec" },
                          ].map((t, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div
                                className={`w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 ${i === 1 ? "bg-[#1a2e30] text-[#13eca4]" : "bg-[#243d40]"}`}
                              >
                                <span className="text-xl font-bold text-white">{t.v}</span>
                              </div>
                              <span className="text-[10px] mt-1 text-slate-500 uppercase">
                                {t.l}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Link
                          href="/school/student/challenges/active"
                          className="mt-4 w-full bg-[#13eca4] text-[#0a1a16] font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-sm"
                        >
                          JOIN CHALLENGE NOW
                          <span className="material-symbols-outlined">trending_flat</span>
                        </Link>
                      </div>
                    </div>

                    {/* Right visual */}
                    <div className="relative min-h-95 bg-linear-to-br from-[#13eca4]/20 via-[#0d2420] to-[#102022]">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span
                          className="material-symbols-outlined text-[#13eca4]"
                          style={{ fontSize: "220px" }}
                        >
                          eco
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-linear-to-r from-[#1a2e30] via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Upcoming Challenges */}
              <section>
                <h3 className="text-2xl font-bold mb-6">Upcoming Challenges</h3>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { title: "Neural-Net Sprint", date: "OCT 12", icon: "psychology" },
                    { title: "Quantum Key Quest", date: "OCT 28", icon: "key" },
                  ].map((c) => (
                    <div
                      key={c.title}
                      className="relative group overflow-hidden rounded-2xl bg-[#1a2e30] border border-white/5 h-64 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <span
                          className="material-symbols-outlined text-white"
                          style={{ fontSize: "180px" }}
                        >
                          {c.icon}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-[#0d1f1a]/70" />
                      <div className="relative h-full p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <span className="material-symbols-outlined text-white/50">lock</span>
                          </div>
                          <span className="text-[10px] font-mono bg-white/10 text-white/60 px-2 py-1 rounded">
                            START: {c.date}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white/40">{c.title}</h4>
                          <p className="text-sm text-slate-600">Locked until {c.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right 4 cols */}
            <div className="col-span-4 space-y-6">
              {/* School Leaderboard */}
              <div className="bg-[#1a2e30] rounded-2xl border border-[rgba(19,236,164,0.1)] overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#13eca4] text-lg">
                        stars
                      </span>
                      School Leaderboard
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">SEASON 04</span>
                  </div>

                  {/* Podium */}
                  <div className="flex justify-around items-end pt-4 pb-2">
                    {[leaderboardTop3[0], leaderboardTop3[1], leaderboardTop3[2]].map((p) => (
                      <div
                        key={p.rank}
                        className={`flex flex-col items-center gap-2 ${p.rank === 1 ? "mb-4" : ""}`}
                      >
                        <div className="relative">
                          {p.rank === 1 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 material-symbols-outlined text-[#13eca4] text-2xl">
                              workspace_premium
                            </span>
                          )}
                          <div
                            className={`rounded-full border-2 flex items-center justify-center font-bold text-[#0d1f1a] ${
                              p.rank === 1 ? "size-16 text-xs" : "size-12 text-[10px]"
                            }`}
                            style={{ backgroundColor: p.color, borderColor: p.color }}
                          >
                            {p.initials}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1f1a] ${
                              p.rank === 1 ? "size-6" : "size-5"
                            }`}
                            style={{ backgroundColor: p.color }}
                          >
                            {p.rank}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-medium ${p.rank === 1 ? "font-bold text-[#13eca4]" : ""}`}
                        >
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="divide-y divide-white/5">
                  {leaderboardRest.map((r) => (
                    <div
                      key={r.rank}
                      className={`px-5 py-3 flex items-center gap-3 ${r.isMe ? "bg-[#13eca4]/5" : ""}`}
                    >
                      <span className="text-xs text-slate-500 font-mono w-4">{r.rank}</span>
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-[9px] font-bold text-[#0d1f1a]"
                        style={{ backgroundColor: r.isMe ? PRIMARY : "#475569" }}
                      >
                        {r.initials}
                      </div>
                      <span
                        className={`text-sm font-${r.isMe ? "bold" : "medium"} flex-1 ${r.isMe ? "text-white" : "text-slate-400"}`}
                      >
                        {r.name}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${r.isMe ? "text-[#13eca4]" : "text-slate-500"}`}
                      >
                        {r.pts.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 text-center border-t border-white/5">
                  <Link
                    href="/school/student/challenges/leaderboard"
                    className="text-[10px] text-[#13eca4] font-bold hover:tracking-widest transition-all uppercase"
                  >
                    See Full Rankings
                  </Link>
                </div>
              </div>

              {/* Live Stream card */}
              <div className="bg-[#1a2e30] rounded-2xl p-5 border border-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <span className="material-symbols-outlined text-lg">notifications_active</span>
                  </div>
                  <h4 className="font-bold text-sm">Live Stream</h4>
                </div>
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/5">
                  <div className="absolute inset-0 bg-linear-to-br from-[#102022] to-black" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-white text-2xl">
                        play_arrow
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <span className="bg-red-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded uppercase">
                      Live
                    </span>
                    <span className="text-[10px] text-white/80 backdrop-blur-md px-1.5 py-0.5 rounded bg-black/40">
                      150 watching
                    </span>
                  </div>
                </div>
                <p className="text-xs mt-2 text-slate-400">
                  Mentors are helping with Eco-Hack API integration right now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
