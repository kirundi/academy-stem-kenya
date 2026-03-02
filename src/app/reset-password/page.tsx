"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import StemLogo from "@/components/StemLogo";
import { auth } from "@/lib/firebase";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  useEffect(() => {
    async function verify() {
      if (!oobCode) {
        setCodeError(true);
        setVerifying(false);
        return;
      }
      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setVerifiedEmail(email);
      } catch {
        setCodeError(true);
      } finally {
        setVerifying(false);
      }
    }
    verify();
  }, [oobCode]);

  const handleReset = async () => {
    if (!password || !confirm) {
      setError("Please fill in both fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (verifying) {
      return (
        <div className="text-center py-12">
          <svg
            className="w-10 h-10 text-[#13eca4] animate-spin mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-slate-400 text-base">Verifying your reset link...</p>
        </div>
      );
    }

    if (codeError) {
      return (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,77,77,0.12)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#ff4d4d]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.181 8.68a3.75 3.75 0 00-5.32 0l-4.5 4.5a3.75 3.75 0 005.32 5.32l.535-.536m2.605-6.784a3.75 3.75 0 015.32 0l4.5 4.5a3.75 3.75 0 01-5.32 5.32l-.536-.535M6.75 6.75l10.5 10.5"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Invalid or Expired Link</h2>
          <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
            This password reset link is no longer valid. It may have expired or already been used.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center bg-[#13eca4] text-[#10221c] h-14 px-8 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Request a New Link
          </Link>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      );
    }

    if (success) {
      return (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(19,236,164,0.12)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#13eca4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Password Reset Complete</h2>
          <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-[#13eca4] text-[#10221c] h-14 px-8 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[rgba(19,236,164,0.08)] border border-[rgba(19,236,164,0.15)] rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
            <span className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">
              Password Reset
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Create New Password</h1>
          <p className="text-slate-400 text-base">
            Enter a new password for <strong className="text-white">{verifiedEmail}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border-l-4 border-[#ff4d4d] flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#ff4d4d] shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-[#ff4d4d] text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("confirm-pw")?.focus()}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-pw"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              onKeyDown={(e) => e.key === "Enter" && handleReset()}
            />
            <p className="text-slate-500 text-xs mt-2">Password must be at least 8 characters</p>
          </div>
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-[#13eca4] text-[#10221c] h-14 rounded-xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              "Reset Password"
            )}
          </button>
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors inline-flex items-center gap-1"
            >
              &larr; Back to login
            </Link>
          </div>
        </div>
      </>
    );
  };

  return renderContent();
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#10221c] text-white flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[rgba(19,236,164,0.06)] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[rgba(255,77,77,0.05)] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Decorative borders */}
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-[rgba(19,236,164,0.2)] rounded-xl rotate-12 hidden lg:block animate-float" />
      <div
        className="absolute bottom-20 right-10 w-48 h-48 border-2 border-[rgba(255,77,77,0.15)] rounded-full hidden lg:block animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-20 py-4 border-b border-[rgba(19,236,164,0.08)] bg-[rgba(16,34,28,0.5)] backdrop-blur-md sticky top-0 z-50">
        <StemLogo />
        <div className="flex items-center gap-6">
          <Link
            href="/#curriculum"
            className="hidden md:block text-slate-400 text-sm font-medium hover:text-[#13eca4] transition-colors"
          >
            Courses
          </Link>
          <Link
            href="/help"
            className="hidden md:block text-slate-400 text-sm font-medium hover:text-[#13eca4] transition-colors"
          >
            Help Center
          </Link>
          <Link
            href="/login"
            className="bg-[#13eca4] text-[#10221c] text-sm font-bold px-5 h-10 flex items-center rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14 relative">
        <div className="max-w-130 w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(19,236,164,0.1)] p-8 md:p-12 rounded-3xl shadow-2xl">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <svg
                  className="w-10 h-10 text-[#13eca4] animate-spin mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <p className="text-slate-400 text-base">Loading...</p>
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>

        {/* Footer links */}
        <div className="mt-10 flex gap-8 text-slate-500 text-sm font-medium">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-slate-300 transition-colors">
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
