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
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="absolute bottom-20 right-10 w-48 h-48 border-2 border-[rgba(255,77,77,0.15)] rounded-full hidden lg:block animate-float" style={{ animationDelay: "1.5s" }} />

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-20 py-4 border-b border-[rgba(19,236,164,0.08)] bg-[rgba(16,34,28,0.5)] backdrop-blur-md sticky top-0 z-50">
        <StemLogo />
        <div className="flex items-center gap-6">
          <Link href="/#curriculum" className="hidden md:block text-slate-400 text-sm font-medium hover:text-[#13eca4] transition-colors">
            Courses
          </Link>
          <Link href="/help" className="hidden md:block text-slate-400 text-sm font-medium hover:text-[#13eca4] transition-colors">
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
          {!sent ? (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-[rgba(19,236,164,0.08)] border border-[rgba(19,236,164,0.15)] rounded-full px-4 py-1.5 mb-4">
                  <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
                  <span className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">Account Recovery</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  Reset Your Password
                </h1>
                <p className="text-slate-400 text-base">
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ff4d4d] text-lg">error</span>
                  <p className="text-[#ff4d4d] text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="form-input"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-[#13eca4] text-[#10221c] h-14 rounded-xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center gap-1 mx-auto justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-[#13eca4] text-5xl mb-4 block">mark_email_read</span>
              <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto">
                If an account exists for <strong className="text-white">{email}</strong>, we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-[#13eca4] text-[#10221c] h-14 px-8 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Back to Login
              </Link>
              <div className="mt-6">
                <button
                  onClick={() => setSent(false)}
                  className="text-slate-500 hover:text-[#13eca4] text-sm transition-colors"
                >
                  Didn&apos;t receive the email? Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-10 flex gap-8 text-slate-500 text-sm font-medium">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact Support</Link>
        </div>
      </main>
    </div>
  );
}
