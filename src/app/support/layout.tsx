"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SupportSidebar from "@/components/SupportSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading, role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || !["support", "admin", "super_admin"].includes(role ?? ""))) {
      router.push("/login");
    }
  }, [loading, appUser, role, router]);

  if (loading || !appUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#3b82f6]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-(--bg-page)">
      <SupportSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
