"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Pending Review", href: "/reviewer/dashboard", icon: "rate_review" },
  { label: "Published", href: "/reviewer/published", icon: "check_circle" },
  { label: "History", href: "/reviewer/history", icon: "history" },
  { label: "Settings", href: "/reviewer/settings", icon: "settings" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ReviewerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Reviewer";
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-(--bg-sidebar) border-r border-[rgba(245,158,11,0.12)] flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-[rgba(245,158,11,0.12)]">
        <StemLogo size="md" />
      </div>

      <div className="px-5 py-4 border-b border-[rgba(245,158,11,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-[#f59e0b] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-(--text-base) text-sm font-semibold">{displayName}</p>
            <p className="text-[#f59e0b] text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">rate_review</span>
              Content Reviewer
            </p>
          </div>
        </div>
      </div>

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

      <div className="px-3 pb-4 border-t border-[rgba(245,158,11,0.12)] pt-3">
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center text-[#f59e0b] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-(--text-muted) font-medium truncate">{displayName}</p>
            <p className="text-xs text-(--text-faint) truncate">Content Reviewer</p>
          </div>
          <ThemeToggle />
          <NotificationBell />
          <button onClick={handleSignOut} title="Sign out">
            <span className="material-symbols-outlined text-[18px] text-(--text-faint) hover:text-accent-red transition-colors">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
