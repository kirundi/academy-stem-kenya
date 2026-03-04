"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StemLogo from "@/components/StemLogo";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const { registerTeacher } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    school: "",
    city: "",
    role: "Teacher",
    subjects: [] as string[],
  });

  const subjects = [
    "Circuitry",
    "Coding",
    "Game Design",
    "Web Literacy",
    "Green Tech",
    "Robotics",
    "Cybersecurity",
  ];

  const toggleSubject = (s: string) => {
    setFormData((p) => ({
      ...p,
      subjects: p.subjects.includes(s) ? p.subjects.filter((x) => x !== s) : [...p.subjects, s],
    }));
  };

  const handleCreateAccount = async () => {
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await registerTeacher({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        school: formData.school,
        city: formData.city,
        role: formData.role,
        subjects: formData.subjects,
      });
      router.push("/school/teacher/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirm
    ) {
      setError("Please fill in all fields");
      return false;
    }
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!formData.school || !formData.city) {
      setError("Please fill in school name and city");
      return false;
    }
    setError("");
    return true;
  };

  return (
    <div className="min-h-screen bg-(--bg-page) flex items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 dot-pattern opacity-40" />
      <div
        className="fixed top-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #13eca4, transparent)" }}
      />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <StemLogo size="lg" href="/" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  s < step
                    ? "bg-[#13eca4] text-[#10221c]"
                    : s === step
                      ? "bg-[rgba(19,236,164,0.15)] border-2 border-[#13eca4] text-[#13eca4]"
                      : "bg-(--input-bg) text-(--text-faint)"
                }`}
              >
                {s < step ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${s < step ? "bg-[#13eca4]" : "bg-(--bg-elevated)"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-(--bg-card) rounded-3xl border border-(--border-medium) p-8 shadow-2xl shadow-black/50">
          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ff4d4d] text-lg">error</span>
              <p className="text-[#ff4d4d] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-(--text-base) mb-1">Create Your Account</h2>
              <p className="text-(--text-muted) text-sm mb-6">Join STEM Impact Academy as an educator</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                    First Name
                  </label>
                  <input
                    className="form-input"
                    placeholder="Sarah"
                    value={formData.firstName}
                    onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                    Last Name
                  </label>
                  <input
                    className="form-input"
                    placeholder="Johnson"
                    value={formData.lastName}
                    onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@stemimpactcenterkenya.org"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="mb-4">
                <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div className="mb-6">
                <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repeat password"
                  value={formData.confirm}
                  onChange={(e) => setFormData((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              <button
                onClick={() => validateStep1() && setStep(2)}
                className="w-full py-3.5 rounded-xl bg-[#13eca4] text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Continue →
              </button>
            </>
          )}

          {/* Step 2: School Info */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-(--text-base) mb-1">Your School</h2>
              <p className="text-(--text-muted) text-sm mb-6">Tell us where you teach</p>
              <div className="mb-4">
                <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                  School Name
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Nairobi Junior Academy"
                  value={formData.school}
                  onChange={(e) => setFormData((p) => ({ ...p, school: e.target.value }))}
                />
              </div>
              <div className="mb-4">
                <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                  City / County
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Nairobi"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div className="mb-6">
                <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                  Your Role
                </label>
                <select
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                >
                  <option>Teacher</option>
                  <option>Department Head</option>
                  <option>School Administrator</option>
                  <option>After-School Instructor</option>
                  <option>Community Educator</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl bg-(--input-bg) text-(--text-muted) font-bold text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => validateStep2() && setStep(3)}
                  className="flex-1 py-3.5 rounded-xl bg-[#13eca4] text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Subject Interests */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-(--text-base) mb-1">Your Subjects</h2>
              <p className="text-(--text-muted) text-sm mb-6">
                Select the areas you plan to teach (pick all that apply)
              </p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {subjects.map((s) => {
                  const active = formData.subjects.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSubject(s)}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all border ${
                        active
                          ? "bg-[rgba(19,236,164,0.1)] border-[#13eca4] text-[#13eca4]"
                          : "bg-(--glass-bg) border-(--border-subtle) text-(--text-muted) hover:text-(--text-base) hover:border-(--border-accent)"
                      }`}
                    >
                      {active && (
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                          check
                        </span>
                      )}
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-xl bg-(--input-bg) text-(--text-muted) font-bold text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-[#13eca4] text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-sm">
                      progress_activity
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-(--text-faint) text-xs mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#13eca4] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
