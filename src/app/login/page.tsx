"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StemLogo from "@/components/StemLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { RoleDashboardMap } from "@/lib/constants";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { db, auth } from "@/lib/firebase";

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
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/popup-blocked":
        return "Pop-up blocked by your browser. Please allow pop-ups and try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, studentLookup, studentLogin } = useAuth();
  const { appUser, loading: authLoading, refreshUser } = useAuthContext();

  const [classCode, setClassCode] = useState(["", "", "", "", "", ""]);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users to their dashboard
  // Skip while a login is in progress (loading) to avoid fighting the form redirect
  useEffect(() => {
    if (!authLoading && !loading && appUser?.role) {
      const dest = RoleDashboardMap[appUser.role as keyof typeof RoleDashboardMap];
      if (dest) router.replace(dest);
    }
  }, [appUser, authLoading, loading, router]);
  const [studentFound, setStudentFound] = useState<{
    displayName: string;
    grade: string | null;
    schoolName: string;
  } | null>(null);
  const [studentSearched, setStudentSearched] = useState(false);
  const [codeLooking, setCodeLooking] = useState(false);

  const codeStr = classCode.join("");
  const codeComplete = codeStr.length === 6;

  const handleCodeInput = async (index: number, val: string) => {
    const next = [...classCode];
    next[index] = val.slice(-1).toUpperCase();
    setClassCode(next);
    if (val && index < 5) {
      const el = document.getElementById(`code-${index + 1}`);
      el?.focus();
    }

    const newCode = next.join("");
    if (newCode.length === 6) {
      setStudentSearched(false);
      setCodeLooking(true);
      try {
        const student = await studentLookup(newCode);
        setStudentFound(student);
      } catch {
        setStudentFound(null);
      }
      setCodeLooking(false);
      setStudentSearched(true);
    } else {
      setStudentSearched(false);
      setStudentFound(null);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !classCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      next[i] = pasted[i];
    }
    setClassCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`code-${focusIdx}`)?.focus();
    if (pasted.length === 6) {
      setStudentSearched(false);
      setCodeLooking(true);
      studentLookup(pasted).then((student) => {
        setStudentFound(student);
        setCodeLooking(false);
        setStudentSearched(true);
      }).catch(() => {
        setStudentFound(null);
        setCodeLooking(false);
        setStudentSearched(true);
      });
    }
  };

  const handleStudentLogin = async () => {
    if (!studentFound) return;
    setLoading(true);
    setError("");
    try {
      await studentLogin(codeStr);
      router.push("/school/student/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to log in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      await refreshUser();

      // Redirect based on role using centralized map
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : "teacher";
        const dest = RoleDashboardMap[role as keyof typeof RoleDashboardMap]
          ?? RoleDashboardMap.teacher;
        router.push(dest);
      }
    } catch (err: unknown) {
      setError(friendlyFirebaseError(err));
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[rgba(19,236,164,0.08)] border border-[rgba(19,236,164,0.15)] rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
              <span className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">
                {emailMode ? "Staff Login" : "Student Portal"}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {emailMode ? "Sign In to Your Account" : "Welcome to STEM Learning"}
            </h1>
            <p className="text-slate-400 text-base">
              {emailMode
                ? "Enter your credentials to access the platform."
                : "Ready to build the future? Enter your code below."}
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ff4d4d] text-lg">error</span>
              <p className="text-[#ff4d4d] text-sm font-medium">{error}</p>
            </div>
          )}

          {!emailMode ? (
            <>
              {/* Student Code Login */}
              <div className="mb-8">
                <label className="block text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-5 text-center">
                  Your Student Code
                </label>
                <div className="flex justify-center gap-2 md:gap-3 mb-5">
                  {classCode.map((val, i) => (
                    <span key={i} className="flex items-center">
                      {i === 3 && (
                        <span className="text-slate-500 font-bold mr-2 md:mr-3 text-xl select-none">—</span>
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

                {/* Loading indicator */}
                {codeLooking && (
                  <div className="flex items-center justify-center gap-2 mb-5 py-3">
                    <span className="material-symbols-outlined animate-spin text-[#13eca4] text-lg">progress_activity</span>
                    <span className="text-slate-400 text-sm">Finding your profile...</span>
                  </div>
                )}

                {/* Student Found Preview Card */}
                {codeComplete && studentSearched && !codeLooking && (
                  <div className={`rounded-xl p-4 mb-5 border transition-all ${
                    studentFound
                      ? "bg-[rgba(19,236,164,0.05)] border-[rgba(19,236,164,0.2)]"
                      : "bg-[rgba(255,77,77,0.05)] border-[rgba(255,77,77,0.2)]"
                  }`}>
                    {studentFound ? (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center shrink-0">
                          <span className="text-[#13eca4] text-sm font-bold">
                            {studentFound.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#13eca4] text-xs font-bold uppercase tracking-wide mb-1">Welcome back!</p>
                          <p className="text-white font-bold text-lg">{studentFound.displayName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {studentFound.grade && (
                              <>
                                <span className="text-slate-400 text-xs">{studentFound.grade}</span>
                                <span className="text-slate-600 text-xs">·</span>
                              </>
                            )}
                            <span className="text-slate-500 text-xs">{studentFound.schoolName}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-[#ff4d4d]">error</span>
                        <p className="text-[#ff4d4d] text-sm font-semibold">Code not found. Check with your teacher.</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleStudentLogin}
                  disabled={loading || !studentFound}
                  className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    codeComplete && studentFound
                      ? "bg-[#13eca4] text-[#10221c] hover:opacity-90 shadow-lg shadow-[rgba(19,236,164,0.2)]"
                      : "bg-[#13eca4]/30 text-[#10221c]/50 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[#10221c]">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                      {studentFound ? "Start Learning" : "Enter Your Code"}
                    </>
                  )}
                </button>
              </div>

              {/* Teacher/Admin login link */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => { setEmailMode(true); setError(""); }}
                  className="text-slate-500 hover:text-[#13eca4] text-sm font-semibold flex items-center justify-center gap-2 mx-auto group transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Login with Email (Teachers &amp; Admins)
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Email Login */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className="form-input"
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Link href="/forgot-password" className="text-[#13eca4] text-sm hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleEmailLogin}
                    disabled={loading}
                    className="w-full bg-[#13eca4] text-[#10221c] h-14 rounded-xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
                <div className="pt-2 text-center">
                  <button
                    onClick={() => { setEmailMode(false); setError(""); }}
                    className="text-slate-500 hover:text-slate-300 text-sm transition-colors flex items-center gap-1 mx-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to student login
                  </button>
                </div>
              </div>
            </>
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
