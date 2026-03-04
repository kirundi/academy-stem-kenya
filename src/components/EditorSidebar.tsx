"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StemLogo from "./StemLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Dashboard", href: "/editor/dashboard", icon: "dashboard" },
  { label: "Courses", href: "/editor/courses", icon: "school" },
  { label: "Challenges", href: "/editor/challenges", icon: "emoji_events" },
  { label: "Media Library", href: "/editor/media", icon: "photo_library" },
  { label: "Settings", href: "/editor/settings", icon: "settings" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function EditorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { signOut } = useAuth();

  const displayName = appUser?.displayName ?? "Editor";
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 shrink-0 bg-[#0d1f1a] border-r border-[rgba(236,72,153,0.12)] flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="px-5 py-5 border-b border-[rgba(236,72,153,0.12)]">
        <StemLogo size="md" />
      </div>

      <div className="px-5 py-4 border-b border-[rgba(236,72,153,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(236,72,153,0.15)] flex items-center justify-center text-[#ec4899] font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{displayName}</p>
            <p className="text-[#ec4899] text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">edit_note</span>
              Content Editor
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
        <div className="p-3 rounded-xl bg-[rgba(236,72,153,0.08)] border border-[rgba(236,72,153,0.15)]">
          <p className="text-[#ec4899] text-xs font-semibold mb-0.5">Platform Editor</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Create and manage platform-wide courses and challenges.
          </p>
        </div>
      </div>

      <div className="px-3 pb-4 border-t border-[rgba(236,72,153,0.12)] pt-3">
        <div className="flex items-center gap-3 px-3 pt-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(236,72,153,0.15)] flex items-center justify-center text-[#ec4899] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 font-medium truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">Content Editor</p>
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
