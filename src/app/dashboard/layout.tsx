"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GlobalAdminSidebar from "@/components/GlobalAdminSidebar";

export default function GlobalAdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || (appUser.role !== "super_admin" && appUser.role !== "admin"))) {
      router.replace("/login");
    }
  }, [appUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  if (!appUser || (appUser.role !== "super_admin" && appUser.role !== "admin")) {
    return (
      <div className="flex items-center justify-center h-screen bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-page)">
      <GlobalAdminSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
