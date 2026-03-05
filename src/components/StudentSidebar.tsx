"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "My Courses", href: "/school/student/dashboard", icon: "school" },
  { label: "My Portfolio", href: "/school/student/portfolio", icon: "grid_view" },
  { label: "Badges & Awards", href: "/school/student/badges", icon: "military_tech" },
  { label: "My Progress", href: "/school/student/progress", icon: "insights" },
  { label: "Achievements", href: "/school/student/achievements", icon: "emoji_events" },
  { label: "Challenges", href: "/school/student/challenges", icon: "trophy" },
  { label: "Leaderboard", href: "/school/student/leaderboard", icon: "leaderboard" },
  { label: "Calendar", href: "/school/student/calendar", icon: "calendar_month" },
  { label: "Collaboration", href: "/school/student/collaboration", icon: "groups" },
  { label: "Settings", href: "/school/student/settings", icon: "settings" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Student";
  const initials = getInitials(displayName);
  const level = appUser?.level ?? 1;
  const xp = appUser?.xp ?? 0;
  const xpForNextLevel = level * 1000; // each level requires level × 1000 XP
  const xpPercent = xpForNextLevel > 0 ? Math.min(100, Math.round((xp / xpForNextLevel) * 100)) : 0;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-(--bg-sidebar) border-r border-(--border-subtle) flex flex-col h-full fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-(--border-subtle)">
        <StemLogo size="md" />
      </div>

      {/* Student info */}
      <div className="px-5 py-4 border-b border-(--border-subtle)">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-(--primary-green) to-(--primary-green-dark) flex items-center justify-center text-[#0d1f22] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-(--text-base) text-sm font-semibold">{displayName}</p>
            <p className="text-(--primary-green) text-xs font-medium">Level {level} Creator</p>
          </div>
        </div>
        {/* XP Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-(--text-faint) mb-1.5">
            <span>XP Progress</span>
            <span className="text-(--primary-green) font-semibold">
              {xp} / {xpForNextLevel}
            </span>
          </div>
          <div className="h-1.5 bg-(--border) rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-(--primary-green) to-(--primary-green-dark) rounded-full"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? "active" : ""}`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-(--border-subtle) pt-3">
        <div className="pt-3 px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(45,212,191,0.15)] flex items-center justify-center text-(--primary-green) text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-(--text-muted) font-medium truncate">{displayName}</p>
              <p className="text-xs text-(--text-faint) truncate">Student</p>
            </div>
            <ThemeToggle />
            <NotificationBell />
            <button onClick={handleSignOut} title="Sign out">
              <span className="material-symbols-outlined text-[18px] text-(--text-faint) hover:text-(--accent-red) transition-colors">
                logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
