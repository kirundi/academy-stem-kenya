"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "My Children", href: "/parent/dashboard", icon: "family_restroom" },
  { label: "Progress Reports", href: "/parent/reports", icon: "bar_chart" },
  { label: "Achievements", href: "/parent/achievements", icon: "emoji_events" },
  { label: "Settings", href: "/parent/settings", icon: "settings" },
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ParentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Parent";
  const initials = getInitials(displayName);

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

      {/* Parent info */}
      <div className="px-5 py-4 border-b border-(--border-subtle)">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-(--text-base) text-sm font-semibold">{displayName}</p>
            <p className="text-[#8b5cf6] text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">family_restroom</span>
              Parent
            </p>
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

      {/* Help card */}
      <div className="px-3 mb-3">
        <div className="p-3 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)]">
          <p className="text-[#8b5cf6] text-xs font-semibold mb-0.5">Need help?</p>
          <p className="text-(--text-muted) text-xs leading-relaxed">
            Contact your child&apos;s school or teacher for account support.
          </p>
        </div>
      </div>

      {/* Bottom user strip */}
      <div className="px-3 pb-4 border-t border-(--border-subtle) pt-3">
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(139,92,246,0.15)] flex items-center justify-center text-[#8b5cf6] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-(--text-muted) font-medium truncate">{displayName}</p>
            <p className="text-xs text-(--text-faint) truncate">Parent</p>
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
