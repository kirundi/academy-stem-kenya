"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/contexts/AuthContext";
import { RoleDashboardMap } from "@/lib/constants";
import StemLogo from "@/components/StemLogo";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { firebaseUser, appUser, loading } = useAuthContext();
  // Prevents the unauthenticated useEffect from firing after updatePassword()
  // briefly triggers an auth state change.
  const passwordChanged = useRef(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Redirect unauthenticated users. Never auto-redirect authenticated users
  // away from this page — that would race against handleSubmit's session refresh.
  useEffect(() => {
    if (loading) return;
    if (!firebaseUser && !passwordChanged.current) {
      router.replace("/login?mode=email");
    }
  }, [firebaseUser, loading, router]);

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 8) return { label: "Too short", color: "#ff4d4d", width: "25%" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 2) return { label: "Weak", color: "#f97316", width: "50%" };
    if (score === 3) return { label: "Good", color: "#eab308", width: "75%" };
    return { label: "Strong", color: "#13eca4", width: "100%" };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!firebaseUser || !firebaseUser.email) {
      setError("No authenticated user found. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Re-authenticate with the current (temp) password before changing.
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // 2. Update the password in Firebase Auth (invalidates the old token).
      await updatePassword(firebaseUser, newPassword);

      // 3. Get a fresh token immediately — must happen before any redirect triggers.
      const freshToken = await firebaseUser.getIdToken(true);

      // 4. Clear requiresPasswordChange in Firestore before refreshing the session.
      //    This prevents AuthContext from re-triggering the redirect race.
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        requiresPasswordChange: false,
      });

      // 5. Refresh the session cookie with the new token.
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: freshToken }),
      });
      if (!sessionRes.ok) {
        const data = await sessionRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to refresh session");
      }

      // 6. Block the unauthenticated useEffect from firing a spurious redirect.
      passwordChanged.current = true;

      // 7. Navigate to the role-specific dashboard — not a hardcoded path.
      const role = appUser?.role;
      const dest = role ? RoleDashboardMap[role as keyof typeof RoleDashboardMap] : "/login";
      router.replace(dest);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters with mixed types.");
      } else if (code === "auth/requires-recent-login") {
        setError("Session expired. Please log out and log in again to change your password.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to update password. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10221c] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[#13eca4] text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c] text-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[rgba(19,236,164,0.06)] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[rgba(255,77,77,0.05)] rounded-full blur-[120px]" />
      </div>

      <header className="flex items-center justify-between px-6 md:px-20 py-4 border-b border-[rgba(19,236,164,0.08)] bg-[rgba(16,34,28,0.5)] backdrop-blur-md sticky top-0 z-50">
        <StemLogo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        <div className="max-w-md w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(19,236,164,0.1)] p-8 md:p-10 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.2)] mb-4">
              <span className="material-symbols-outlined text-[#13eca4] text-2xl">lock_reset</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-[rgba(19,236,164,0.08)] border border-[rgba(19,236,164,0.15)] rounded-full px-4 py-1.5 mb-3">
              <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
              <span className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">
                Security Setup
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Set Your Password</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              You&apos;re logged in with a temporary password.
              <br />
              Please set a new secure password to continue.
            </p>
            {firebaseUser?.email && (
              <p className="mt-3 text-xs text-slate-500 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 inline-block">
                {firebaseUser.email}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ff4d4d] text-lg shrink-0">error</span>
              <p className="text-[#ff4d4d] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Current (Temporary) Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  required
                  autoComplete="current-password"
                  className="form-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showCurrent ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="form-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showNew ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  autoComplete="new-password"
                  className="form-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={`text-xs mt-1 font-medium ${newPassword === confirmPassword ? "text-[#13eca4]" : "text-[#ff4d4d]"}`}
                >
                  {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4">
              {[
                { label: "At least 8 characters", met: newPassword.length >= 8 },
                { label: "Uppercase letter (A–Z)", met: /[A-Z]/.test(newPassword) },
                { label: "Lowercase letter (a–z)", met: /[a-z]/.test(newPassword) },
                { label: "Number (0–9)", met: /[0-9]/.test(newPassword) },
              ].map(({ label, met }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 transition-colors ${met ? "text-[#13eca4]" : "text-slate-500"}`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {met ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <button
              type="submit"
              disabled={
                submitting ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword ||
                !currentPassword
              }
              className="w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all bg-[#13eca4] text-[#10221c] hover:opacity-90 shadow-lg shadow-[rgba(19,236,164,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  Set New Password
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
