"use client";

import { useState } from "react";
import Link from "next/link";
import StemLogo from "@/components/StemLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to send reset link. Please try again later.");
      }
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to send reset link. Please try again later.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-base) flex flex-col relative overflow-hidden">
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
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-(--border-accent) rounded-xl rotate-12 hidden lg:block animate-float" />
      <div
        className="absolute bottom-20 right-10 w-48 h-48 border-2 border-[rgba(255,77,77,0.15)] rounded-full hidden lg:block animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-20 py-4 border-b border-(--border-subtle) bg-[rgba(16,34,28,0.5)] backdrop-blur-md sticky top-0 z-50">
        <StemLogo />
        <div className="flex items-center gap-6">
          <Link
            href="/#curriculum"
            className="hidden md:block text-(--text-muted) text-sm font-medium hover:text-primary-green transition-colors"
          >
            Courses
          </Link>
          <Link
            href="/help"
            className="hidden md:block text-(--text-muted) text-sm font-medium hover:text-primary-green transition-colors"
          >
            Help Center
          </Link>
          <Link
            href="/login"
            className="bg-primary-green text-white text-sm font-bold px-5 h-10 flex items-center rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14 relative">
        <div className="max-w-130 w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-(--border-subtle) p-8 md:p-12 rounded-3xl shadow-2xl">
          {!sent ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-primary-green/8 border border-(--border-medium) rounded-full px-4 py-1.5 mb-4">
                  <span className="w-2 h-2 bg-primary-green rounded-full animate-pulse" />
                  <span className="text-primary-green text-xs font-bold uppercase tracking-widest">
                    Account Recovery
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-(--text-base) mb-3 tracking-tight">
                  Reset Your Password
                </h1>
                <p className="text-(--text-muted) text-base">
                  Enter the email address associated with your account and we&apos;ll send you a
                  link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-accent-red/10 border-l-4 border-accent-red flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-accent-red shrink-0 mt-0.5"
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
                  <p className="text-accent-red text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-(--text-muted) mb-2">
                    Email Address
                  </label>
                  <input
                    autoFocus
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className={`form-input ${error ? "!border-accent-red" : ""}`}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary-green text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
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
                    "Send Reset Link"
                  )}
                </button>
                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-(--text-faint) hover:text-(--text-muted) text-sm transition-colors inline-flex items-center gap-1"
                  >
                    &larr; Back to login
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-green/12 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-(--text-base) mb-3">Check Your Email</h2>
              <p className="text-(--text-muted) text-base mb-2 max-w-sm mx-auto">
                If an account exists for <strong className="text-(--text-base)">{email}</strong>, we&apos;ve
                sent a password reset link.
              </p>
              <p className="text-(--text-faint) text-sm mb-8 max-w-sm mx-auto">
                Don&apos;t forget to check your spam folder. The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-primary-green text-white h-14 px-8 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Back to Login
              </Link>
              <div className="mt-6">
                <button
                  onClick={() => setSent(false)}
                  className="text-(--text-faint) hover:text-primary-green text-sm transition-colors"
                >
                  Didn&apos;t receive the email? Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-10 flex gap-8 text-(--text-faint) text-sm font-medium">
          <Link href="/privacy" className="hover:text-(--text-muted) transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-(--text-muted) transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-(--text-muted) transition-colors">
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
