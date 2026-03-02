"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";

interface ChallengeData {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  status: "upcoming" | "live" | "ended";
  targetDate: Date;
  prize: string;
  teamSize: string;
  duration: string;
  prompt: {
    intro: string;
    outputs: string[];
    techFocus: string;
  };
  rules: {
    constraints: string[];
    rubric: { label: string; pct: number }[];
  };
  resources: {
    icon: string;
    title: string;
    description: string;
    action: "download" | "link" | "view";
  }[];
  quote: string;
  bgImage: string;
}

const CHALLENGE_DATA: Record<string, ChallengeData> = {
  "eco-hack-2024": {
    slug: "eco-hack-2024",
    title: "Eco-Hack 2024:",
    subtitle: "Solving Urban Sustainability",
    category: "Sustainability",
    categoryColor: "bg-emerald-500 text-white",
    status: "live",
    targetDate: new Date(
      Date.now() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000 + 42 * 60 * 1000 + 18 * 1000
    ),
    prize: "$2,000",
    teamSize: "2–4 students",
    duration: "48 hours",
    prompt: {
      intro:
        "Urban environments are facing unprecedented challenges in waste management and energy efficiency. Your mission is to design a software or hardware solution that optimises city resources using real-time data.",
      outputs: [
        "A functional prototype (web app, IoT device, or data model).",
        "A 3-minute video pitch demonstrating the impact.",
        "Technical documentation hosted on GitHub.",
      ],
      techFocus: "IoT Sensors, Data Visualisation, AI Forecasting",
    },
    rules: {
      constraints: [
        "Team size: 2–4 students.",
        "Original code and assets only.",
        "Submission deadline: Sunday 11:59 PM.",
        "All projects must be open-sourced on GitHub.",
      ],
      rubric: [
        { label: "Innovation", pct: 40 },
        { label: "Technical Complexity", pct: 30 },
        { label: "Presentation & UX", pct: 30 },
      ],
    },
    resources: [
      {
        icon: "terminal",
        title: "React Starter Kit",
        description: "Pre-configured boilerplate",
        action: "download",
      },
      {
        icon: "api",
        title: "Open Weather API",
        description: "Environment data endpoints",
        action: "link",
      },
      {
        icon: "school",
        title: "Facilitation Guide",
        description: "For educators and mentors",
        action: "view",
      },
      {
        icon: "dataset",
        title: "Urban Census Data",
        description: "Kenya 2023 city datasets",
        action: "download",
      },
    ],
    quote:
      '"Innovation is the bridge between a problem and a sustainable solution." — Academy Mentor',
    bgImage: "linear-gradient(135deg, #0d2e1a 0%, #102022 60%, #13daec10 100%)",
  },
  "robo-race-2024": {
    slug: "robo-race-2024",
    title: "Robo-Race 2024:",
    subtitle: "Autonomous Racing Challenge",
    category: "Robotics",
    categoryColor: "bg-[#13daec] text-[#102022]",
    status: "upcoming",
    targetDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    prize: "$1,500",
    teamSize: "2–3 students",
    duration: "48 hours",
    prompt: {
      intro:
        "Design and program the fastest autonomous robot. Optimise sensors and motor controls to navigate complex obstacle courses. Your robot must complete three laps with zero manual intervention.",
      outputs: [
        "A physical or simulated autonomous robot prototype.",
        "Source code and wiring diagrams on GitHub.",
        "A 2-minute demo video of the robot in action.",
      ],
      techFocus: "Embedded Systems, Computer Vision, PID Control",
    },
    rules: {
      constraints: [
        "Team size: 2–3 students.",
        "Robot must navigate a standard SIA obstacle course.",
        "No pre-purchased proprietary AI chips allowed.",
        "Submission via GitHub + video before deadline.",
      ],
      rubric: [
        { label: "Speed & Accuracy", pct: 40 },
        { label: "Code Quality", pct: 35 },
        { label: "Innovation", pct: 25 },
      ],
    },
    resources: [
      {
        icon: "smart_toy",
        title: "Arduino Starter Pack",
        description: "Hardware component list",
        action: "download",
      },
      {
        icon: "api",
        title: "Simulation API",
        description: "Virtual robot test environment",
        action: "link",
      },
      {
        icon: "school",
        title: "Mentor Sessions",
        description: "Booking link for guidance",
        action: "view",
      },
      {
        icon: "map",
        title: "Course Blueprint",
        description: "Obstacle layout PDF",
        action: "download",
      },
    ],
    quote:
      '"The best engineers don\'t just solve problems — they race to be first." — Academy Coach',
    bgImage: "linear-gradient(135deg, #0d1e2e 0%, #102022 60%, #13daec10 100%)",
  },
};

const FALLBACK_CHALLENGE = CHALLENGE_DATA["eco-hack-2024"];

function CountdownUnit({
  value,
  label,
  highlight = false,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl backdrop-blur-md border ${
          highlight ? "bg-rose-500/20 border-rose-500/40" : "bg-[#102022]/80 border-[#13daec]/20"
        }`}
      >
        <p
          className={`text-2xl sm:text-3xl font-black tabular-nums ${highlight ? "text-rose-400" : "text-[#13daec]"}`}
        >
          {String(value).padStart(2, "0")}
        </p>
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 tracking-widest">{label}</p>
    </div>
  );
}

function LiveCountdown({ targetDate }: { targetDate: Date }) {
  const calc = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
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
  return (
    <div className="flex gap-3 sm:gap-4">
      <CountdownUnit value={time.days} label="Days" />
      <CountdownUnit value={time.hours} label="Hrs" />
      <CountdownUnit value={time.minutes} label="Min" />
      <CountdownUnit value={time.seconds} label="Sec" highlight />
    </div>
  );
}

const ACTION_ICONS: Record<string, string> = {
  download: "download",
  link: "link",
  view: "visibility",
};

export default function ChallengeBriefPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "eco-hack-2024";
  const challenge = CHALLENGE_DATA[slug] ?? FALLBACK_CHALLENGE;

  const [enrollToast, setEnrollToast] = useState(false);
  const [calToast, setCalToast] = useState(false);

  const handleEnroll = () => {
    setEnrollToast(true);
    setTimeout(() => setEnrollToast(false), 3000);
  };
  const handleCal = () => {
    setCalToast(true);
    setTimeout(() => setCalToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#102022] text-slate-100 antialiased overflow-x-hidden">
      <PublicNavbar />

      {/* Toast notifications */}
      {enrollToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-[#13daec]/10 border border-[#13daec]/30 text-[#13daec] rounded-xl shadow-lg">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-bold">Team registration request sent!</span>
        </div>
      )}
      {calToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-xl shadow-lg">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-bold">Added to your calendar!</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 pb-48">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/challenges" className="hover:text-[#13daec] transition-colors">
            Challenges
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-100 font-medium">
            {challenge.title} {challenge.subtitle}
          </span>
        </nav>

        {/* ── Hero Banner ── */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-8 group">
          {/* Background */}
          <div className="absolute inset-0" style={{ background: challenge.bgImage }} />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(19,218,236,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(19,218,236,0.4) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#102022]/90 via-[#102022]/20 to-transparent" />

          {/* Height placeholder */}
          <div className="h-80 sm:h-96 w-full" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full z-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                {challenge.status === "live" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-full text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,77,77,0.3)]">
                    <span className="size-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                    Live Challenge
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                    <span className="size-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Starting Soon
                  </span>
                )}
                <h1 className="text-white text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                  {challenge.title}
                  <br />
                  <span className="text-[#13daec]">{challenge.subtitle}</span>
                </h1>

                {/* Meta tags */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${challenge.categoryColor}`}
                  >
                    {challenge.category}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-sm">emoji_events</span>
                    Prize: <span className="text-[#13daec] font-bold ml-1">{challenge.prize}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-sm">group</span>
                    {challenge.teamSize}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    {challenge.duration}
                  </span>
                </div>
              </div>

              {/* Live Countdown */}
              <LiveCountdown targetDate={challenge.targetDate} />
            </div>
          </div>
        </div>

        {/* ── 3-Column Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Column 1: The Prompt */}
          <section className="flex flex-col gap-5 bg-[#1a2e30]/50 p-6 rounded-2xl border border-[#2d4548]">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#13daec]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#13daec]">lightbulb</span>
              </div>
              <h3 className="text-xl font-bold text-white">The Prompt</h3>
            </div>

            <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <p>{challenge.prompt.intro}</p>

              <div>
                <p className="font-bold text-slate-200 mb-2">Expected Outputs:</p>
                <ul className="list-disc pl-5 space-y-2">
                  {challenge.prompt.outputs.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[#13daec]/10 rounded-xl border border-[#13daec]/20">
                <p className="text-[#13daec] text-xs font-bold mb-1 uppercase tracking-wider">
                  Tech Focus
                </p>
                <p className="text-slate-200 text-sm">{challenge.prompt.techFocus}</p>
              </div>
            </div>
          </section>

          {/* Column 2: Rules & Scoring */}
          <section className="flex flex-col gap-5 bg-[#1a2e30]/50 p-6 rounded-2xl border border-[#2d4548]">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#13daec]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#13daec]">gavel</span>
              </div>
              <h3 className="text-xl font-bold text-white">Rules &amp; Scoring</h3>
            </div>

            <div className="space-y-6">
              {/* Constraints */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Constraints
                </p>
                <ul className="space-y-3">
                  {challenge.rules.constraints.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="material-symbols-outlined text-rose-400 text-[18px] mt-0.5">
                        check_circle
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rubric */}
              <div className="pt-4 border-t border-[#2d4548]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Rubric Breakdown
                </p>
                <div className="space-y-4">
                  {challenge.rules.rubric.map(({ label, pct }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                        <span>{label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-[#102022] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#13daec] h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Judging note */}
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-400 text-base mt-0.5">
                  info
                </span>
                <p className="text-xs text-slate-400">
                  Judging takes place 48 hours after submission close. Results announced live.
                </p>
              </div>
            </div>
          </section>

          {/* Column 3: Resources */}
          <section className="flex flex-col gap-5 bg-[#1a2e30]/50 p-6 rounded-2xl border border-[#2d4548]">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-[#13daec]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#13daec]">folder_open</span>
              </div>
              <h3 className="text-xl font-bold text-white">Resources</h3>
            </div>

            <div className="flex flex-col gap-3">
              {challenge.resources.map((res) => (
                <a
                  key={res.title}
                  href="#"
                  className="group flex items-center justify-between p-4 rounded-xl bg-[#102022]/60 border border-[#2d4548] hover:border-[#13daec] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-[#13daec]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#13daec] text-lg">
                        {res.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{res.title}</p>
                      <p className="text-xs text-slate-500">{res.description}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-[#13daec] transition-colors">
                    {ACTION_ICONS[res.action]}
                  </span>
                </a>
              ))}

              {/* Inspirational quote */}
              <div className="mt-2 p-4 border border-dashed border-[#2d4548] rounded-xl">
                <p className="text-xs text-slate-500 italic leading-relaxed">{challenge.quote}</p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Timeline ── */}
        <section className="bg-[#1a2e30]/50 border border-[#2d4548] rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13daec]">schedule</span>
            Challenge Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              {
                icon: "event_available",
                label: "Registration Opens",
                date: "Jan 20, 2024",
                status: "done",
              },
              {
                icon: "rocket_launch",
                label: "Challenge Starts",
                date: "Feb 2, 2024",
                status: "active",
              },
              {
                icon: "upload_file",
                label: "Submission Deadline",
                date: "Feb 4, 2024 11:59 PM",
                status: "upcoming",
              },
              {
                icon: "workspace_premium",
                label: "Results Announced",
                date: "Feb 7, 2024",
                status: "upcoming",
              },
            ].map(({ icon, label, date, status }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div
                  className={`size-12 rounded-full flex items-center justify-center border-2 ${
                    status === "done"
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : status === "active"
                        ? "bg-[#13daec]/10 border-[#13daec]/40 shadow-[0_0_12px_rgba(19,218,236,0.2)]"
                        : "bg-[#102022] border-[#2d4548]"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${
                      status === "done"
                        ? "text-emerald-400"
                        : status === "active"
                          ? "text-[#13daec]"
                          : "text-slate-600"
                    }`}
                  >
                    {icon}
                  </span>
                </div>
                <p
                  className={`text-xs font-bold ${status === "active" ? "text-[#13daec]" : status === "done" ? "text-emerald-400" : "text-slate-500"}`}
                >
                  {label}
                </p>
                <p className="text-[10px] text-slate-600">{date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-[#1a2e30]/50 border border-[#2d4548] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13daec]">help</span>
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Can students from multiple schools team up?",
                a: "No. All team members must be enrolled at the same registered school to compete.",
              },
              {
                q: "Is there a maximum number of teams per school?",
                a: "Each school may register up to 5 teams per challenge to keep competition fair.",
              },
              {
                q: "What happens if our submission is late?",
                a: "Late submissions are auto-rejected. The platform locks at the deadline timestamp.",
              },
              {
                q: "Do we own the IP of our project?",
                a: "Yes — all intellectual property belongs to the student creators. STEM Academy only requests a right to showcase winning projects.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="p-4 rounded-xl bg-[#102022]/60 border border-[#2d4548]">
                <p className="text-sm font-bold text-slate-200 mb-1.5">{q}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Sticky Footer CTA ── */}
      <div
        id="enroll"
        className="fixed bottom-0 left-0 right-0 z-40 flex flex-wrap justify-center gap-4 bg-[#102022]/90 backdrop-blur-xl border-t border-[#2d4548] p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="hidden sm:flex items-center gap-3 mr-4">
          <div className="size-9 rounded-lg bg-[#13daec]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#13daec] text-lg">bolt</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              {challenge.title} {challenge.subtitle}
            </p>
            <p className="text-[10px] text-slate-500">
              Prize pool: <span className="text-[#13daec] font-bold">{challenge.prize}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleEnroll}
          className="flex-1 max-w-xs flex items-center justify-center gap-2 h-14 rounded-xl bg-[#13daec] text-[#102022] font-black text-base tracking-tight hover:shadow-[0_0_24px_rgba(19,218,236,0.4)] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">group_add</span>
          Enroll My Class
        </button>

        <button
          onClick={handleCal}
          className="flex-1 max-w-xs flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-[#13daec]/40 bg-transparent text-[#13daec] font-black text-base tracking-tight hover:bg-[#13daec]/10 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Add to My Calendar
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-[#0d1f22] border-t border-[#2d4548] py-8 px-6 text-center mt-0">
        <p className="text-slate-500 text-xs">
          © 2024 STEM Impact Academy. Empowering the next generation of urban innovators.
        </p>
      </footer>
    </div>
  );
}
