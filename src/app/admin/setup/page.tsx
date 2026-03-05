"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StemLogo from "@/components/StemLogo";

export default function AdminSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "checking" | "ready" | "loading" | "done" | "already_initialized"
  >("checking");
  const [credentials, setCredentials] = useState<{ email: string; tempPassword: string } | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.initialized ? "already_initialized" : "ready");
      })
      .catch(() => setStatus("ready"));
  }, []);

  const handleSetup = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Setup failed");
        setStatus("ready");
        return;
      }
      setCredentials({ email: data.email, tempPassword: data.tempPassword });
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("ready");
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-page) flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <StemLogo size="md" />
          <h1 className="text-2xl font-bold text-(--text-base) mt-6">Platform Setup</h1>
          <p className="text-(--text-muted) text-sm mt-2">STEM Impact Academy — Admin Initialization</p>
        </div>

        <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-8">
          {status === "checking" && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
                progress_activity
              </span>
              <p className="text-(--text-muted) text-sm mt-4">Checking platform status...</p>
            </div>
          )}

          {status === "already_initialized" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[rgba(45,212,191,0.1)] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-(--primary-green)">
                  check_circle
                </span>
              </div>
              <h2 className="text-(--text-base) font-bold text-lg">Platform Already Initialized</h2>
              <p className="text-(--text-muted) text-sm mt-2">A global admin account already exists.</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-6 bg-(--primary-green) text-[#10221c] font-bold text-sm px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === "ready" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(255,77,77,0.1)] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-(--accent-red)">
                  admin_panel_settings
                </span>
              </div>
              <h2 className="text-(--text-base) font-bold text-lg">Initialize Super Admin</h2>
              <p className="text-(--text-muted) text-sm mt-2 mb-1">
                This will create the global super admin account for:
              </p>
              <p className="text-(--primary-green) font-mono text-sm font-bold">
                magu@stemimpactcenterkenya.org
              </p>

              {error && (
                <div className="mt-4 bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] rounded-lg px-4 py-3">
                  <p className="text-(--accent-red) text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSetup}
                className="mt-6 bg-(--accent-red) text-(--text-base) font-bold text-sm px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Initialize Platform
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-8">
              <span className="material-symbols-outlined animate-spin text-4xl text-(--accent-red)">
                progress_activity
              </span>
              <p className="text-(--text-muted) text-sm mt-4">Creating super admin account...</p>
            </div>
          )}

          {status === "done" && credentials && (
            <div className="py-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[rgba(45,212,191,0.1)] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-(--primary-green)">
                    verified
                  </span>
                </div>
                <h2 className="text-(--text-base) font-bold text-lg">Super Admin Created</h2>
                <p className="text-(--text-muted) text-sm mt-2">
                  Save these credentials securely. The password cannot be retrieved again.
                </p>
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-(--border-subtle) rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-(--text-faint) text-xs uppercase tracking-wider font-medium">
                    Email
                  </label>
                  <p className="text-(--text-base) font-mono text-sm mt-1">{credentials.email}</p>
                </div>
                <div>
                  <label className="text-(--text-faint) text-xs uppercase tracking-wider font-medium">
                    Temporary Password
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-(--primary-green) font-mono text-lg font-bold tracking-wider">
                      {credentials.tempPassword}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(credentials.tempPassword)}
                      className="p-1.5 hover:bg-(--hover-subtle) rounded-lg text-(--text-muted) hover:text-(--primary-green) transition-colors"
                      title="Copy password"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-[rgba(255,191,0,0.06)] border border-[rgba(255,191,0,0.15)] rounded-lg px-4 py-3">
                <p className="text-amber-400 text-xs font-medium">
                  Please change this password after your first login via Firebase Console &gt;
                  Authentication.
                </p>
              </div>

              <button
                onClick={() => router.push("/login")}
                className="mt-6 w-full bg-(--primary-green) text-[#10221c] font-bold text-sm py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-(--text-faint) text-xs mt-6">academy.stemimpactcenterkenya.org</p>
      </div>
    </div>
  );
}
