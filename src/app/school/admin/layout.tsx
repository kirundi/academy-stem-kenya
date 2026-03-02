"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SchoolAdminSidebar from "@/components/SchoolAdminSidebar";

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || appUser.role !== "school_admin")) {
      router.replace("/login");
    }
  }, [appUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#10221c]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  if (!appUser || appUser.role !== "school_admin") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#10221c]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#10221c]">
      <SchoolAdminSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
