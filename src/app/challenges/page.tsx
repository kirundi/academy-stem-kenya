"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Challenge } from "@/lib/types";

// Map Firestore theme → visual styling
const THEME_META: Record<string, { categoryColor: string; bgGradient: string }> = {
  sustainability: {
    categoryColor: "bg-emerald-500 text-(--text-base)",
    bgGradient: "from-emerald-900/60 to-[#102022]",
  },
  robotics: {
    categoryColor: "bg-[#13daec] text-[#102022]",
    bgGradient: "from-[#13daec]/20 to-[#102022]",
  },
  "healthcare ai": {
    categoryColor: "bg-violet-500 text-(--text-base)",
    bgGradient: "from-violet-900/40 to-[#102022]",
  },
  "data science": {
    categoryColor: "bg-amber-500 text-[#102022]",
    bgGradient: "from-amber-900/40 to-[#102022]",
  },
  default: {
    categoryColor: "bg-slate-600 text-(--text-base)",
    bgGradient: "from-slate-900/40 to-[#102022]",
  },
};

function getThemeMeta(theme: string) {
  return THEME_META[theme.toLowerCase()] ?? THEME_META.default;
}

function getTimestampMs(val: unknown): number {
  if (!val) return 0;
  if (val instanceof Date) return val.getTime();
  if (typeof val === "object" && val !== null && "seconds" in val) {
    return (val as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function getChallengeStatus(challenge: Challenge): "upcoming" | "live" | "ended" {
  const now = Date.now();
  const startMs = getTimestampMs(challenge.startsAt);
  const endMs = getTimestampMs(challenge.endsAt);
  if (endMs && now > endMs) return "ended";
  if (startMs && now >= startMs) return "live";
  return "upcoming";
}

interface Winner {
  name: string;
  school: string;
  project: string;
  award: string;
  initials: string;
  color: string;
}

const WINNERS: Winner[] = [
  {
    name: "Alex Rivera",
    school: "Tech Academy Prep",
    project: "SolarSense Irrigation",
    award: "2023 Champion",
    initials: "AR",
    color: "#13daec",
  },
  {
    name: "Sarah Chen",
    school: "Global STEM High",
    project: "MediBot Assistant",
    award: "Health Innovator",
    initials: "SC",
    color: "#a78bfa",
  },
  {
    name: "Marcus Thorne",
    school: "Metro Tech Institute",
    project: "Aero-Drone Mapping",
    award: "Data Excellence",
    initials: "MT",
    color: "#f59e0b",
  },
  {
    name: "Elena Sokolov",
    school: "West Side Science",
    project: "RecycleAI Sort",
    award: "Sustainability Pro",
    initials: "ES",
    color: "#34d399",
  },
];

function useCountdown(targetMs: number) {
  const calc = () => {
    const diff = Math.max(0, targetMs - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });
  return time;
}

function ChallengeCard({ challenge }: { challenge: Challenge & { id: string } }) {
  const status = getChallengeStatus(challenge);
  const { categoryColor, bgGradient } = getThemeMeta(challenge.theme);

  // Count down to endsAt when live, to startsAt when upcoming
  const targetMs =
    status === "live" ? getTimestampMs(challenge.endsAt) : getTimestampMs(challenge.startsAt);
  const { days, hours, minutes } = useCountdown(targetMs);

  const countdownLabel = status === "live" ? "Ends in" : status === "ended" ? "Ended" : "Starts in";

  return (
    <div className="group flex flex-col bg-(--bg-card) rounded-2xl overflow-hidden border border-(--border) hover:border-[#13daec]/50 transition-all shadow-xl">
      {/* Card header gradient */}
      <div
        className={`relative h-44 bg-linear-to-br ${bgGradient} flex items-center justify-center overflow-hidden`}
      >
        <span className="material-symbols-outlined text-[80px] text-[#13daec]/20 group-hover:text-[#13daec]/30 transition-all">
          {challenge.icon || "bolt"}
        </span>
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColor}`}
        >
          {challenge.theme}
        </span>
        {status === "live" && (
          <span className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-full text-[10px] font-bold uppercase">
            <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
            Live
          </span>
        )}
        {status === "ended" && (
          <span className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-slate-500/20 border border-slate-500/40 text-(--text-muted) rounded-full text-[10px] font-bold uppercase">
            Ended
          </span>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
        <div>
          {/* Countdown */}
          <div className="flex items-center gap-2 text-[#13daec] mb-3">
            <span className="material-symbols-outlined text-sm">timer</span>
            <p className="text-xs font-bold uppercase tracking-widest">
              {status === "ended"
                ? "Challenge ended"
                : `${countdownLabel}: ${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`}
            </p>
          </div>
          <h3 className="text-xl font-bold text-(--text-base) mb-2">{challenge.title}</h3>
          <p className="text-(--text-muted) text-sm leading-relaxed">{challenge.description}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/challenges/${challenge.id}`}
            className="flex-1 rounded-lg h-10 border border-(--border) text-(--text-muted) text-sm font-bold flex items-center justify-center hover:border-[#13daec] hover:text-[#13daec] transition-all"
          >
            View Brief
          </Link>
          {status !== "ended" && (
            <Link
              href={`/challenges/${challenge.id}#enroll`}
              className="flex-1 rounded-lg h-10 bg-[#13daec] text-[#102022] text-sm font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-base">group_add</span>
              Register Team
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: challenges, loading } = useCollection<Challenge>("challenges", [
    where("scope", "==", "global"),
  ]);

  const filters = [
    { val: "all", label: "All" },
    { val: "upcoming", label: "Upcoming" },
    { val: "live", label: "Live Now" },
    { val: "robotics", label: "Robotics" },
    { val: "sustainability", label: "Sustainability" },
  ];

  const filteredChallenges = challenges.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "live") return getChallengeStatus(c) === "live";
    if (activeFilter === "upcoming") return getChallengeStatus(c) === "upcoming";
    return c.theme.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-base) antialiased overflow-x-hidden">
      <PublicNavbar />

      <main>
        {/* ── Hero ── */}
        <section className="relative h-130 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[#102022] via-[#0d1f22] to-[#13daec]/15" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(19,218,236,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(19,218,236,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-20 left-1/4 size-72 bg-[#13daec]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 size-56 bg-violet-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#13daec]/10 border border-[#13daec]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#13daec] mb-6">
              <span className="material-symbols-outlined text-sm">bolt</span>
              High-Stakes STEM Competition
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tighter mb-6 text-(--text-base)">
              Explore Our <span className="text-[#13daec]">Hackathons</span>
            </h1>
            <p className="text-(--text-muted) text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Empowering the next generation of innovators through high-energy STEM challenges and
              competitive coding. Build, compete, and change the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#challenges"
                className="rounded-xl h-14 px-8 bg-[#13daec] text-[#102022] text-base font-black hover:shadow-[0_0_24px_rgba(19,218,236,0.4)] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">rocket_launch</span>
                View All Challenges
              </a>
              <Link
                href="/about"
                className="rounded-xl h-14 px-8 border-2 border-[#13daec]/50 text-[#13daec] text-base font-black hover:bg-[#13daec]/10 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">school</span>
                School Partnership
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <div className="bg-(--bg-card) border-y border-(--border)">
          <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#2d4548]">
            {[
              { value: "142+", label: "Schools Competing", icon: "domain" },
              { value: "6,400+", label: "Student Participants", icon: "groups" },
              { value: "$12k", label: "Total Prize Pool", icon: "emoji_events" },
              { value: "48h", label: "Hacking Window", icon: "timer" },
            ].map(({ value, label, icon }) => (
              <div key={label} className="px-6 first:pl-0 last:pr-0 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#13daec] text-2xl">{icon}</span>
                <div>
                  <p className="text-xl font-black text-(--text-base)">{value}</p>
                  <p className="text-xs text-(--text-faint)">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active & Upcoming Challenges ── */}
        <section id="challenges" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-(--text-base)">
                Active &amp; Upcoming Challenges
              </h2>
              <div className="h-1 w-20 bg-[#13daec] mt-3" />
            </div>
            <a
              href="#schedule"
              className="text-[#13daec] font-bold flex items-center gap-1 text-sm hover:underline"
            >
              View Schedule{" "}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f.val}
                onClick={() => setActiveFilter(f.val)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                  activeFilter === f.val
                    ? "bg-[#13daec] text-[#102022] border-[#13daec]"
                    : "border-(--border) text-(--text-muted) hover:border-[#13daec] hover:text-[#13daec]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <span className="material-symbols-outlined animate-spin text-4xl text-[#13daec]">
                progress_activity
              </span>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-(--text-faint)">
              <span className="material-symbols-outlined text-5xl">search_off</span>
              <p className="text-sm">No challenges found for this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredChallenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          )}
        </section>

        {/* ── How Challenges Work ── */}
        <section className="py-24 bg-(--bg-page)">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-(--text-base) mb-4">
                How Challenges Work
              </h2>
              <p className="text-(--text-muted) max-w-lg mx-auto">
                Your journey from registration to winning. Follow these three critical stages.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16">
              {/* Connector line */}
              <div className="hidden md:block absolute top-9.5 left-[20%] right-[20%] h-px bg-[#13daec]/20 z-0" />

              {[
                {
                  icon: "schedule",
                  step: "01",
                  title: "Countdown to Start",
                  desc: "Register your school and form teams. Access pre-event resources and set up your dev environment before the timer hits zero.",
                },
                {
                  icon: "code_blocks",
                  step: "02",
                  title: "Timed Hacking",
                  desc: "A 48-hour intensive window to build your project. Access mentors and attend live technical workshops during the challenge.",
                },
                {
                  icon: "verified",
                  step: "03",
                  title: "Submission & Jury",
                  desc: "Submit your demo and source code. Industry experts evaluate projects based on innovation, technical depth, and impact.",
                },
              ].map(({ icon, step, title, desc }) => (
                <div
                  key={step}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="relative">
                    <div className="size-20 bg-(--bg-page) border-4 border-[#13daec]/20 group-hover:border-[#13daec] flex items-center justify-center rounded-full mb-5 transition-all shadow-[0_0_20px_rgba(19,218,236,0.08)] group-hover:shadow-[0_0_24px_rgba(19,218,236,0.25)]">
                      <span className="material-symbols-outlined text-[#13daec] text-4xl">
                        {icon}
                      </span>
                    </div>
                    <span className="absolute -top-2 -right-2 size-6 rounded-full bg-[#13daec] text-[#102022] text-[10px] font-black flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-(--text-base) mb-3">{title}</h3>
                  <p className="text-(--text-muted) text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Courses vs Challenges comparison */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-(--bg-page) border border-(--border)">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-(--text-muted) text-2xl">
                    menu_book
                  </span>
                  <h4 className="font-bold text-(--text-base) text-lg">Standard Courses</h4>
                </div>
                <ul className="space-y-2 text-sm text-(--text-muted)">
                  {[
                    "Self-paced learning modules",
                    "Weekly assignments & quizzes",
                    "Guided curriculum with mentors",
                    "Certificate on completion",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-(--text-faint) text-base">
                        remove
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#13daec]/5 border border-[#13daec]/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#13daec] text-2xl">bolt</span>
                  <h4 className="font-bold text-(--text-base) text-lg">Hackathon Challenges</h4>
                </div>
                <ul className="space-y-2 text-sm text-(--text-muted)">
                  {[
                    "Live countdown & time pressure",
                    "Real-world problem prompts",
                    "Compete against peer schools",
                    "Cash prizes + Hall of Fame glory",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#13daec] text-base">
                        check_circle
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Hall of Fame ── */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-(--text-base) mb-4 flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[#13daec] text-4xl">
                workspace_premium
              </span>
              Hall of Fame
            </h2>
            <p className="text-(--text-muted) max-w-lg mx-auto">
              Celebrating our past champions and their groundbreaking projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WINNERS.map((winner) => (
              <div
                key={winner.name}
                className="bg-(--bg-card) p-6 rounded-2xl border border-(--border) hover:border-[#13daec]/40 flex flex-col items-center text-center relative overflow-hidden group transition-all"
              >
                {/* Glow orb */}
                <div className="absolute -top-4 -right-4 size-20 bg-[#13daec]/10 rounded-full blur-2xl group-hover:bg-[#13daec]/20 transition-all" />

                {/* Avatar */}
                <div
                  className="size-20 rounded-full flex items-center justify-center text-2xl font-black mb-4 border-2 p-0.5"
                  style={{ borderColor: winner.color, background: `${winner.color}18` }}
                >
                  <span style={{ color: winner.color }}>{winner.initials}</span>
                </div>

                <h4 className="font-bold text-lg text-(--text-base) mb-0.5">{winner.name}</h4>
                <p className="text-[#13daec] text-xs font-bold uppercase tracking-widest mb-4">
                  {winner.school}
                </p>

                <div className="bg-(--bg-page) w-full py-3 rounded-lg mb-4 px-3">
                  <p className="text-(--text-muted) text-xs italic">&quot;{winner.project}&quot;</p>
                </div>

                <div className="flex items-center gap-1.5" style={{ color: winner.color }}>
                  <span className="material-symbols-outlined text-lg">military_tech</span>
                  <span className="text-xs font-bold">{winner.award}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#13daec] font-bold hover:underline text-sm"
            >
              View full leaderboard{" "}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="py-20 bg-[#13daec] px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#102022] text-4xl md:text-5xl font-black mb-6">
              Bring the Challenge to Your School
            </h2>
            <p className="text-[#102022]/75 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
              Partner with STEM Impact Academy to host exclusive hackathons, access our competition
              platform, and give your students a global stage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register/teacher"
                className="bg-(--bg-page) text-(--text-base) rounded-xl h-14 px-10 font-bold text-base hover:bg-(--bg-card) transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">school</span>
                School Registration
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border-2 border-[#102022] text-[#102022] rounded-xl h-14 px-10 font-bold text-base hover:bg-(--bg-page) hover:text-(--text-base) transition-all flex items-center justify-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-(--bg-page) border-t border-(--border) py-14 px-6 md:px-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-3xl text-[#13daec]">token</span>
                <span className="text-xl font-bold tracking-tight text-(--text-base) uppercase italic">
                  STEM Impact <span className="text-[#ff4d4d]">Academy</span>
                </span>
              </Link>
              <p className="text-(--text-muted) max-w-sm text-sm leading-relaxed mb-5">
                Pioneering educational experiences that blend technology, engineering, and
                competition to inspire the leaders of tomorrow.
              </p>
            </div>
            <div>
              <h4 className="text-(--text-base) font-bold mb-5 text-sm uppercase tracking-widest">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  ["Curriculum", "/educators"],
                  ["Hackathons", "/challenges"],
                  ["School Partnership", "/about"],
                  ["Scholarships", "/contact"],
                ].map(([item, href]) => (
                  <li key={item}>
                    <Link
                      href={href}
                      className="text-(--text-muted) hover:text-[#13daec] transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-(--text-base) font-bold mb-5 text-sm uppercase tracking-widest">
                Support
              </h4>
              <ul className="space-y-3">
                {[
                  ["Help Center", "/help"],
                  ["Rules & Terms", "/terms"],
                  ["Privacy Policy", "/privacy"],
                  ["Safety Guidelines", "/terms"],
                ].map(([item, href]) => (
                  <li key={item}>
                    <Link
                      href={href}
                      className="text-(--text-muted) hover:text-[#13daec] transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-(--border) text-center text-(--text-faint) text-xs">
            © 2024 STEM Impact Academy. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
