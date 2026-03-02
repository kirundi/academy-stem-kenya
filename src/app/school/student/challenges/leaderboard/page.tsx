"use client";

import { useState } from "react";
import Link from "next/link";

type Filter = "global" | "school" | "category";

const podium = [
  { rank: 2, team: "Solar Synthetics", school: "Greenwood High", pts: 8940, color: "from-slate-500/30 to-slate-700/10", ring: "ring-slate-400", badge: "bg-slate-400 text-slate-900", medal: "🥈" },
  { rank: 1, team: "AquaPurify Elite", school: "Oakridge Academy", pts: 10250, color: "from-yellow-500/30 to-yellow-700/5", ring: "ring-yellow-400", badge: "bg-yellow-400 text-yellow-900", medal: "👑" },
  { rank: 3, team: "Wind Walkers", school: "St. Mary's Tech", pts: 7120, color: "from-orange-600/30 to-orange-800/5", ring: "ring-orange-400", badge: "bg-orange-400 text-orange-900", medal: "🥉" },
];

const rows = [
  { rank: 4, team: "Terraformers", school: "Northside International", badges: ["eco", "biotech"], pts: 6845 },
  { rank: 5, team: "Eco Warriors", school: "Riverside Secondary", badges: ["eco", "energy", "award_star"], pts: 6210, isMe: true },
  { rank: 6, team: "Green Genies", school: "Riverside Secondary", badges: ["eco"], pts: 5930 },
  { rank: 7, team: "Bio-Bots", school: "St. Mary's Tech", badges: ["biotech", "smart_toy"], pts: 5715 },
];

const schoolSpirit = [
  { name: "Oakridge Academy", pts: 45210, pct: 85 },
  { name: "Greenwood High", pts: 38150, pct: 72 },
  { name: "St. Mary's Tech", pts: 32900, pct: 62 },
  { name: "Northside International", pts: 29440, pct: 55 },
];

const activity = [
  { team: "AquaPurify Elite", event: "Completed Prototype milestone", pts: "+1,200 pts", color: "bg-[#13eca4]", time: "2m ago" },
  { team: "Green Genies", event: "Earned 'Eco Pioneer' badge", pts: "+250 pts", color: "bg-yellow-400", time: "5m ago" },
  { team: "Terraformers", event: "Submitted final prototype", pts: "+500 pts", color: "bg-slate-400", time: "12m ago" },
];

export default function HackathonLeaderboard() {
  const [filter, setFilter] = useState<Filter>("global");
  const [loadMore, setLoadMore] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a1a16] text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 border-b border-[rgba(19,236,164,0.12)] bg-[#0d1f1a] px-8 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/school/student/challenges" className="text-sm font-semibold text-slate-400 hover:text-[#13eca4] transition-colors">Challenges</Link>
          <span className="text-sm font-semibold text-[#13eca4]">Leaderboard</span>
          <Link href="#" className="text-sm font-semibold text-slate-400 hover:text-[#13eca4] transition-colors">Projects</Link>
          <Link href="#" className="text-sm font-semibold text-slate-400 hover:text-[#13eca4] transition-colors">Mentors</Link>
        </nav>
        <Link
          href="/school/student/challenges/active"
          className="flex items-center gap-2 px-4 py-2 bg-[#13eca4] text-[#0d1f1a] rounded-lg font-bold text-sm hover:brightness-105 transition-all"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          Submit Project
        </Link>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-b from-[#0d1f1a] to-[#0a1a16] px-8 pt-12 pb-8 border-b border-[rgba(19,236,164,0.1)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-10 bg-[#13eca4]" />
        </div>
        <div className="max-w-3xl">
          <p className="text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-2">Live Event</p>
          <h1 className="text-4xl font-black tracking-tight mb-4">Eco-Hack 2024 Global Leaderboard</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-[rgba(19,236,164,0.3)] rounded-lg text-sm font-semibold text-[#13eca4] hover:bg-[#13eca4]/5 transition-colors">View Rules</button>
            <Link href="/school/student/challenges/active" className="px-4 py-2 bg-[#13eca4] text-[#0d1f1a] rounded-lg text-sm font-bold hover:brightness-105 transition-all">Submit Project</Link>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-6 px-8 py-5 border-b border-[rgba(19,236,164,0.08)] bg-[#0d1f1a]">
        <div className="flex items-center gap-1 bg-[#1a2e30]/60 p-1 rounded-lg">
          {(["global", "school", "category"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors ${filter === f ? "bg-[#13eca4]/20 text-[#13eca4]" : "text-slate-400 hover:text-white"}`}
            >
              {f === "global" ? "Global" : f === "school" ? "My School" : "By Category"}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-[rgba(19,236,164,0.2)]" />
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13eca4] text-base">group</span>
            <span className="font-bold">12,482</span>
            <span className="text-slate-500">Total Participants</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-base">attach_money</span>
            <span className="font-bold">$25,000</span>
            <span className="text-slate-500">Prize Pool</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-8 py-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Left: Leaderboard */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Podium */}
          <div className="flex items-end justify-center gap-4 py-4">
            {podium.map((p) => (
              <div
                key={p.rank}
                className={`flex flex-col items-center gap-3 flex-1 bg-linear-to-b ${p.color} border border-[rgba(255,255,255,0.05)] rounded-2xl px-4 py-6 ${p.rank === 1 ? "scale-105 pb-8" : ""} transition-transform`}
              >
                <div className="text-2xl">{p.medal}</div>
                <div className={`size-14 rounded-full ring-2 ${p.ring} flex items-center justify-center text-lg font-black bg-[#1a2e30]`}>
                  {p.team[0]}
                </div>
                <div className="text-center">
                  <p className="font-black text-sm leading-tight">{p.team}</p>
                  <p className="text-xs text-slate-400">{p.school}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-black ${p.badge}`}>
                  {p.pts.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>

          {/* Rankings Table */}
          <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.08)] flex items-center justify-between">
              <h3 className="font-bold text-sm">Full Rankings</h3>
              <span className="text-xs text-slate-400">Updated live</span>
            </div>
            <div className="divide-y divide-[rgba(19,236,164,0.05)]">
              {rows.map((row) => (
                <div
                  key={row.rank}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    row.isMe
                      ? "border-l-2 border-[#13eca4] bg-[#13eca4]/5"
                      : "hover:bg-[#1a2e30]/40"
                  }`}
                >
                  <span className={`text-sm font-black w-6 shrink-0 ${row.isMe ? "text-[#13eca4]" : "text-slate-500"}`}>
                    {row.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {row.team}
                      {row.isMe && (
                        <span className="ml-2 text-[10px] font-bold text-[#13eca4] bg-[#13eca4]/15 rounded-full px-2 py-0.5">You</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{row.school}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {row.badges.map((b) => (
                      <span key={b} className="material-symbols-outlined text-base text-[#13eca4]/70">{b}</span>
                    ))}
                  </div>
                  <span className="text-sm font-black w-20 text-right shrink-0">{row.pts.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="text-center">
            <button
              onClick={() => setLoadMore(true)}
              disabled={loadMore}
              className="px-8 py-3 border border-[rgba(19,236,164,0.2)] rounded-xl text-sm font-bold text-slate-300 hover:bg-[#1a2e30] transition-colors disabled:opacity-50"
            >
              {loadMore ? "Loaded" : "Load 50 More Teams"}
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* School Spirit */}
          <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">School Spirit</h3>
            <div className="space-y-4">
              {schoolSpirit.map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">
                      {i === 0 && <span className="mr-1">🏆</span>}{s.name}
                    </span>
                    <span className="text-slate-400">{s.pts.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#1a2e30] rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[#13eca4] transition-all duration-1000"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 py-2.5 text-xs font-bold text-[#13eca4] border border-[rgba(19,236,164,0.2)] rounded-xl hover:bg-[#13eca4]/5 transition-colors">
              Boost My School
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Recent Activity</h3>
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`size-3 rounded-full shrink-0 mt-0.5 ${a.color}`} />
                    {i < activity.length - 1 && <div className="w-px flex-1 my-1 bg-[rgba(19,236,164,0.1)]" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold text-slate-300">{a.team}</p>
                    <p className="text-xs text-slate-500">{a.event}</p>
                    <p className={`text-xs font-bold mt-0.5 ${a.color === "bg-[#13eca4]" ? "text-[#13eca4]" : a.color === "bg-yellow-400" ? "text-yellow-400" : "text-slate-400"}`}>
                      {a.pts}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Map placeholder */}
          <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Regional Map</h3>
            <div className="aspect-video rounded-xl bg-[#1a2e30] flex flex-col items-center justify-center gap-2 border border-[rgba(19,236,164,0.08)]">
              <span className="material-symbols-outlined text-4xl text-[#13eca4]/30">map</span>
              <p className="text-xs text-slate-600">Interactive map coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
