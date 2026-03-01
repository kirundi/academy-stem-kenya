"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !appUser) {
      router.replace("/login");
    }
  }, [appUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#10221c]">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  if (!appUser) return null;

  return <>{children}</>;
}
