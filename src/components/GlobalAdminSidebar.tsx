"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

const baseNavItems = [
  { href: "/dashboard", icon: "dashboard", label: "Overview" },
  { href: "/dashboard/courses", icon: "school", label: "Courses" },
  { href: "/dashboard/schools", icon: "domain", label: "Schools" },
  { href: "/dashboard/content", icon: "library_books", label: "Content" },
  { href: "/dashboard/audit", icon: "fact_check", label: "Audit" },
  { href: "/dashboard/users", icon: "manage_accounts", label: "Users" },
  { href: "/dashboard/reports", icon: "bar_chart", label: "Reports" },
  { href: "/dashboard/api-monitor", icon: "monitor_heart", label: "API Monitor" },
  { href: "/dashboard/webhooks", icon: "webhook", label: "Webhooks" },
  { href: "/dashboard/developer", icon: "code", label: "Developer" },
  { href: "/dashboard/integrations", icon: "hub", label: "Integrations" },
  { href: "/dashboard/teachers", icon: "person_book", label: "Teachers" },
  { href: "/dashboard/challenges", icon: "emoji_events", label: "Challenges" },
];

export default function GlobalAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, hasPermission } = useAuthContext();
  const { signOut } = useAuth();

  const isSuperAdmin = appUser?.role === "super_admin";
  const badgeLabel = isSuperAdmin ? "Super Admin" : "Admin";
  const badgeColor = isSuperAdmin ? "#f59e0b" : "#ff4d4d";

  // Show Settings to anyone with manage_settings permission
  const navItems = hasPermission("manage_settings")
    ? [...baseNavItems, { href: "/dashboard/settings", icon: "settings", label: "Settings" }]
    : baseNavItems;

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
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.08)] flex flex-col z-30">
      <div className="px-5 py-5 border-b border-[rgba(19,236,164,0.06)]">
        <StemLogo size="sm" href="/dashboard" />
        <div className="mt-3 flex items-center gap-2 px-1">
          <span
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: `${badgeColor}15` }}
          >
            <span className="material-symbols-outlined text-[14px]" style={{ color: badgeColor }}>
              {isSuperAdmin ? "shield_person" : "admin_panel_settings"}
            </span>
          </span>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: badgeColor }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link group ${active ? "active" : ""}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(19,236,164,0.06)] px-3 py-4 space-y-1">
        <div className="pt-3 px-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: `${badgeColor}20`, color: badgeColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">
                {appUser?.displayName ?? "..."}
              </p>
              <p className="text-xs text-slate-500 truncate">{badgeLabel}</p>
            </div>
            <NotificationBell />
            <button onClick={handleSignOut} title="Sign out">
              <span className="material-symbols-outlined text-[18px] text-slate-500 hover:text-[#ff4d4d] transition-colors">
                logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
