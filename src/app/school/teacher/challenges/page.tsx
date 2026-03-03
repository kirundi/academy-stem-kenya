"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";
import { useCollection, useCreateDoc, useUpdateDoc, useDeleteDoc } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Challenge, ChallengeEnrollment } from "@/lib/types";

function timeLabel(challenge: Challenge): string {
  const now = Date.now();
  const start =
    challenge.startsAt instanceof Date
      ? challenge.startsAt.getTime()
      : (challenge.startsAt as unknown as { seconds: number }).seconds * 1000;
  const end =
    challenge.endsAt instanceof Date
      ? challenge.endsAt.getTime()
      : (challenge.endsAt as unknown as { seconds: number }).seconds * 1000;

  if (now < start) {
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return `Opens in: ${diff} day${diff !== 1 ? "s" : ""}`;
  }
  if (now > end) return "Ended";
  const hoursLeft = Math.ceil((end - now) / (1000 * 60 * 60));
  if (hoursLeft < 24) return `Ends in: ${hoursLeft}h`;
  const daysLeft = Math.floor(hoursLeft / 24);
  const hours = hoursLeft % 24;
  return `Ends in: ${daysLeft}d ${hours}h`;
}

function isUpcoming(challenge: Challenge): boolean {
  const start =
    challenge.startsAt instanceof Date
      ? challenge.startsAt.getTime()
      : (challenge.startsAt as unknown as { seconds: number }).seconds * 1000;
  return Date.now() < start;
}

function isLive(challenge: Challenge): boolean {
  const now = Date.now();
  const start =
    challenge.startsAt instanceof Date
      ? challenge.startsAt.getTime()
      : (challenge.startsAt as unknown as { seconds: number }).seconds * 1000;
  const end =
    challenge.endsAt instanceof Date
      ? challenge.endsAt.getTime()
      : (challenge.endsAt as unknown as { seconds: number }).seconds * 1000;
  return now >= start && now <= end;
}

interface EnrollModalState {
  challengeId: string;
  challengeTitle: string;
}

export default function TeacherChallengesPage() {
  const { appUser } = useAuthContext();
  const { classrooms } = useTeacherData();

  const { data: challenges, loading: challengesLoading } = useCollection<Challenge>("challenges");

  const { data: myEnrollments, loading: enrollmentsLoading } = useCollection<ChallengeEnrollment>(
    "challengeEnrollments",
    appUser ? [where("enrolledBy", "==", appUser.uid)] : [],
    !!appUser
  );

  const { create: createEnrollment } = useCreateDoc("challengeEnrollments");
  const { update: updateEnrollment } = useUpdateDoc("challengeEnrollments");
  const { remove: removeEnrollment } = useDeleteDoc("challengeEnrollments");

  const [activeFilter, setActiveFilter] = useState("All Themes");
  const [enrollModal, setEnrollModal] = useState<EnrollModalState | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const loading = challengesLoading || enrollmentsLoading;

  // Build a map: challengeId → my enrollments for that challenge
  const enrollmentsByChallengeId = new Map<string, ChallengeEnrollment[]>();
  myEnrollments.forEach((e) => {
    if (!enrollmentsByChallengeId.has(e.challengeId))
      enrollmentsByChallengeId.set(e.challengeId, []);
    enrollmentsByChallengeId.get(e.challengeId)!.push(e);
  });

  // Collect all unique themes for filter pills
  const allThemes = Array.from(new Set(challenges.map((c) => c.theme).filter(Boolean)));
  const filters = ["All Themes", ...allThemes];

  const filtered =
    activeFilter === "All Themes" ? challenges : challenges.filter((c) => c.theme === activeFilter);

  const liveCount = challenges.filter(isLive).length;
  const upcomingCount = challenges.filter(isUpcoming).length;

  async function handleEnroll() {
    if (!enrollModal || !selectedClassroomId || !appUser) return;
    const classroom = classrooms.find((c) => c.id === selectedClassroomId);
    if (!classroom) return;
    setEnrolling(true);
    try {
      await createEnrollment({
        challengeId: enrollModal.challengeId,
        classroomId: selectedClassroomId,
        classroomName: classroom.name,
        enrolledBy: appUser.uid,
        lateAccess: false,
      });
      setEnrollModal(null);
      setSelectedClassroomId("");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleUnenroll(enrollmentId: string) {
    await removeEnrollment(enrollmentId);
  }

  async function toggleLateAccess(enrollmentId: string, current: boolean) {
    await updateEnrollment(enrollmentId, { lateAccess: !current });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a1a16] text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-[rgba(19,236,164,0.1)] flex items-center justify-between px-8 shrink-0 bg-[#0d1f1a]">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-bold">Teacher Challenge Manager</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-[#1a2e30] border border-[rgba(19,236,164,0.15)] rounded-lg text-sm w-56 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#13eca4]/50"
              placeholder="Find challenges..."
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Filters & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeFilter === f
                      ? "bg-[#13eca4]/20 text-[#13eca4] border-[#13eca4]/30"
                      : "bg-[#1a2e30] text-slate-400 border-slate-700 hover:border-[#13eca4]/30"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">{liveCount} Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="text-slate-400">{upcomingCount} Upcoming</span>
              </div>
            </div>
          </div>

          {/* Challenge Cards Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <span className="material-symbols-outlined text-[48px] mb-3 block">emoji_events</span>
              <p>No challenges available yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((c) => {
                const upcoming = isUpcoming(c);
                const live = isLive(c);
                const myEnrolls = enrollmentsByChallengeId.get(c.id) ?? [];
                const enrolled = myEnrolls.length > 0;

                return (
                  <div
                    key={c.id}
                    className={`bg-[#0d1f1a] border rounded-xl overflow-hidden transition-all group ${
                      enrolled
                        ? "border-[#13eca4]/40 shadow-lg shadow-[#13eca4]/5"
                        : upcoming
                          ? "border-slate-700/50 opacity-80"
                          : "border-[rgba(19,236,164,0.15)] hover:shadow-xl hover:shadow-[#13eca4]/5"
                    }`}
                  >
                    {/* Card header banner */}
                    <div className="h-28 bg-linear-to-br from-[#13eca4]/25 to-[#102022] relative">
                      {upcoming && <div className="absolute inset-0 bg-[#102022]/60 grayscale" />}
                      <div className="absolute inset-0 flex items-center justify-center opacity-15">
                        <span
                          className="material-symbols-outlined text-[#13eca4]"
                          style={{ fontSize: "80px" }}
                        >
                          {c.icon || "emoji_events"}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        {live && (
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Live
                          </span>
                        )}
                        {upcoming && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Upcoming
                          </span>
                        )}
                        {!live && !upcoming && (
                          <span className="bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            Ended
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            c.scope === "school"
                              ? "bg-[#13eca4] text-[#0d1f1a]"
                              : "bg-slate-700/80 text-white"
                          }`}
                        >
                          {c.scope === "school" ? "School" : "Global"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className={`font-bold text-base ${!upcoming ? "group-hover:text-[#13eca4] transition-colors" : ""}`}
                        >
                          {c.title}
                        </h3>
                        <span className="material-symbols-outlined text-[#13eca4] text-xl">
                          {c.icon || "emoji_events"}
                        </span>
                      </div>

                      {enrolled ? (
                        /* Management view for enrolled challenges */
                        <div className="bg-[#142a25] rounded-lg p-4 mb-4 space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                              Enrolled Classes
                            </span>
                          </div>
                          {myEnrolls.map((enr) => (
                            <div key={enr.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300">{enr.classroomName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">Late</span>
                                <button
                                  onClick={() => toggleLateAccess(enr.id, enr.lateAccess)}
                                  className={`w-8 h-4 rounded-full relative transition-colors ${enr.lateAccess ? "bg-[#13eca4]" : "bg-slate-600"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 size-3 bg-white rounded-full transition-transform ${enr.lateAccess ? "right-0.5" : "left-0.5"}`}
                                  />
                                </button>
                                <button
                                  onClick={() => handleUnenroll(enr.id)}
                                  className="text-red-400 hover:opacity-70 transition-opacity"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    close
                                  </span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        c.description && (
                          <p className="text-sm text-slate-400 mb-5 line-clamp-2">
                            {c.description}
                          </p>
                        )
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs border-t border-[rgba(19,236,164,0.08)] pt-3">
                          <span className="text-slate-500 italic">Theme: {c.theme}</span>
                          <span
                            className={`font-medium ${upcoming ? "text-amber-400" : live ? "text-white" : "text-slate-500"}`}
                          >
                            {timeLabel(c)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {enrolled ? (
                            <>
                              <button className="flex-1 bg-[#1a2e30] text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
                                View Student Work
                              </button>
                              <button
                                onClick={() =>
                                  setEnrollModal({ challengeId: c.id, challengeTitle: c.title })
                                }
                                className="px-3 border border-[rgba(19,236,164,0.2)] text-slate-400 rounded-lg hover:bg-[#142a25]"
                              >
                                <span className="material-symbols-outlined text-sm pt-1">add</span>
                              </button>
                            </>
                          ) : upcoming ? (
                            <button className="flex-1 bg-[#1a2e30] text-slate-500 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                              Not Yet Open
                            </button>
                          ) : live ? (
                            <>
                              <button
                                onClick={() =>
                                  setEnrollModal({
                                    challengeId: c.id,
                                    challengeTitle: c.title,
                                  })
                                }
                                className="flex-1 bg-[#13eca4] text-[#0d1f1a] py-2 rounded-lg text-sm font-bold hover:brightness-105 transition-all"
                              >
                                Enroll a Class
                              </button>
                              <button className="px-3 bg-[#1a2e30] text-slate-400 rounded-lg hover:bg-slate-700">
                                <span className="material-symbols-outlined text-sm pt-1">
                                  visibility
                                </span>
                              </button>
                            </>
                          ) : (
                            <button className="flex-1 bg-[#1a2e30] text-slate-500 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                              Challenge Ended
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Enrollments Table */}
          {myEnrollments.length > 0 && (
            <div className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.15)] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.08)] flex items-center justify-between">
                <h3 className="font-bold text-sm">My Challenge Enrollments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#142a25]/50 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                      {["Classroom", "Challenge", "Late Access", "Action"].map((h) => (
                        <th key={h} className="px-6 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(19,236,164,0.06)]">
                    {myEnrollments.map((e) => {
                      const challenge = challenges.find((c) => c.id === e.challengeId);
                      return (
                        <tr key={e.id}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">{e.classroomName}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {challenge?.title ?? e.challengeId}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleLateAccess(e.id, e.lateAccess)}
                              className={`w-10 h-5 rounded-full relative transition-colors ${e.lateAccess ? "bg-[#13eca4]" : "bg-slate-600"}`}
                            >
                              <div
                                className={`absolute top-0.5 size-4 bg-white rounded-full transition-transform ${e.lateAccess ? "right-0.5" : "left-0.5"}`}
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleUnenroll(e.id)}
                              className="text-red-400 text-xs font-bold hover:opacity-70 transition-opacity"
                            >
                              Unenroll
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enroll Class Modal */}
      {enrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-base">Enroll a Class</h2>
                <p className="text-slate-400 text-xs mt-0.5">{enrollModal.challengeTitle}</p>
              </div>
              <button
                onClick={() => {
                  setEnrollModal(null);
                  setSelectedClassroomId("");
                }}
                className="text-slate-500 hover:text-white"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {classrooms.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                No classrooms yet. Create one first.
              </p>
            ) : (
              <>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2.5 text-sm text-white mb-4 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                >
                  <option value="">Select a classroom…</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · Grade {c.grade}
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEnrollModal(null);
                      setSelectedClassroomId("");
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[rgba(255,255,255,0.06)] text-slate-300 hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedClassroomId || enrolling}
                    onClick={handleEnroll}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#13eca4] text-[#10221c] hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {enrolling ? "Enrolling…" : "Enroll"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
