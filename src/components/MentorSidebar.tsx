"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "My Challenges", href: "/mentor/dashboard", icon: "emoji_events" },
  { label: "Settings", href: "/mentor/settings", icon: "settings" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function MentorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Mentor";
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-[#0d1f1a] border-r border-[rgba(16,185,129,0.12)] flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-[rgba(16,185,129,0.12)]">
        <StemLogo size="md" />
      </div>

      <div className="px-5 py-4 border-b border-[rgba(16,185,129,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-[#10b981] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{displayName}</p>
            <p className="text-[#10b981] text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">workspace_premium</span>
              Mentor
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
        <div className="p-3 rounded-xl bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)]">
          <p className="text-[#10b981] text-xs font-semibold mb-0.5">Challenge Judge</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Review and grade student submissions for your assigned challenges.
          </p>
        </div>
      </div>

      <div className="px-3 pb-4 border-t border-[rgba(16,185,129,0.12)] pt-3">
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-[#10b981] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 font-medium truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">Mentor</p>
          </div>
          <NotificationBell />
          <button onClick={handleSignOut} title="Sign out">
            <span className="material-symbols-outlined text-[18px] text-slate-500 hover:text-[#ff4d4d] transition-colors">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
