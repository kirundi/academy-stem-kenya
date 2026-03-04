"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { RoleDashboardMap } from "@/lib/constants";
import StemLogo from "@/components/StemLogo";

const ROLE_LABELS: Record<string, string> = {
  teacher: "Teacher",
  school_admin: "School Administrator",
  admin: "Platform Administrator",
  super_admin: "Super Administrator",
};

interface InviteDetails {
  email: string;
  displayName: string;
  role: string;
  invitedByName: string;
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitted = useRef(false);

  // Validate the token on mount.
  useEffect(() => {
    if (!token) {
      setValidationError("No invite token found in this link.");
      setValidating(false);
      return;
    }

    fetch(`/api/auth/accept-invite?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setInvite({
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            invitedByName: data.invitedByName,
          });
        } else {
          setValidationError(data.error ?? "Invalid invite link.");
        }
      })
      .catch(() => setValidationError("Failed to validate invite. Please try again."))
      .finally(() => setValidating(false));
  }, [token]);

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 8) return { label: "Too short", color: "#ff4d4d", width: "25%" };
    const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
    if (score <= 2) return { label: "Weak", color: "#f97316", width: "50%" };
    if (score === 3) return { label: "Good", color: "#eab308", width: "75%" };
    return { label: "Strong", color: "#13eca4", width: "100%" };
  };

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted.current) return;
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to accept invite");
      }

      // Exchange custom token for Firebase ID token.
      const cred = await signInWithCustomToken(auth, data.customToken);
      const idToken = await cred.user.getIdToken(true);

      // Create the session cookie.
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!sessionRes.ok) {
        throw new Error("Failed to create session. Please try logging in.");
      }

      submitted.current = true;
      const dest = data.role
        ? RoleDashboardMap[data.role as keyof typeof RoleDashboardMap]
        : "/login";
      router.replace(dest);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-base) flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[rgba(19,236,164,0.06)] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[rgba(255,77,77,0.05)] rounded-full blur-[120px]" />
      </div>

      <header className="flex items-center px-6 md:px-20 py-4 border-b border-(--border-subtle) bg-[rgba(16,34,28,0.5)] backdrop-blur-md sticky top-0 z-50">
        <StemLogo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        <div className="max-w-md w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-(--border-subtle) p-8 md:p-10 rounded-3xl shadow-2xl">
          {/* Loading state */}
          {validating && (
            <div className="flex flex-col items-center py-8 gap-4">
              <span className="material-symbols-outlined animate-spin text-primary-green text-4xl">
                progress_activity
              </span>
              <p className="text-(--text-muted) text-sm">Validating your invite...</p>
            </div>
          )}

          {/* Validation error */}
          {!validating && validationError && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-red/10 border border-[rgba(255,77,77,0.2)] mb-4">
                <span className="material-symbols-outlined text-accent-red text-2xl">link_off</span>
              </div>
              <h1 className="text-xl font-bold text-(--text-base) mb-2">Invite Link Invalid</h1>
              <p className="text-(--text-muted) text-sm leading-relaxed">{validationError}</p>
              <a
                href="/login"
                className="mt-6 inline-block text-primary-green text-sm font-semibold hover:underline"
              >
                Go to Login
              </a>
            </div>
          )}

          {/* Invite form */}
          {!validating && invite && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-green/10 border border-(--border-accent) mb-4">
                  <span className="material-symbols-outlined text-primary-green text-2xl">
                    mark_email_read
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-primary-green/8 border border-(--border-medium) rounded-full px-4 py-1.5 mb-3">
                  <span className="w-2 h-2 bg-primary-green rounded-full animate-pulse" />
                  <span className="text-primary-green text-xs font-bold uppercase tracking-widest">
                    Invitation
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-(--text-base) mb-1">
                  Welcome, {invite.displayName}!
                </h1>
                <p className="text-(--text-muted) text-sm">
                  <strong>{invite.invitedByName}</strong> invited you as{" "}
                  <strong className="text-(--text-base)">{ROLE_LABELS[invite.role] ?? invite.role}</strong>
                </p>
                <p className="mt-3 text-xs text-(--text-faint) bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-3 py-2 inline-block">
                  {invite.email}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-accent-red/10 border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-accent-red text-lg shrink-0">
                    error
                  </span>
                  <p className="text-accent-red text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-(--text-muted) mb-2">
                    Choose a Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      className="form-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-faint) hover:text-(--text-muted) transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="h-1 w-full bg-(--input-bg) rounded-full overflow-hidden">
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
                  <label className="block text-sm font-semibold text-(--text-muted) mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                      className="form-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-faint) hover:text-(--text-muted) transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-xs mt-1 font-medium ${
                        password === confirmPassword ? "text-primary-green" : "text-accent-red"
                      }`}
                    >
                      {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || password.length < 8 || password !== confirmPassword}
                  className="w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all bg-primary-green text-white hover:opacity-90 shadow-lg shadow-primary-green/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      Accept &amp; Continue
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteContent />
    </Suspense>
  );
}
