"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuthContext } from "@/contexts/AuthContext";
import StudentSidebar from "@/components/StudentSidebar";
import type { Badge } from "@/lib/types";

const rarityOrder: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };

const rarityStyle: Record<
  string,
  { color: string; border: string; glow: string; rarityClass: string }
> = {
  legendary: {
    color: "text-yellow-400",
    border: "border-yellow-400/30 hover:border-yellow-400",
    glow: "bg-yellow-400/10",
    rarityClass: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  },
  epic: {
    color: "text-purple-400",
    border: "border-purple-400/30 hover:border-purple-400",
    glow: "bg-purple-400/10",
    rarityClass: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  },
  rare: {
    color: "text-blue-400",
    border: "border-blue-400/30 hover:border-blue-400",
    glow: "bg-blue-400/10",
    rarityClass: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  },
  common: {
    color: "text-slate-300",
    border: "border-[#2d4548] hover:border-slate-400",
    glow: "bg-slate-400/10",
    rarityClass: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  },
};

const skillIconMap: Record<string, { icon: string; color: string }> = {
  coding: { icon: "code", color: "#13eca4" },
  programming: { icon: "code", color: "#13eca4" },
  mathematics: { icon: "calculate", color: "#3b82f6" },
  math: { icon: "calculate", color: "#3b82f6" },
  science: { icon: "science", color: "#10b981" },
  engineering: { icon: "construction", color: "#f59e0b" },
  design: { icon: "draw", color: "#ec4899" },
  robotics: { icon: "precision_manufacturing", color: "#06b6d4" },
  biology: { icon: "biotech", color: "#34d399" },
  physics: { icon: "bolt", color: "#fbbf24" },
  chemistry: { icon: "science", color: "#a78bfa" },
  data: { icon: "bar_chart", color: "#60a5fa" },
};

type Tab = "gallery" | "milestones" | "overview";

export default function StudentAchievementsPage() {
  const { appUser } = useAuthContext();
  const { earnedBadges, lockedBadges, loading } = useStudentData();
  const [activeTab, setActiveTab] = useState<Tab>("gallery");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Trophy case: top 3 earned badges sorted by rarity
  const trophyCase = [...earnedBadges]
    .sort((a, b) => (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0))
    .slice(0, 3);

  // Skill milestones from real appUser.skills
  const skillMilestones = Object.entries(appUser?.skills ?? {}).map(([key, value]) => {
    const style = skillIconMap[key.toLowerCase()] ?? { icon: "psychology", color: "#8b5cf6" };
    return {
      icon: style.icon,
      color: style.color,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      desc: `${value} skill points earned`,
      progress: Math.min(100, Math.round(value)),
    };
  });

  const total = earnedBadges.length + lockedBadges.length;
  const collected = earnedBadges.length;
  const collectedPct = total > 0 ? Math.round((collected / total) * 100) : 0;

  const rareEarned = earnedBadges.filter(
    (b) => b.rarity === "legendary" || b.rarity === "epic"
  ).length;
  const rareTotal = [...earnedBadges, ...lockedBadges].filter(
    (b) => b.rarity === "legendary" || b.rarity === "epic"
  ).length;

  const milestonesCompleted = skillMilestones.filter((m) => m.progress >= 100).length;

  if (loading) {
    return (
      <div className="flex h-screen bg-[#10221c]">
        <StudentSidebar />
        <main className="ml-60 flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
            progress_activity
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#102022] overflow-hidden">
      <StudentSidebar />

      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,32,34,0.85)] backdrop-blur-md border-b border-[rgba(19,218,236,0.1)] px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Achievement Gallery</h1>
            <p className="text-slate-400 text-xs">
              Your collected trophies, badges, and skill milestones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-[#1a2e30] rounded-lg px-3 py-1.5 border border-[#2d4548]">
              <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder:text-slate-500 w-44 ml-2 outline-none"
                placeholder="Search achievements..."
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
          {/* Left sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <nav className="flex flex-col gap-1 p-2 bg-[#1a2e30] border border-[#2d4548] rounded-xl">
                {(["overview", "gallery", "milestones"] as Tab[]).map((tab) => {
                  const config = {
                    overview: { icon: "person", label: "Profile Overview" },
                    gallery: { icon: "military_tech", label: "Achievement Gallery" },
                    milestones: { icon: "stars", label: "Skill Milestones" },
                  }[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-all text-left ${
                        activeTab === tab
                          ? "bg-[rgba(19,218,236,0.1)] text-[#13daec]"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="material-symbols-outlined">{config.icon}</span>
                      {config.label}
                    </button>
                  );
                })}
                <Link
                  href="/school/student/settings"
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg font-medium transition-all"
                >
                  <span className="material-symbols-outlined">settings</span>
                  Settings
                </Link>
              </nav>

              {/* Gallery Progress */}
              <div className="p-5 bg-[#1a2e30]/50 border border-[#2d4548] rounded-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Gallery Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Badges Collected</span>
                      <span className="text-[#13daec]">
                        {collected}/{Math.max(total, 1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#102022] rounded-full">
                      <div
                        className="h-full bg-[#13daec] rounded-full transition-all"
                        style={{ width: `${collectedPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Rare Achievements</span>
                      <span className="text-[#ef4444]">
                        {rareEarned}/{Math.max(rareTotal, 1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#102022] rounded-full">
                      <div
                        className="h-full bg-[#ef4444] rounded-full"
                        style={{
                          width:
                            rareTotal > 0 ? `${Math.round((rareEarned / rareTotal) * 100)}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Skill Milestones</span>
                      <span className="text-amber-400">
                        {milestonesCompleted}/{Math.max(skillMilestones.length, 1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#102022] rounded-full">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width:
                            skillMilestones.length > 0
                              ? `${Math.round((milestonesCompleted / skillMilestones.length) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-10">
            {/* Trophy Case */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-[#13daec]">emoji_events</span>
                <h2 className="text-2xl font-bold text-slate-100">Trophy Case</h2>
                <span className="ml-auto text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Top 3 Rarest
                </span>
              </div>
              {trophyCase.length === 0 ? (
                <div className="bg-[#1a2e30] border border-[#2d4548] rounded-2xl p-10 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block">
                    emoji_events
                  </span>
                  <p className="text-sm">Earn badges to fill your trophy case!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {trophyCase.map((trophy) => {
                    const style = rarityStyle[trophy.rarity] ?? rarityStyle.common;
                    return (
                      <div
                        key={trophy.id}
                        className={`relative p-6 bg-[#1a2e30] border-2 ${style.border} rounded-2xl overflow-hidden group cursor-pointer transition-all`}
                      >
                        <div
                          className={`absolute -top-4 -right-4 w-24 h-24 ${style.glow} blur-2xl opacity-10 group-hover:opacity-30 transition-opacity`}
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="w-24 h-24 mb-4 bg-[#102022] rounded-full flex items-center justify-center border border-[#2d4548] shadow-2xl group-hover:scale-110 transition-transform">
                            <span className={`material-symbols-outlined text-5xl ${style.color}`}>
                              {trophy.icon}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-100">{trophy.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{trophy.requirement}</p>
                          <div
                            className={`mt-4 px-3 py-1 text-[10px] font-bold rounded-full border uppercase ${style.rarityClass}`}
                          >
                            {trophy.rarity}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Placeholders if fewer than 3 earned */}
                  {Array.from({ length: Math.max(0, 3 - trophyCase.length) }).map((_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="relative p-6 bg-[#1a2e30]/50 border-2 border-dashed border-[#2d4548] rounded-2xl flex flex-col items-center justify-center text-center opacity-40"
                    >
                      <div className="w-24 h-24 mb-4 bg-[#102022] rounded-full flex items-center justify-center border border-[#2d4548]">
                        <span className="material-symbols-outlined text-5xl text-slate-600">
                          lock
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-500">???</p>
                      <p className="text-xs text-slate-600 mt-1">Earn more badges</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Project Badges */}
            {(activeTab === "gallery" || activeTab === "overview") && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Project Badges</h3>
                    <p className="text-sm text-slate-400">
                      Earned for completing specific courses and projects
                    </p>
                  </div>
                </div>

                {earnedBadges.length === 0 ? (
                  <div className="bg-[#1a2e30]/50 border border-dashed border-[#2d4548] rounded-2xl p-10 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 block">
                      military_tech
                    </span>
                    <p className="text-sm">Complete courses to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {earnedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadge(badge)}
                        className="group relative flex flex-col items-center text-center bg-[#1a2e30] border border-[#2d4548] p-5 rounded-2xl hover:bg-[#1a2e30]/80 transition-all cursor-pointer"
                      >
                        <div className="relative w-28 h-28 mb-4">
                          <div
                            className="absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: `${badge.color}40` }}
                          />
                          <div className="relative w-full h-full bg-[#102022] border border-[#2d4548] rounded-2xl flex items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform duration-300">
                            <span
                              className="material-symbols-outlined text-5xl"
                              style={{ color: badge.color }}
                            >
                              {badge.icon}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">{badge.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">
                          {badge.rarity}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Locked placeholders */}
                {lockedBadges.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-slate-600 text-xl">lock</span>
                      <h4 className="text-base font-bold text-slate-400">Locked Achievements</h4>
                      <span className="ml-2 text-xs text-slate-500">
                        ({lockedBadges.length} remaining)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      {lockedBadges.slice(0, 4).map((badge) => (
                        <div
                          key={badge.id}
                          className="flex flex-col items-center text-center bg-[#1a2e30]/50 border border-[#2d4548]/50 p-5 rounded-2xl opacity-40"
                        >
                          <div className="w-28 h-28 mb-4 bg-[#102022]/50 border border-[#2d4548]/50 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-600">
                              lock
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-500">???</p>
                          <p className="text-[10px] text-slate-600 uppercase font-bold mt-1">
                            Locked
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Skill Milestones */}
            {(activeTab === "milestones" || activeTab === "overview") && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#13daec]">stars</span>
                  <h2 className="text-xl font-bold text-slate-100">Skill Milestones</h2>
                </div>
                {skillMilestones.length === 0 ? (
                  <div className="bg-[#1a2e30]/50 border border-dashed border-[#2d4548] rounded-xl p-10 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 block">stars</span>
                    <p className="text-sm">Complete lessons to unlock skill milestones!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skillMilestones.map((m) => (
                      <div
                        key={m.label}
                        className="p-5 bg-[#1a2e30] border border-[#2d4548] rounded-xl flex items-center gap-5"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${m.color}15` }}
                        >
                          <span
                            className="material-symbols-outlined text-2xl"
                            style={{ color: m.color }}
                          >
                            {m.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-sm font-bold text-slate-100">{m.label}</h4>
                            <span className="text-xs font-bold" style={{ color: m.color }}>
                              {m.progress}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{m.desc}</p>
                          <div className="w-full h-1.5 bg-[#102022] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${m.progress}%`, background: m.color }}
                            />
                          </div>
                        </div>
                        {m.progress >= 100 && (
                          <span
                            className="material-symbols-outlined text-[#13daec] shrink-0"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,32,34,0.9)]"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-[#1a2e30] border border-[#2d4548] rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-[#102022] border border-[#2d4548] rounded-2xl flex items-center justify-center">
              <span
                className="material-symbols-outlined text-5xl"
                style={{ color: selectedBadge.color }}
              >
                {selectedBadge.icon}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{selectedBadge.name}</h3>
            <p className="text-sm text-slate-400 mb-6">{selectedBadge.requirement}</p>
            <div className="p-4 bg-[#102022] rounded-xl text-left space-y-2 mb-6">
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-200">Category:</span> Project Badge
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-200">Rarity:</span>{" "}
                <span className="capitalize">{selectedBadge.rarity}</span>
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-200">XP Value:</span> {selectedBadge.xpValue}{" "}
                XP
              </p>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 bg-[#13daec] text-[#102022] font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
