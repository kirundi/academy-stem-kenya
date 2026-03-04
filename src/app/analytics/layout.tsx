"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AnalyticsSidebar from "@/components/AnalyticsSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading, role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || !["analytics_viewer", "admin", "super_admin"].includes(role ?? ""))) {
      router.push("/login");
    }
  }, [loading, appUser, role, router]);

  if (loading || !appUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#10221c]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#a855f7]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#10221c]">
      <AnalyticsSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
