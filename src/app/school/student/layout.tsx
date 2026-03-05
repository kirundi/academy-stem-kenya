"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading, role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || role !== "student")) {
      router.push("/login");
    }
  }, [loading, appUser, role, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  if (!appUser || role !== "student") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-(--bg-page)">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-(--bg-page)">
      <StudentSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
