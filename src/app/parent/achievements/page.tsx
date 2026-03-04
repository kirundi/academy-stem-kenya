"use client";

import { useParentData } from "@/hooks/useParentData";
import type { ChildProgress } from "@/hooks/useParentData";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function levelLabel(level: number): string {
  if (level <= 2) return "Explorer";
  if (level <= 5) return "Builder";
  if (level <= 9) return "Innovator";
  return "Champion";
}

/** Map a raw badge string (ID or name) to a display-friendly label + icon. */
function badgeDisplay(badge: string): { label: string; icon: string; color: string } {
  const lower = badge.toLowerCase();
  if (lower.includes("first") || lower.includes("start")) {
    return { label: "First Steps", icon: "flag", color: "#10b981" };
  }
  if (lower.includes("complete") || lower.includes("finish")) {
    return { label: "Course Complete", icon: "check_circle", color: "#8b5cf6" };
  }
  if (lower.includes("streak")) {
    return { label: "Learning Streak", icon: "local_fire_department", color: "#f59e0b" };
  }
  if (lower.includes("perfect") || lower.includes("100")) {
    return { label: "Perfect Score", icon: "stars", color: "#f59e0b" };
  }
  if (lower.includes("quiz") || lower.includes("test")) {
    return { label: "Quiz Master", icon: "quiz", color: "#3b82f6" };
  }
  if (lower.includes("challenge")) {
    return { label: "Challenge Accepted", icon: "emoji_events", color: "#10b981" };
  }
  if (lower.includes("speed") || lower.includes("fast")) {
    return { label: "Speed Learner", icon: "bolt", color: "#f59e0b" };
  }
  // fallback — use the raw string as label
  return { label: badge, icon: "military_tech", color: "#8b5cf6" };
}

function ChildAchievementsCard({ child }: { child: ChildProgress }) {
  const { student } = child;
  const initials = getInitials(student.displayName);
  const xpToNext = student.level * 1000;
  const xpPct = Math.min(100, Math.round((student.xp / xpToNext) * 100));

  return (
    <div className="bg-(--bg-card) rounded-2xl border border-[rgba(139,92,246,0.12)] overflow-hidden">
      {/* Child header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-[rgba(139,92,246,0.08)] bg-[rgba(139,92,246,0.04)]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-(--text-base) font-bold text-xl shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-(--text-base) font-bold text-base">{student.displayName}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {student.grade && (
              <span className="px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] text-xs font-semibold">
                Grade {student.grade}
              </span>
            )}
            <span className="text-[#13eca4] text-xs font-medium">
              Level {student.level} &middot; {levelLabel(student.level)}
            </span>
          </div>
          {/* XP bar */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>{student.xp} XP</span>
              <span>{xpToNext} XP to next level</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#13eca4] to-[#0dd494]"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>
        {/* Badge count chip */}
        <div className="shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]">
          <span className="material-symbols-outlined text-[#8b5cf6] text-[22px]">military_tech</span>
          <span className="text-(--text-base) font-bold text-lg leading-none">{student.badges.length}</span>
          <span className="text-[#8b5cf6] text-[10px] font-semibold">Badges</span>
        </div>
      </div>

      {/* Badges grid */}
      <div className="px-6 py-5">
        {student.badges.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3">
              emoji_events
            </span>
            <p className="text-slate-300 font-semibold mb-1">No badges earned yet</p>
            <p className="text-slate-500 text-sm">
              Keep learning! Badges are awarded for completing courses and challenges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {student.badges.map((badge, idx) => {
              const { label, icon, color } = badgeDisplay(badge);
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[rgba(139,92,246,0.1)] bg-[rgba(139,92,246,0.04)] hover:bg-[rgba(139,92,246,0.08)] transition-colors text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `${color}1a` }}
                  >
                    <span
                      className="material-symbols-outlined text-[26px]"
                      style={{ color }}
                    >
                      {icon}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-semibold leading-tight">{label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* School contact note if no achievement data */}
      {student.badges.length === 0 && (
        <div className="mx-6 mb-5 p-3 rounded-xl bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.12)]">
          <p className="text-slate-400 text-xs leading-relaxed">
            <span className="text-[#8b5cf6] font-semibold">Tip:</span> If you believe your child
            has earned badges that are not showing here, please contact their school for assistance.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ParentAchievementsPage() {
  const { children, loading, error } = useParentData();

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#8b5cf6]">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center px-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 mb-3 block">
            error
          </span>
          <p className="text-red-400 font-semibold mb-1">Something went wrong</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalBadges = children.reduce((s, c) => s + c.student.badges.length, 0);

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-[rgba(139,92,246,0.1)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base) flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8b5cf6] text-[22px]">
              emoji_events
            </span>
            Achievements
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Celebrate your children&apos;s accomplishments
          </p>
        </div>
        {totalBadges > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]">
            <span className="material-symbols-outlined text-[#8b5cf6] text-[18px]">
              military_tech
            </span>
            <span className="text-(--text-base) font-bold text-sm">{totalBadges}</span>
            <span className="text-[#8b5cf6] text-xs font-semibold">
              Total Badge{totalBadges !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </header>

      <div className="px-8 py-8">
        {children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-(--bg-card) rounded-2xl border border-[rgba(139,92,246,0.08)]">
            <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">
              emoji_events
            </span>
            <p className="text-(--text-base) font-semibold text-lg mb-2">No children linked yet</p>
            <p className="text-slate-400 text-sm max-w-sm text-center">
              Ask your child&apos;s teacher or school administrator to connect your account.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {children.map((child) => (
              <ChildAchievementsCard key={child.student.uid} child={child} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
