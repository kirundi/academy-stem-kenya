"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "My Courses", href: "/school/student/dashboard", icon: "school" },
  { label: "My Portfolio", href: "/school/student/portfolio", icon: "grid_view" },
  { label: "Badges & Awards", href: "/school/student/badges", icon: "military_tech" },
  { label: "My Progress", href: "/school/student/progress", icon: "insights" },
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
  const xpForNextLevel = Math.ceil((level + 1) / 1) * 1000; // each level = 1000 XP threshold
  const xpPercent = xpForNextLevel > 0 ? Math.min(100, Math.round((xp / xpForNextLevel) * 100)) : 0;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.08)] flex flex-col h-full fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(19,236,164,0.08)]">
        <StemLogo size="md" />
      </div>

      {/* Student info */}
      <div className="px-5 py-4 border-b border-[rgba(19,236,164,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#13eca4] to-[#0dd494] flex items-center justify-center text-[#10221c] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{displayName}</p>
            <p className="text-[#13eca4] text-xs font-medium">Level {level} Creator</p>
          </div>
        </div>
        {/* XP Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>XP Progress</span>
            <span className="text-[#13eca4] font-semibold">{xp} / {xpForNextLevel}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full"
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
      <div className="px-3 pb-4 space-y-1 border-t border-[rgba(19,236,164,0.08)] pt-3">
        <div className="pt-3 px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center text-[#13eca4] text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">Student</p>
            </div>
            <NotificationBell />
            <button onClick={handleSignOut} title="Sign out">
              <span className="material-symbols-outlined text-[18px] text-slate-500 hover:text-[#ff4d4d] transition-colors">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
