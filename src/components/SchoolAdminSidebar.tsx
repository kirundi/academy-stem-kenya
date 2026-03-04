"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import type { School } from "@/lib/types";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Overview", href: "/school/admin", icon: "dashboard", exact: true },
  { label: "Teachers", href: "/school/admin/teachers", icon: "person_outline" },
  { label: "Students", href: "/school/admin/students", icon: "groups" },
  { label: "Classrooms", href: "/school/admin/classrooms", icon: "school" },
  { label: "Analytics", href: "/school/admin/analytics", icon: "analytics" },
  { label: "Course Library", href: "/school/admin/library", icon: "library_books" },
  { label: "Challenges", href: "/school/admin/challenges", icon: "emoji_events" },
  { label: "Parents", href: "/school/admin/parents", icon: "family_restroom" },
  { label: "Integrations", href: "/school/admin/integrations", icon: "hub" },
];

const bottomItems = [
  { label: "Onboarding", href: "/onboarding", icon: "rocket_launch" },
  { label: "Settings", href: "/school/admin/settings", icon: "settings" },
];

export default function SchoolAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();
  const { data: school } = useDocument<School>("schools", appUser?.schoolId ?? null);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = appUser?.displayName
    ? appUser.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-(--bg-sidebar) border-r border-(--border-subtle) flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-(--border-subtle)">
        <StemLogo size="md" />
        <div className="mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#13eca4] bg-[rgba(19,236,164,0.1)] px-2 py-0.5 rounded">
            School Admin
          </span>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-(--border-subtle)">
        <p className="text-xs text-(--text-faint) font-medium mb-1">Managing</p>
        <p className="text-(--text-base) text-sm font-semibold">{school?.name ?? "Loading..."}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href, item.exact) ? "active" : ""}`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-(--border-subtle) pt-3">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className="sidebar-link">
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="pt-3 px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center text-[#13eca4] text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-(--text-muted) font-medium truncate">
                {appUser?.displayName ?? "..."}
              </p>
              <p className="text-xs text-(--text-faint) truncate">Administrator</p>
            </div>
            <ThemeToggle />
            <NotificationBell />
            <button onClick={handleSignOut} title="Sign out">
              <span className="material-symbols-outlined text-[18px] text-(--text-faint) hover:text-[#ff4d4d] transition-colors">
                logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
