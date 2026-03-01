"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MouseLogo from "@/components/MouseLogo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, joinClassroom, signInWithGoogle } = useAuth();
  const { refreshUser } = useAuthContext();

  const [classCode, setClassCode] = useState(["", "", "", "", "", ""]);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [classFound, setClassFound] = useState<{
    id: string;
    title: string;
    teacher: string;
    school: string;
    students: number;
  } | null>(null);
  const [classSearched, setClassSearched] = useState(false);

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

    // Auto-lookup when all 6 characters entered
    const newCode = next.join("");
    if (newCode.length === 6) {
      setClassSearched(false);
      try {
        const q = query(
          collection(db, "classrooms"),
          where("joinCode", "==", newCode)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setClassFound({
            id: snap.docs[0].id,
            title: data.name || data.title,
            teacher: data.teacherName || "Teacher",
            school: data.schoolName || "School",
            students: data.enrolled || 0,
          });
        } else {
          setClassFound(null);
        }
      } catch {
        setClassFound(null);
      }
      setClassSearched(true);
    } else {
      setClassSearched(false);
      setClassFound(null);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !classCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleJoinClassroom = async () => {
    if (!classFound) return;
    setLoading(true);
    setError("");
    try {
      await joinClassroom(codeStr);
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join classroom";
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

      // Fetch user role to redirect correctly
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          switch (role) {
            case "student":
              router.push("/student/dashboard");
              break;
            case "teacher":
              router.push("/teacher/dashboard");
              break;
            case "school_admin":
              router.push("/admin/school");
              break;
            case "admin":
            case "super_admin":
              router.push("/admin/global");
              break;
            default:
              router.push("/teacher/dashboard");
          }
        } else {
          router.push("/teacher/dashboard");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      await refreshUser();
      router.push("/teacher/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
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
        <MouseLogo />
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
        <div className="max-w-[520px] w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(19,236,164,0.1)] p-8 md:p-12 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[rgba(19,236,164,0.08)] border border-[rgba(19,236,164,0.15)] rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
              <span className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">Student Portal</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Welcome to STEM Learning
            </h1>
            <p className="text-slate-400 text-base">Ready to build the future? Enter your code below.</p>
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
              {/* Class Code Path */}
              <div className="mb-8">
                <label className="block text-[#13eca4] text-xs font-bold uppercase tracking-widest mb-5 text-center">
                  Unique Join Code
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

                {/* Class Found Preview Card */}
                {codeComplete && classSearched && (
                  <div className={`rounded-xl p-4 mb-5 border transition-all ${
                    classFound
                      ? "bg-[rgba(19,236,164,0.05)] border-[rgba(19,236,164,0.2)]"
                      : "bg-[rgba(255,77,77,0.05)] border-[rgba(255,77,77,0.2)]"
                  }`}>
                    {classFound ? (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(19,236,164,0.15)] flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-[#13eca4]">verified</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#13eca4] text-xs font-bold uppercase tracking-wide mb-1">Class Found</p>
                          <p className="text-white font-bold">{classFound.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5 rounded-full bg-[rgba(19,236,164,0.2)] flex items-center justify-center">
                              <span className="text-[#13eca4] text-[10px] font-bold">{classFound.teacher[0]}</span>
                            </div>
                            <span className="text-slate-400 text-xs">{classFound.teacher}</span>
                            <span className="text-slate-600 text-xs">·</span>
                            <span className="text-slate-500 text-xs">{classFound.students} students</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">{classFound.school}</p>
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
                  onClick={handleJoinClassroom}
                  disabled={loading || !classFound}
                  className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
                    codeComplete && classFound
                      ? "bg-[#13eca4] text-[#10221c] hover:shadow-[0_0_24px_rgba(19,236,164,0.4)]"
                      : "bg-[#13eca4]/50 text-[#10221c]/50 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : classFound ? (
                    "Confirm Enrollment"
                  ) : (
                    "Join Classroom"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]" />
                <span className="flex-shrink mx-4 text-slate-500 text-sm font-medium uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]" />
              </div>

              {/* Google Classroom */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 h-14 rounded-xl font-bold text-base hover:bg-slate-50 transition-colors shadow-sm border border-slate-200 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google Classroom
                </button>

                <div className="pt-4 text-center">
                  <button
                    onClick={() => { setEmailMode(true); setError(""); }}
                    className="text-slate-500 hover:text-[#13eca4] text-sm font-semibold flex items-center justify-center gap-2 mx-auto group transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                    Login with Email (Teachers &amp; Admins)
                  </button>
                </div>
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
                  <Link href="/contact" className="text-[#13eca4] text-sm hover:underline">
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
