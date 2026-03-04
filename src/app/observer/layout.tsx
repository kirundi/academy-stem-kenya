"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ObserverSidebar from "@/components/ObserverSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ObserverLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading, role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || !["observer", "admin", "super_admin"].includes(role ?? ""))) {
      router.push("/login");
    }
  }, [loading, appUser, role, router]);

  if (loading || !appUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#06b6d4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-(--bg-page)">
      <ObserverSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
