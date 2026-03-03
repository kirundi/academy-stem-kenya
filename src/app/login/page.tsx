"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StemLogo from "@/components/StemLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { RoleDashboardMap } from "@/lib/constants";
import { FirebaseError } from "firebase/app";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function friendlyFirebaseError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact your administrator.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network error. Check your internet connection and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

const LOGIN_MODE_COOKIE = "__login_mode";

function readLoginModeCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(LOGIN_MODE_COOKIE + "=email"));
}

function setLoginModeCookie(email: boolean) {
  if (typeof document === "undefined") return;
  if (email) {
    document.cookie = `${LOGIN_MODE_COOKIE}=email; path=/; samesite=lax`;
  } else {
    document.cookie = `${LOGIN_MODE_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const { signIn, studentVerify, studentLogin, signOut } = useAuth();
  const { appUser, loading: authLoading } = useAuthContext();

  // Mode: false = student (code + name), true = staff (email + password).
  // Persisted in a cookie so bookmarks and email client link-stripping don't
  // dump staff on the student form.
  const [emailMode, setEmailMode] = useState(false);
  useEffect(() => {
    if (readLoginModeCookie()) setEmailMode(true);
  }, []);

  const switchMode = (toEmail: boolean) => {
    setEmailMode(toEmail);
    setLoginModeCookie(toEmail);
    setError("");
    setClassCode(["", "", "", "", "", ""]);
    setFirstName("");
    setVerifiedStudent(null);
  };

  // Student form state
  const [classCode, setClassCode] = useState(["", "", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState<{
    displayName: string;
    grade: string | null;
    schoolName: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Staff form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Shared state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const redirected = useRef(false);

  // Auto-redirect already-authenticated users to their dashboard.
  useEffect(() => {
    if (authLoading || loading || redirected.current || error) return;
    if (!appUser?.role) return;
    // If ?from= is present, the middleware bounced us back because the server
    // session cookie is expired while Firebase client still has stale auth.
    // Sign out the client to break the redirect loop and show the login form.
    if (new URLSearchParams(window.location.search).has("from")) {
      signOut().catch(() => {});
      router.replace("/login");
      return;
    }
    const dest = RoleDashboardMap[appUser.role as keyof typeof RoleDashboardMap];
    if (!dest) return;
    redirected.current = true;
    router.replace(dest);
  }, [appUser, authLoading, error, loading, router, signOut]);

  // ---------------------------------------------------------------------------
  // Student handlers
  // ---------------------------------------------------------------------------

  const codeStr = classCode.join("");
  const codeComplete = codeStr.length === 6;
  const formReady = codeComplete && firstName.trim().length > 0;

  // Auto-verify student when code is complete and name is filled
  useEffect(() => {
    if (emailMode || !formReady || verifiedStudent || verifying) return;
    handleVerifyStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formReady, emailMode]);

  const handleCodeInput = (index: number, val: string) => {
    const next = [...classCode];
    next[index] = val.slice(-1).toUpperCase();
    setClassCode(next);
    if (val && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
    if (verifiedStudent) setVerifiedStudent(null);
    if (error) setError("");
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !classCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length && i < 6; i++) next[i] = pasted[i];
    setClassCode(next);
    document.getElementById(`code-${Math.min(pasted.length, 5)}`)?.focus();
    if (verifiedStudent) setVerifiedStudent(null);
  };

  const handleVerifyStudent = async () => {
    if (!formReady) return;
    setVerifying(true);
    setError("");
    try {
      const student = await studentVerify(codeStr, firstName.trim());
      setVerifiedStudent(student);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
      setVerifiedStudent(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleStudentLogin = async () => {
    if (!verifiedStudent) return;
    setLoading(true);
    setError("");
    try {
      await studentLogin(codeStr, firstName.trim());
      redirected.current = true;
      router.push("/school/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Staff handlers
  // ---------------------------------------------------------------------------

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { role, requiresPasswordChange } = await signIn(email, password, remember);
      redirected.current = true;
      if (requiresPasswordChange) {
        router.push("/auth/change-password");
        return;
      }
      const dest =
        role && role in RoleDashboardMap
          ? RoleDashboardMap[role as keyof typeof RoleDashboardMap]
          : "/dashboard";
      router.push(dest);
    } catch (err) {
      try {
        await signOut();
      } catch {
        /* ignore */
      }
      setError(friendlyFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            href="/register/teacher"
            className="bg-[#13eca4] text-[#10221c] text-sm font-bold px-5 h-10 flex items-center rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14 relative">
        <div className="max-w-130 w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(19,236,164,0.1)] p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* Mode tab toggle — no URL param, no fragile query string */}
          <div className="flex rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] p-1 mb-8">
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${
                !emailMode
                  ? "bg-[#13eca4] text-[#10221c] shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Student Code
            </button>
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${
                emailMode ? "bg-[#13eca4] text-[#10221c] shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Email Login
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {emailMode ? "Sign In to Your Account" : "Welcome to STEM Learning"}
            </h1>
            <p className="text-slate-400 text-base">
              {emailMode
                ? "Enter your credentials to access the platform."
                : "Ready to build the future? Enter your code and first name below."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ff4d4d] text-lg">error</span>
              <p className="text-[#ff4d4d] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STUDENT FORM                                                        */}
          {/* ------------------------------------------------------------------ */}
          {!emailMode && (
            <div className="mb-8">
              <label className="block text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-1 text-center">
                Your Student Code
              </label>
              <p className="text-slate-500 text-xs text-center mb-5">
                Your teacher will give you this code
              </p>
              <div className="flex justify-center gap-2 md:gap-3 mb-6">
                {classCode.map((val, i) => (
                  <span key={i} className="flex items-center">
                    {i === 3 && (
                      <span className="text-slate-500 font-bold mr-2 md:mr-3 text-xl select-none">
                        —
                      </span>
                    )}
                    <input
                      id={`code-${i}`}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      onPaste={handleCodePaste}
                      placeholder="·"
                      className={`w-12 md:w-14 h-16 text-center bg-[rgba(255,255,255,0.06)] border-2 text-2xl font-bold text-white rounded-xl transition-all outline-none placeholder-slate-600 ${
                        val
                          ? "border-[#13eca4] bg-[rgba(19,236,164,0.08)]"
                          : "border-[rgba(255,255,255,0.1)] focus:border-[#13eca4] focus:bg-[rgba(19,236,164,0.04)]"
                      }`}
                    />
                  </span>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-2 text-center">
                  Your First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (verifiedStudent) setVerifiedStudent(null);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (verifiedStudent) handleStudentLogin();
                      else if (formReady) handleVerifyStudent();
                    }
                  }}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  className={`w-full h-14 bg-[rgba(255,255,255,0.06)] border-2 rounded-xl px-4 text-lg font-medium text-white placeholder-slate-600 outline-none transition-all ${
                    firstName.trim()
                      ? "border-[#13eca4] bg-[rgba(19,236,164,0.08)]"
                      : "border-[rgba(255,255,255,0.1)] focus:border-[#13eca4] focus:bg-[rgba(19,236,164,0.04)]"
                  }`}
                />
              </div>

              {verifiedStudent && (
                <div className="rounded-xl p-4 mb-6 border bg-[rgba(19,236,164,0.05)] border-[rgba(19,236,164,0.2)]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center shrink-0">
                      <span className="text-[#13eca4] text-sm font-bold">
                        {verifiedStudent.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[#13eca4] text-xs font-bold uppercase tracking-wide mb-1">
                        Welcome back!
                      </p>
                      <p className="text-white font-bold text-lg">{verifiedStudent.displayName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {verifiedStudent.grade && (
                          <>
                            <span className="text-slate-400 text-xs">{verifiedStudent.grade}</span>
                            <span className="text-slate-600 text-xs">·</span>
                          </>
                        )}
                        <span className="text-slate-500 text-xs">{verifiedStudent.schoolName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {verifiedStudent ? (
                <button
                  onClick={handleStudentLogin}
                  disabled={loading}
                  className="w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all bg-[#13eca4] text-[#10221c] hover:opacity-90 shadow-lg shadow-[rgba(19,236,164,0.2)] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[#10221c]">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                      Start Learning
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleVerifyStudent}
                  disabled={verifying || !formReady}
                  className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    formReady
                      ? "bg-[#13eca4] text-[#10221c] hover:opacity-90 shadow-lg shadow-[rgba(19,236,164,0.2)]"
                      : "bg-[#13eca4]/30 text-[#10221c]/50 cursor-not-allowed"
                  }`}
                >
                  {verifying ? (
                    <span className="material-symbols-outlined animate-spin text-[#10221c]">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                      Start Learning
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STAFF FORM                                                          */}
          {/* ------------------------------------------------------------------ */}
          {emailMode && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailLogin();
              }}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="form-input"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="form-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] accent-[#13eca4] cursor-pointer"
                  />
                  <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors select-none">
                    Remember this device
                  </span>
                </label>
                <Link href="/forgot-password" className="text-[#13eca4] text-sm hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#13eca4] text-[#10221c] h-14 rounded-xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Register link */}
              <p className="text-center text-sm text-slate-500">
                New here?{" "}
                <Link
                  href="/register/teacher"
                  className="text-[#13eca4] font-semibold hover:underline"
                >
                  Register as a teacher
                </Link>
              </p>
            </form>
          )}
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
