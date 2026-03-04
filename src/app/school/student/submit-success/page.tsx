"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function SubmitSuccessPageWrapper() {
  return (
    <Suspense>
      <SubmitSuccessPage />
    </Suspense>
  );
}

function SubmitSuccessPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { appUser } = useAuthContext();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const courseName = searchParams.get("course") ?? "Course";
  const displayName = appUser?.displayName ?? "Student";
  const initials = getInitials(displayName);
  const level = appUser?.level ?? 1;
  const xp = appUser?.xp ?? 0;

  return (
    <div className="min-h-screen bg-(--bg-page) flex flex-col items-center relative overflow-hidden">
      {/* Confetti dot background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(19,236,164,0.15) 1px, transparent 1px), radial-gradient(circle, rgba(245,158,11,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px, 70px 70px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />
      {/* Glow behind badge */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #13eca4, transparent)" }}
      />

      {/* Minimal navbar */}
      <header className="w-full flex items-center justify-between px-8 py-5 border-b border-(--border-subtle) bg-[rgba(16,34,28,0.5)] backdrop-blur relative z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-green text-[28px]">token</span>
          <span className="text-(--text-base) font-black uppercase italic">
            STEM Impact <span className="text-accent-red">Academy</span>
          </span>
        </div>
        <div className="flex items-center gap-5 text-(--text-muted) text-sm">
          <Link href="/school/student/dashboard" className="hover:text-primary-green transition-colors">
            My Courses
          </Link>
          <Link href="/school/student/portfolio" className="hover:text-primary-green transition-colors">
            Portfolio
          </Link>
        </div>
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#13eca4] to-[#0dd494] flex items-center justify-center text-(--text-base) font-bold text-sm">
          {initials}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 max-w-3xl w-full mx-auto">
        {/* Success badge */}
        <div className="inline-flex items-center gap-2 bg-primary-green/10 border border-(--border-accent) rounded-full px-4 py-1.5 mb-8">
          <span
            className="material-symbols-outlined text-primary-green text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="text-primary-green text-xs font-bold uppercase tracking-widest">
            Submission Success
          </span>
        </div>

        <h1
          className={`text-5xl font-bold text-(--text-base) text-center mb-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          Great job!
        </h1>
        <p className="text-(--text-muted) text-lg text-center mb-12 max-w-md">
          Your project <span className="text-(--text-base) font-semibold">{courseName}</span> has been
          submitted for review.
        </p>

        {/* Central Badge */}
        <div
          className={`group relative mb-12 transition-all duration-1000 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        >
          {/* Glow ring */}
          <div
            className="absolute -inset-6 rounded-full opacity-30 blur-2xl"
            style={{ background: "radial-gradient(circle, #13eca4, transparent)" }}
          />
          {/* Outer ring */}
          <div className="relative w-56 h-56 rounded-full border-2 border-(--border-strong) flex items-center justify-center backdrop-blur-sm bg-[rgba(19,236,164,0.04)]">
            {/* Inner badge circle */}
            <div
              className="w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl relative"
              style={{ background: "linear-gradient(135deg, #13eca4, #00d4a0)" }}
            >
              <span
                className="material-symbols-outlined text-[64px] text-[#0a1a18] mb-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                memory
              </span>
            </div>
            {/* Star chip */}
            <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
              <span
                className="material-symbols-outlined text-[18px] text-yellow-900"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
          </div>
          {/* Name plate */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-(--bg-page) border border-(--border-strong) rounded-xl px-5 py-2 whitespace-nowrap">
            <p className="text-primary-green font-black uppercase tracking-widest text-sm text-center">
              {courseName}
            </p>
            <p className="text-(--text-faint) text-[10px] text-center uppercase tracking-widest mt-0.5">
              Level {String(level).padStart(2, "0")} Achieved
            </p>
          </div>
        </div>

        {/* Certificate Progress */}
        <div className="w-full max-w-md bg-(--bg-card) border border-(--border-subtle) rounded-2xl p-5 mb-8 mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-(--text-base) font-semibold text-sm">STEM Explorer Certificate Progress</p>
            <span className="text-primary-green font-bold text-sm">
              {Math.min(100, Math.round((xp / 1000) * 100))}%
            </span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-2.5 rounded-full"
              style={{
                background: "linear-gradient(90deg, #10b981, #13eca4)",
                width: `${Math.min(100, Math.round((xp / 1000) * 100))}%`,
              }}
            />
          </div>
          <p className="text-(--text-faint) text-xs">
            Keep going to earn your STEM Explorer Certificate!
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-10">
          {[
            { icon: "bolt", color: "#13eca4", label: "Total XP", value: String(xp) },
            { icon: "emoji_events", color: "#f59e0b", label: "Level", value: `Level ${level}` },
            { icon: "schedule", color: "#8b5cf6", label: "Review Time", value: "24-48h" },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center bg-[rgba(255,255,255,0.03)] rounded-xl border border-(--border-subtle) p-4"
            >
              <span
                className="material-symbols-outlined block text-[24px] mb-1"
                style={{ color: s.color }}
              >
                {s.icon}
              </span>
              <p className="text-(--text-base) font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-(--text-faint) text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            href="/school/student/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-green text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary-green/20 text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            Next Course
          </Link>
          <Link
            href="/school/student/portfolio"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-green/8 text-primary-green border border-(--border-accent) font-bold rounded-xl hover:bg-(--hover-medium) transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            View Portfolio
          </Link>
        </div>
      </main>

      <footer className="w-full py-5 text-center text-(--text-faint) text-xs relative z-10 border-t border-(--border-subtle)">
        <div className="flex items-center justify-center gap-6">
          <Link href="/help" className="hover:text-(--text-muted) transition-colors">
            Help Center
          </Link>
          <Link href="/terms" className="hover:text-(--text-muted) transition-colors">
            Guidelines
          </Link>
          <Link href="/privacy" className="hover:text-(--text-muted) transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2">&copy; 2026 STEM Impact Academy.</p>
      </footer>
    </div>
  );
}
