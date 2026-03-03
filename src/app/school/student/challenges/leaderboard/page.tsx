"use client";

import { Suspense } from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import { where, orderBy, limit } from "firebase/firestore";
import type { AppUser } from "@/lib/types";

type Filter = "global" | "school" | "category";

const medalStyle = [
  {
    medal: "👑",
    ring: "ring-yellow-400",
    badge: "bg-yellow-400 text-yellow-900",
    color: "from-yellow-500/30 to-yellow-700/5",
  },
  {
    medal: "🥈",
    ring: "ring-slate-400",
    badge: "bg-slate-400 text-slate-900",
    color: "from-slate-500/30 to-slate-700/10",
  },
  {
    medal: "🥉",
    ring: "ring-orange-400",
    badge: "bg-orange-400 text-orange-900",
    color: "from-orange-600/30 to-orange-800/5",
  },
];

function LeaderboardInner() {
  const { appUser } = useAuthContext();
  const [filter, setFilter] = useState<Filter>("school");

  // Fetch students from same school, ordered by XP descending
  const schoolId = appUser?.schoolId ?? null;

  const { data: schoolStudents, loading: schoolLoading } = useCollection<AppUser>(
    "users",
    schoolId
      ? [
          where("schoolId", "==", schoolId),
          where("role", "==", "student"),
          orderBy("xp", "desc"),
          limit(20),
        ]
      : [],
    !!schoolId
  );

  // Global top students (for global filter)
  const { data: globalStudents, loading: globalLoading } = useCollection<AppUser>(
    "users",
    filter === "global" ? [where("role", "==", "student"), orderBy("xp", "desc"), limit(20)] : [],
    filter === "global"
  );

  const students = filter === "school" ? schoolStudents : globalStudents;
  const loading = filter === "school" ? schoolLoading : globalLoading;

  // Build school spirit from school students grouped by schoolId
  // For global filter, we don't have school aggregation easily — show current school only
  const schoolSpirit = useMemo(() => {
    if (!schoolStudents.length) return [];
    const totalXp = schoolStudents.reduce((sum, s) => sum + (s.xp ?? 0), 0);
    return [{ name: schoolId ?? "Your School", pts: totalXp, pct: 100 }];
  }, [schoolStudents, schoolId]);

  const podium = students.slice(0, 3);
  const rows = students.slice(3);
  const myRank = students.findIndex((s) => s.uid === appUser?.uid);

  return (
    <div className="min-h-screen bg-[#0a1a16] text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 border-b border-[rgba(19,236,164,0.12)] bg-[#0d1f1a] px-8 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            href="/school/student/challenges"
            className="text-sm font-semibold text-slate-400 hover:text-[#13eca4] transition-colors"
          >
            Challenges
          </Link>
          <span className="text-sm font-semibold text-[#13eca4]">Leaderboard</span>
        </nav>
        <Link
          href="/school/student/challenges"
          className="flex items-center gap-2 px-4 py-2 bg-[#13eca4] text-[#0d1f1a] rounded-lg font-bold text-sm hover:brightness-105 transition-all"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          View Challenges
        </Link>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-b from-[#0d1f1a] to-[#0a1a16] px-8 pt-12 pb-8 border-b border-[rgba(19,236,164,0.1)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-[120px] opacity-10 bg-[#13eca4]" />
        </div>
        <div className="max-w-3xl">
          <p className="text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-2">
            Live Rankings
          </p>
          <h1 className="text-4xl font-black tracking-tight mb-4">Challenge Leaderboard</h1>
          <p className="text-slate-400 text-sm">Rankings by XP earned across all challenges.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-6 px-8 py-5 border-b border-[rgba(19,236,164,0.08)] bg-[#0d1f1a]">
        <div className="flex items-center gap-1 bg-[#1a2e30]/60 p-1 rounded-lg">
          {(["school", "global"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-colors ${filter === f ? "bg-[#13eca4]/20 text-[#13eca4]" : "text-slate-400 hover:text-white"}`}
            >
              {f === "school" ? "My School" : "Global"}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-[rgba(19,236,164,0.2)]" />
        <div className="flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-[#13eca4] text-base">group</span>
          <span className="font-bold">{students.length}</span>
          <span className="text-slate-500">Students Ranked</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="px-8 py-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Left: Leaderboard */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
                progress_activity
              </span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <span className="material-symbols-outlined text-[64px] mb-4 block">leaderboard</span>
              <p className="text-lg font-semibold">No rankings yet.</p>
              <p className="text-sm mt-2">Complete challenges to appear on the leaderboard.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              {podium.length > 0 && (
                <div className="flex items-end justify-center gap-4 py-4">
                  {[podium[1] ?? null, podium[0] ?? null, podium[2] ?? null].map((student, i) => {
                    if (!student) return null;
                    const originalRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                    const style = medalStyle[originalRank - 1];
                    const isMe = student.uid === appUser?.uid;
                    return (
                      <div
                        key={student.uid}
                        className={`flex flex-col items-center gap-3 flex-1 bg-linear-to-b ${style.color} border border-[rgba(255,255,255,0.05)] rounded-2xl px-4 py-6 ${originalRank === 1 ? "scale-105 pb-8" : ""} transition-transform`}
                      >
                        <div className="text-2xl">{style.medal}</div>
                        <div
                          className={`size-14 rounded-full ring-2 ${style.ring} flex items-center justify-center text-lg font-black bg-[#1a2e30]`}
                        >
                          {(student.displayName ?? "?")[0].toUpperCase()}
                        </div>
                        <div className="text-center">
                          <p className="font-black text-sm leading-tight">
                            {student.displayName ?? "Student"}
                            {isMe && (
                              <span className="ml-1 text-[10px] font-bold text-[#13eca4]">
                                {" "}
                                (You)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-black ${style.badge}`}>
                          {(student.xp ?? 0).toLocaleString()} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rankings Table */}
              {rows.length > 0 && (
                <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.08)] flex items-center justify-between">
                    <h3 className="font-bold text-sm">Full Rankings</h3>
                    <span className="text-xs text-slate-400">Sorted by XP</span>
                  </div>
                  <div className="divide-y divide-[rgba(19,236,164,0.05)]">
                    {rows.map((student, idx) => {
                      const rank = idx + 4;
                      const isMe = student.uid === appUser?.uid;
                      return (
                        <div
                          key={student.uid}
                          className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                            isMe
                              ? "border-l-2 border-[#13eca4] bg-[#13eca4]/5"
                              : "hover:bg-[#1a2e30]/40"
                          }`}
                        >
                          <span
                            className={`text-sm font-black w-6 shrink-0 ${isMe ? "text-[#13eca4]" : "text-slate-500"}`}
                          >
                            {rank}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">
                              {student.displayName ?? "Student"}
                              {isMe && (
                                <span className="ml-2 text-[10px] font-bold text-[#13eca4] bg-[#13eca4]/15 rounded-full px-2 py-0.5">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              Level {student.level ?? 1}
                            </p>
                          </div>
                          <span className="text-sm font-black w-24 text-right shrink-0">
                            {(student.xp ?? 0).toLocaleString()} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* My rank if not in top 20 */}
              {myRank === -1 && appUser && (
                <div className="p-4 bg-[#13eca4]/5 border border-[#13eca4]/20 rounded-xl text-sm text-slate-400">
                  Your rank will appear once you complete more challenges and earn XP.
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* School Spirit */}
          {schoolSpirit.length > 0 && (
            <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
                School Spirit
              </h3>
              <div className="space-y-4">
                {schoolSpirit.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-300">
                        {i === 0 && <span className="mr-1">🏆</span>}
                        {s.name}
                      </span>
                      <span className="text-slate-400">{s.pts.toLocaleString()} XP</span>
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
            </div>
          )}

          {/* My Position */}
          {appUser && (
            <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Your Position
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#13eca4]/20 border border-[#13eca4]/30 flex items-center justify-center text-[#13eca4] font-black text-lg">
                  {myRank >= 0 ? myRank + 1 : "—"}
                </div>
                <div>
                  <p className="font-bold text-white">{appUser.displayName}</p>
                  <p className="text-sm text-slate-400">
                    {(appUser.xp ?? 0).toLocaleString()} XP total
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Regional Map placeholder */}
          <div className="bg-[#0d1f1a] rounded-2xl border border-[rgba(19,236,164,0.1)] p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Regional Map
            </h3>
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

export default function HackathonLeaderboard() {
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
      <LeaderboardInner />
    </Suspense>
  );
}
