"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudentData } from "@/hooks/useStudentData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Challenge, ChallengeEnrollment } from "@/lib/types";

function useCountdown(targetMs: number | null) {
  const [remaining, setRemaining] = useState(targetMs ? Math.max(0, targetMs - Date.now()) : 0);
  useEffect(() => {
    if (!targetMs) return;
    const id = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const totalSec = Math.floor(remaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h, m, s, pad };
}

function getTimestamp(val: Date | { seconds: number } | null): number | null {
  if (!val) return null;
  if (val instanceof Date) return val.getTime();
  if (typeof (val as { seconds: number }).seconds === "number")
    return (val as { seconds: number }).seconds * 1000;
  return null;
}

function isLive(c: Challenge): boolean {
  const now = Date.now();
  const start = getTimestamp(c.startsAt);
  const end = getTimestamp(c.endsAt);
  return start !== null && end !== null && now >= start && now <= end;
}

function isUpcoming(c: Challenge): boolean {
  const start = getTimestamp(c.startsAt);
  return start !== null && Date.now() < start;
}

export default function StudentChallengesHub() {
  const { appUser } = useAuthContext();
  const { enrollments } = useStudentData();

  // Derive classroomIds from student's enrollments
  const classroomIds = [...new Set(enrollments.map((e) => e.classroomId))];

  // Fetch challenge enrollments for the student's classrooms
  const { data: challengeEnrolls } = useCollection<ChallengeEnrollment>(
    "challengeEnrollments",
    classroomIds.length > 0 ? [where("classroomId", "in", classroomIds.slice(0, 10))] : [],
    classroomIds.length > 0
  );

  // Get unique challengeIds the student has access to
  const challengeIds = [...new Set(challengeEnrolls.map((e) => e.challengeId))];

  // Fetch those challenges
  const { data: challenges, loading: challengesLoading } = useCollection<Challenge>(
    "challenges",
    challengeIds.length > 0 ? [where("__name__", "in", challengeIds.slice(0, 10))] : [],
    challengeIds.length > 0
  );

  const liveChallenges = challenges.filter(isLive);
  const upcomingChallenges = challenges.filter(isUpcoming);
  const heroChallenge = liveChallenges[0] ?? null;

  const heroEnd = heroChallenge ? getTimestamp(heroChallenge.endsAt) : null;
  const deadline = useCountdown(heroEnd);

  if (challengesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a1a16] text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">CHALLENGES HUB</h2>
            <p className="text-slate-400 max-w-lg text-sm">
              Conquer time-bound challenges, build high-impact solutions, and rise through the
              ranks.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#1a2e30] border border-[rgba(19,236,164,0.2)] rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#13eca4] text-lg">toll</span>
              <span className="font-bold text-[#13eca4]">
                {(appUser?.xp ?? 0).toLocaleString()} XP
              </span>
            </div>
            {heroChallenge && (
              <Link
                href={`/school/student/challenges/active?id=${heroChallenge.id}`}
                className="bg-[#13eca4] text-[#0d1f1a] font-bold px-6 py-2 rounded-xl hover:brightness-105 transition-all flex items-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Quick Start
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {challenges.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <span className="material-symbols-outlined text-[64px] mb-4 block">emoji_events</span>
              <p className="text-lg font-semibold">No challenges available yet.</p>
              <p className="text-sm mt-2">
                Your teacher will enroll your class in upcoming challenges.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8">
              {/* Left 8 cols */}
              <div className="col-span-12 xl:col-span-8 space-y-10">
                {/* Active / Live Challenges */}
                {liveChallenges.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">Active Challenges</h3>
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 animate-pulse uppercase tracking-tighter">
                          Live Now
                        </span>
                      </div>
                    </div>

                    {/* Hero Challenge Card */}
                    {heroChallenge && (
                      <div className="relative overflow-hidden rounded-2xl bg-[#1a2e30] border border-[rgba(19,236,164,0.3)] shadow-lg shadow-[rgba(19,236,164,0.1)]">
                        <div className="grid grid-cols-2">
                          <div className="p-8 flex flex-col justify-between">
                            <div>
                              <h4 className="text-3xl font-black text-white mb-3">
                                {heroChallenge.title}
                              </h4>
                              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                {heroChallenge.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs font-mono text-[#13eca4] mb-8">
                                <div className="flex items-center gap-1.5 bg-[#13eca4]/10 px-3 py-1.5 rounded-lg border border-[#13eca4]/20">
                                  <span className="material-symbols-outlined text-[16px]">
                                    category
                                  </span>
                                  {heroChallenge.theme}
                                </div>
                                <div className="flex items-center gap-1.5 bg-[#13eca4]/10 px-3 py-1.5 rounded-lg border border-[#13eca4]/20">
                                  <span className="material-symbols-outlined text-[16px]">
                                    {heroChallenge.scope === "school" ? "domain" : "public"}
                                  </span>
                                  {heroChallenge.scope === "school" ? "School" : "Global"}
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
                                  { v: deadline.pad(deadline.h), l: "Hrs" },
                                  { v: deadline.pad(deadline.m), l: "Min" },
                                  { v: deadline.pad(deadline.s), l: "Sec" },
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
                                href={`/school/student/challenges/active?id=${heroChallenge.id}`}
                                className="mt-4 w-full bg-[#13eca4] text-[#0a1a16] font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-sm"
                              >
                                JOIN CHALLENGE NOW
                                <span className="material-symbols-outlined">trending_flat</span>
                              </Link>
                            </div>
                          </div>

                          {/* Right visual */}
                          <div className="relative min-h-72 bg-linear-to-br from-[#13eca4]/20 via-[#0d2420] to-[#102022]">
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              <span
                                className="material-symbols-outlined text-[#13eca4]"
                                style={{ fontSize: "180px" }}
                              >
                                {heroChallenge.icon || "emoji_events"}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-linear-to-r from-[#1a2e30] via-transparent to-transparent" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other live challenges */}
                    {liveChallenges.slice(1).map((c) => (
                      <div
                        key={c.id}
                        className="mt-4 p-5 rounded-2xl bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#13eca4]">
                              {c.icon || "emoji_events"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-bold">{c.title}</p>
                            <p className="text-slate-500 text-xs">{c.theme}</p>
                          </div>
                        </div>
                        <Link
                          href={`/school/student/challenges/active?id=${c.id}`}
                          className="px-4 py-2 bg-[#13eca4] text-[#0d1f1a] rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                          Join
                        </Link>
                      </div>
                    ))}
                  </section>
                )}

                {/* Upcoming Challenges */}
                {upcomingChallenges.length > 0 && (
                  <section>
                    <h3 className="text-2xl font-bold mb-6">Upcoming Challenges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {upcomingChallenges.map((c) => {
                        const start = getTimestamp(c.startsAt);
                        const dateStr = start
                          ? new Date(start).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "--";
                        return (
                          <div
                            key={c.id}
                            className="relative group overflow-hidden rounded-2xl bg-[#1a2e30] border border-white/5 h-48 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                              <span
                                className="material-symbols-outlined text-white"
                                style={{ fontSize: "140px" }}
                              >
                                {c.icon || "emoji_events"}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-[#0d1f1a]/70" />
                            <div className="relative h-full p-5 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                  <span className="material-symbols-outlined text-white/50">
                                    lock
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono bg-white/10 text-white/60 px-2 py-1 rounded">
                                  START: {dateStr}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-white/40">{c.title}</h4>
                                <p className="text-sm text-slate-600">Locked until {dateStr}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {liveChallenges.length === 0 &&
                  upcomingChallenges.length === 0 &&
                  challenges.length > 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <span className="material-symbols-outlined text-[48px] mb-3 block">
                        emoji_events
                      </span>
                      <p>All challenges have ended. Check back soon for new ones!</p>
                    </div>
                  )}
              </div>

              {/* Right 4 cols: leaderboard placeholder */}
              <div className="col-span-12 xl:col-span-4 space-y-6">
                <div className="bg-[#1a2e30] rounded-2xl border border-[rgba(19,236,164,0.1)] overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#13eca4] text-lg">
                          stars
                        </span>
                        School Leaderboard
                      </h3>
                    </div>
                    <div className="text-center py-8 text-slate-500">
                      <span className="material-symbols-outlined text-[36px] mb-2 block">
                        leaderboard
                      </span>
                      <p className="text-sm">Rankings will appear once students submit entries.</p>
                    </div>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
