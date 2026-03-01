"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import MouseLogo from "./MouseLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/admin/global", icon: "dashboard", label: "Overview" },
  { href: "/admin/global/schools", icon: "domain", label: "Schools" },
  { href: "/admin/global/content", icon: "library_books", label: "Content" },
  { href: "/admin/global/audit", icon: "fact_check", label: "Audit" },
  { href: "/admin/global/users", icon: "manage_accounts", label: "Users" },
  { href: "/admin/global/reports", icon: "bar_chart", label: "Reports" },
];

export default function GlobalAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

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
        <MouseLogo size="sm" href="/admin/global" />
        <div className="mt-3 flex items-center gap-2 px-1">
          <span className="w-5 h-5 rounded flex items-center justify-center bg-[rgba(255,77,77,0.1)]">
            <span className="material-symbols-outlined text-[14px] text-[#ff4d4d]">admin_panel_settings</span>
          </span>
          <span className="text-xs font-bold text-[#ff4d4d] uppercase tracking-widest">Global Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link group ${active ? "active" : ""}`}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(19,236,164,0.06)] px-3 py-4 space-y-1">
        <Link href="/admin/global/settings" className="sidebar-link">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </Link>
        <div className="pt-3 px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[rgba(255,77,77,0.15)] flex items-center justify-center text-[#ff4d4d] text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{appUser?.displayName ?? "..."}</p>
              <p className="text-xs text-slate-500 truncate">Global Admin</p>
            </div>
            <button onClick={handleSignOut} title="Sign out">
              <span className="material-symbols-outlined text-[18px] text-slate-500 hover:text-[#ff4d4d] transition-colors">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
