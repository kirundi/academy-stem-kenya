"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/school/teacher/dashboard", icon: "dashboard" },
  { label: "Classrooms", href: "/school/teacher/classroom", icon: "groups" },
  { label: "Courses", href: "/school/teacher/courses", icon: "menu_book" },
  { label: "Grading", href: "/school/teacher/grading", icon: "grading" },
  { label: "Team Grading", href: "/school/teacher/grading-panel", icon: "fact_check" },
  { label: "Challenges", href: "/school/teacher/challenges", icon: "trophy" },
  { label: "Team Setup", href: "/school/teacher/team-setup", icon: "add_circle" },
  { label: "Class Review", href: "/school/teacher/class-review", icon: "rate_review" },
  { label: "Groups", href: "/school/teacher/groups", icon: "workspaces" },
  { label: "Analytics", href: "/school/teacher/analytics", icon: "bar_chart" },
  { label: "Enrollment", href: "/school/teacher/enrollment", icon: "manage_accounts" },
  { label: "My Profile", href: "/school/teacher/profile", icon: "account_circle" },
  { label: "Settings", href: "/school/teacher/settings", icon: "settings" },
];

const bottomItems: typeof navItems = [];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Teacher";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleName =
    appUser?.department ??
    (appUser?.subjects?.length ? appUser.subjects.join(", ") : "STEM Educator");

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

      {/* Teacher info */}
      <div className="px-5 py-4 border-b border-(--border-subtle)">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#13eca4] to-[#0dd494] flex items-center justify-center text-[#0d1f22] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-(--text-base) text-sm font-semibold">{displayName}</p>
            <p className="text-primary-green text-xs font-medium">{roleName}</p>
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
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className="sidebar-link">
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="pt-3 px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-green/15 flex items-center justify-center text-primary-green text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-(--text-muted) font-medium truncate">{displayName}</p>
              <p className="text-xs text-(--text-faint) truncate">Educator</p>
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
      </div>
    </aside>
  );
}
