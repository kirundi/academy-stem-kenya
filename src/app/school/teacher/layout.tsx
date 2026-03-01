"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TeacherSidebar from "@/components/TeacherSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { appUser, loading, role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!appUser || role !== "teacher")) {
      router.replace("/login");
    }
  }, [appUser, loading, role, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#10221c]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  if (!appUser || role !== "teacher") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#10221c]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#10221c]">
      <TeacherSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
