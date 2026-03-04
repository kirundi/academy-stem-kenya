"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "School Overview", href: "/observer/dashboard", icon: "domain" },
  { label: "Schools", href: "/observer/schools", icon: "domain" },
  { label: "Courses", href: "/observer/courses", icon: "library_books" },
  { label: "Reports", href: "/observer/reports", icon: "bar_chart" },
  { label: "Settings", href: "/observer/settings", icon: "settings" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ObserverSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Observer";
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-(--bg-sidebar) border-r border-[rgba(6,182,212,0.12)] flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-[rgba(6,182,212,0.12)]">
        <StemLogo size="md" />
      </div>

      <div className="px-5 py-4 border-b border-[rgba(6,182,212,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(6,182,212,0.2)] flex items-center justify-center text-[#06b6d4] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-(--text-base) text-sm font-semibold">{displayName}</p>
            <p className="text-[#06b6d4] text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">visibility</span>
              Observer
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

      <div className="px-3 mb-3">
        <div className="p-3 rounded-xl bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)]">
          <p className="text-[#06b6d4] text-xs font-semibold mb-0.5">Observation access</p>
          <p className="text-(--text-muted) text-xs leading-relaxed">
            You can view your assigned schools. No student PII is accessible.
          </p>
        </div>
      </div>

      <div className="px-3 pb-4 border-t border-[rgba(6,182,212,0.12)] pt-3">
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(6,182,212,0.15)] flex items-center justify-center text-[#06b6d4] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-(--text-muted) font-medium truncate">{displayName}</p>
            <p className="text-xs text-(--text-faint) truncate">Observer</p>
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
