"use client";

import StudentSidebar from "@/components/StudentSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import { where, orderBy } from "firebase/firestore";
import type { AppUser } from "@/lib/types";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function StudentLeaderboardPage() {
  const { appUser } = useAuthContext();

  const { data: students, loading } = useCollection<AppUser>(
    "users",
    appUser?.schoolId
      ? [
          where("schoolId", "==", appUser.schoolId),
          where("role", "==", "student"),
          orderBy("xp", "desc"),
        ]
      : [],
    !!appUser?.schoolId
  );

  const top50 = students.slice(0, 50);

  // Find current user's rank
  const myRank = students.findIndex((s) => s.uid === appUser?.uid) + 1;
  const myEntry = students.find((s) => s.uid === appUser?.uid);

  if (loading) {
    return (
      <div className="flex h-screen bg-(--bg-page)">
        <StudentSidebar />
        <main className="ml-60 flex-1 overflow-y-auto flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
            progress_activity
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <StudentSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.1)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Leaderboard</h1>
            <p className="text-slate-400 text-xs mt-0.5">Top students in your school</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(19,236,164,0.12)] border border-[rgba(19,236,164,0.2)]">
            <span className="material-symbols-outlined text-[#13eca4] text-[16px]">
              leaderboard
            </span>
            <span className="text-[#13eca4] text-xs font-semibold">{students.length} students</span>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {/* My rank card */}
          {myEntry && myRank > 0 && (
            <div className="p-5 bg-[rgba(19,236,164,0.08)] rounded-2xl border border-[rgba(19,236,164,0.25)] flex items-center gap-4">
              <div className="text-2xl font-black text-[#13eca4] w-10 text-center">
                {myRank <= 3 ? MEDAL[myRank] : `#${myRank}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#13eca4] to-[#0dd494] flex items-center justify-center text-[#10221c] font-bold text-sm shrink-0">
                {getInitials(myEntry.displayName ?? "Me")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-(--text-base) font-bold text-sm">{myEntry.displayName} (You)</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(19,236,164,0.15)", color: "#13eca4" }}
                  >
                    Level {myEntry.level ?? 1}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {(myEntry.xp ?? 0).toLocaleString()} XP
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-slate-400 text-xs">Your rank</p>
                <p className="text-[#13eca4] font-black text-xl">#{myRank}</p>
              </div>
            </div>
          )}

          {/* Leaderboard list */}
          {top50.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)]">
              <span className="material-symbols-outlined text-[64px] text-slate-600 mb-3">
                leaderboard
              </span>
              <p className="text-(--text-base) font-semibold mb-1">No students yet</p>
              <p className="text-slate-400 text-sm">
                Be the first to earn XP in your school!
              </p>
            </div>
          ) : (
            <div className="bg-(--bg-card) rounded-2xl border border-[rgba(19,236,164,0.08)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.08)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4] text-[20px]">stars</span>
                <h2 className="text-(--text-base) font-bold">Top 50 Students</h2>
                <span className="ml-auto text-xs text-slate-500">All Time</span>
              </div>

              <div className="divide-y divide-[rgba(255,255,255,0.03)]">
                {top50.map((student, idx) => {
                  const rank = idx + 1;
                  const isMe = student.uid === appUser?.uid;
                  const level = student.level ?? 1;
                  const xp = student.xp ?? 0;
                  const xpForNext = level * 1000;
                  const xpPct = xpForNext > 0 ? Math.min(100, Math.round((xp / xpForNext) * 100)) : 0;

                  return (
                    <div
                      key={student.uid}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                        isMe
                          ? "bg-[rgba(19,236,164,0.06)] border-l-2 border-[#13eca4]"
                          : "hover:bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-10 text-center shrink-0">
                        {rank <= 3 ? (
                          <span className="text-xl">{MEDAL[rank]}</span>
                        ) : (
                          <span className="text-slate-500 font-bold text-sm">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                        style={{
                          background: isMe
                            ? "linear-gradient(135deg, #13eca4, #0dd494)"
                            : "rgba(19,236,164,0.12)",
                          color: isMe ? "#10221c" : "#13eca4",
                        }}
                      >
                        {getInitials(student.displayName ?? "?")}
                      </div>

                      {/* Name + XP bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${isMe ? "text-[#13eca4]" : "text-(--text-base)"}`}>
                            {student.displayName}
                            {isMe && <span className="text-slate-400 font-normal ml-1">(You)</span>}
                          </p>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: "rgba(19,236,164,0.12)", color: "#13eca4" }}
                          >
                            Lv {level}
                          </span>
                        </div>
                        {/* XP bar */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${xpPct}%`,
                                background: isMe ? "#13eca4" : "rgba(19,236,164,0.4)",
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
