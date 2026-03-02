"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudentData } from "@/hooks/useStudentData";
import { useAuthContext } from "@/contexts/AuthContext";
import StudentSidebar from "@/components/StudentSidebar";

const TROPHY_CASE = [
  {
    icon: "rocket_launch",
    color: "text-yellow-400",
    border: "border-primary/30 hover:border-primary",
    glow: "bg-yellow-400/10",
    bg: "from-yellow-400/10 to-transparent",
    rarity: "Legendary",
    rarityClass: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    name: "Mars Pioneer",
    desc: "Global Top 1% Achievement",
  },
  {
    icon: "terminal",
    color: "text-slate-300",
    border: "border-border-dark hover:border-slate-400",
    glow: "bg-slate-400/10",
    bg: "from-slate-400/10 to-transparent",
    rarity: "Epic",
    rarityClass: "bg-slate-400/10 text-slate-300 border-slate-400/20",
    name: "Algorithm Architect",
    desc: "Completed Python Masterclass",
  },
  {
    icon: "precision_manufacturing",
    color: "text-orange-400",
    border: "border-border-dark hover:border-orange-900/50",
    glow: "bg-orange-900/10",
    bg: "from-orange-900/10 to-transparent",
    rarity: "Rare",
    rarityClass: "bg-orange-900/20 text-orange-400 border-orange-900/30",
    name: "Circuit Wizard",
    desc: "Advanced Robotics Finalist",
  },
];

const PROJECT_BADGES = [
  {
    icon: "biotech",
    color: "text-primary",
    glow: "bg-primary/20",
    label: "DNA Profiler",
    sub: "Intro to Genetics",
  },
  {
    icon: "memory",
    color: "text-[#ef4444]",
    glow: "bg-[#ef4444]/20",
    label: "Logic Gate",
    sub: "Hardware Fundamentals",
  },
  {
    icon: "satellite_alt",
    color: "text-blue-400",
    glow: "bg-blue-400/20",
    label: "Orbit Planner",
    sub: "Space Systems",
  },
  {
    icon: "science",
    color: "text-green-400",
    glow: "bg-green-400/20",
    label: "Lab Master",
    sub: "Chemistry 101",
  },
  {
    icon: "hub",
    color: "text-purple-400",
    glow: "bg-purple-400/20",
    label: "Network Ninja",
    sub: "CS Fundamentals",
  },
  {
    icon: "calculate",
    color: "text-amber-400",
    glow: "bg-amber-400/20",
    label: "Math Wizard",
    sub: "Advanced Algebra",
  },
  {
    icon: "eco",
    color: "text-emerald-400",
    glow: "bg-emerald-400/20",
    label: "Eco Hacker",
    sub: "Environmental Science",
  },
  {
    icon: "draw",
    color: "text-pink-400",
    glow: "bg-pink-400/20",
    label: "Design Thinker",
    sub: "UX Principles",
  },
];

const SKILL_MILESTONES = [
  {
    icon: "code",
    label: "Coding Apprentice",
    desc: "Completed 5 coding challenges",
    progress: 100,
    color: "#13eca4",
  },
  {
    icon: "psychology",
    label: "Critical Thinker",
    desc: "Solved 10 logic puzzles",
    progress: 80,
    color: "#3b82f6",
  },
  {
    icon: "construction",
    label: "Builder Level 2",
    desc: "Built 3 hardware projects",
    progress: 60,
    color: "#f59e0b",
  },
  {
    icon: "science",
    label: "Lab Technician",
    desc: "Conducted 5 experiments",
    progress: 40,
    color: "#10b981",
  },
];

type Tab = "gallery" | "milestones" | "overview";

export default function StudentAchievementsPage() {
  useAuthContext();
  const { earnedBadges, lockedBadges, loading } = useStudentData();
  const [activeTab, setActiveTab] = useState<Tab>("gallery");
  const [selectedBadge, setSelectedBadge] = useState<(typeof PROJECT_BADGES)[0] | null>(null);

  const total = earnedBadges.length + lockedBadges.length;
  const collected = earnedBadges.length;
  const collectedPct = total > 0 ? Math.round((collected / total) * 100) : 60;

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
                        {collected}/{Math.max(total, 40)}
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
                      <span className="text-[#ef4444]">3/5</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#102022] rounded-full">
                      <div className="h-full bg-[#ef4444] rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Skill Milestones</span>
                      <span className="text-amber-400">
                        {SKILL_MILESTONES.filter((m) => m.progress === 100).length}/
                        {SKILL_MILESTONES.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#102022] rounded-full">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${Math.round((SKILL_MILESTONES.filter((m) => m.progress === 100).length / SKILL_MILESTONES.length) * 100)}%`,
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {TROPHY_CASE.map((trophy) => (
                  <div
                    key={trophy.name}
                    className={`relative p-6 bg-[#1a2e30] border-2 ${trophy.border} rounded-2xl overflow-hidden group cursor-pointer transition-all`}
                  >
                    <div
                      className={`absolute -top-4 -right-4 w-24 h-24 ${trophy.glow} blur-2xl opacity-10 group-hover:opacity-30 transition-opacity`}
                    />
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 mb-4 bg-[#102022] rounded-full flex items-center justify-center border border-[#2d4548] shadow-2xl group-hover:scale-110 transition-transform">
                        <span className={`material-symbols-outlined text-5xl ${trophy.color}`}>
                          {trophy.icon}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-100">{trophy.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{trophy.desc}</p>
                      <div
                        className={`mt-4 px-3 py-1 text-[10px] font-bold rounded-full border uppercase ${trophy.rarityClass}`}
                      >
                        {trophy.rarity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <button className="text-[#13daec] text-sm font-bold flex items-center gap-1 hover:underline">
                    Filter <span className="material-symbols-outlined text-sm">filter_list</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {PROJECT_BADGES.map((badge) => (
                    <div
                      key={badge.label}
                      onClick={() => setSelectedBadge(badge)}
                      className="group relative flex flex-col items-center text-center bg-[#1a2e30] border border-[#2d4548] p-5 rounded-2xl hover:bg-[#1a2e30]/80 transition-all cursor-pointer"
                    >
                      <div className="relative w-28 h-28 mb-4">
                        <div
                          className={`absolute inset-0 ${badge.glow} blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}
                        />
                        <div className="relative w-full h-full bg-[#102022] border border-[#2d4548] rounded-2xl flex items-center justify-center shadow-lg group-hover:-translate-y-2 transition-transform duration-300">
                          <span className={`material-symbols-outlined text-5xl ${badge.color}`}>
                            {badge.icon}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">{badge.label}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">
                        {badge.sub}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Locked placeholders */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-slate-600 text-xl">lock</span>
                    <h4 className="text-base font-bold text-slate-400">Locked Achievements</h4>
                    <span className="ml-2 text-xs text-slate-500">
                      ({Math.max(lockedBadges.length, 12)} remaining)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {Array.from({ length: Math.min(4, lockedBadges.length || 4) }).map((_, i) => (
                      <div
                        key={i}
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
              </section>
            )}

            {/* Skill Milestones */}
            {(activeTab === "milestones" || activeTab === "overview") && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-[#13daec]">stars</span>
                  <h2 className="text-xl font-bold text-slate-100">Skill Milestones</h2>
                </div>
                <div className="space-y-4">
                  {SKILL_MILESTONES.map((m) => (
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
                      {m.progress === 100 && (
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
              <span className={`material-symbols-outlined text-5xl ${selectedBadge.color}`}>
                {selectedBadge.icon}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{selectedBadge.label}</h3>
            <p className="text-sm text-slate-400 mb-6">{selectedBadge.sub}</p>
            <div className="p-4 bg-[#102022] rounded-xl text-left space-y-2 mb-6">
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-200">Category:</span> Project Badge
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-200">Rarity:</span> Common
              </p>
              <p className="text-xs text-slate-400">
                <span className="font-bold text-slate-200">Earned:</span> Course Completion
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
