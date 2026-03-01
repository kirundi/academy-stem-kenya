"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MouseLogo from "./MouseLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import type { School } from "@/lib/types";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Overview", href: "/admin/school", icon: "dashboard", exact: true },
  { label: "Teachers", href: "/admin/school/teachers", icon: "person_outline" },
  { label: "Students", href: "/admin/school/students", icon: "groups" },
  { label: "Classrooms", href: "/admin/school/classrooms", icon: "school" },
  { label: "Analytics", href: "/admin/school/analytics", icon: "analytics" },
  { label: "Course Library", href: "/admin/school/library", icon: "library_books" },
];

const bottomItems = [
  { label: "Onboarding", href: "/onboarding", icon: "rocket_launch" },
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
    <aside className="w-60 flex-shrink-0 bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.08)] flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-[rgba(19,236,164,0.08)]">
        <MouseLogo size="md" />
        <div className="mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#13eca4] bg-[rgba(19,236,164,0.1)] px-2 py-0.5 rounded">
            School Admin
          </span>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-[rgba(19,236,164,0.08)]">
        <p className="text-xs text-slate-500 font-medium mb-1">Managing</p>
        <p className="text-white text-sm font-semibold">{school?.name ?? "Loading..."}</p>
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

      <div className="px-3 pb-4 space-y-1 border-t border-[rgba(19,236,164,0.08)] pt-3">
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
              <p className="text-xs text-slate-300 font-medium truncate">{appUser?.displayName ?? "..."}</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
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
