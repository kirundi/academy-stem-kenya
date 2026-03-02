"use client";

import { useState } from "react";
import StemLogo from "@/components/StemLogo";
import { useAuth } from "@/hooks/useAuth";

const STEP_LABELS = ["School Information", "Admin Account", "Submit Review"];

export default function OnboardingPage() {
  const { onboardSchool } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolType: "",
    location: "",
    studentCount: "",
    fullName: "",
    roleDesignation: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submittedData, setSubmittedData] = useState(formData);

  const handleSubmit = async () => {
    if (!formData.schoolName || !formData.email || !formData.password || !formData.fullName) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
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
      await onboardSchool({
        schoolName: formData.schoolName,
        schoolType: formData.schoolType,
        location: formData.location,
        studentCount: formData.studentCount,
        fullName: formData.fullName,
        roleDesignation: formData.roleDesignation,
        contactNumber: formData.contactNumber,
        email: formData.email,
        password: formData.password,
      });
      // Send welcome email (fire-and-forget)
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.email,
          schoolName: formData.schoolName,
          adminName: formData.fullName,
        }),
      }).catch(() => {});

      setSubmittedData(formData);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#10221c] flex items-start justify-center p-8">
        <div className="fixed inset-0 dot-pattern opacity-20" />
        <div className="relative w-full max-w-2xl">
          <div className="flex justify-center mb-10">
            <StemLogo size="lg" href="/" />
          </div>
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#f59e0b] text-[48px]">
                  hourglass_empty
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Registration Received
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              Under Review
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              A Global Administrator is reviewing your application to ensure it meets platform
              standards. You will receive a confirmation email once your account is approved.
            </p>
            <p className="text-slate-500 mt-4 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-base">schedule</span>
              Typical turnaround: 24–48 hours
            </p>
          </div>
          <div className="bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Submitted Details</h2>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">
                Pending Review
              </span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "School Name", value: submittedData.schoolName },
                { label: "Institution Type", value: submittedData.schoolType || "Not specified" },
                { label: "Admin Name", value: submittedData.fullName },
                { label: "Admin Role", value: submittedData.roleDesignation || "Administrator" },
                { label: "Location", value: submittedData.location || "Not specified" },
                { label: "Email", value: submittedData.email },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                    {r.label}
                  </p>
                  <p className="text-slate-100 font-medium">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-lg text-sm">
              <span className="material-symbols-outlined text-xl">book_5</span>Browse Curriculum
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-lg text-sm"
            >
              <span className="material-symbols-outlined text-xl">logout</span>Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StemLogo size="sm" href="/" />
        </div>
        <span className="text-xs font-bold text-slate-400 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-full">
          Guest Admin
        </span>
      </header>

      <div className="flex items-start justify-center p-8">
        <div className="fixed inset-0 dot-pattern opacity-30" />
        <div className="relative w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#13eca4] text-sm font-bold">Step {step} of 3</span>
              <span className="text-slate-400 text-xs">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#13eca4] to-[#0dd494] rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`text-xs font-semibold ${
                    i + 1 < step
                      ? "text-[#13eca4]"
                      : i + 1 === step
                        ? "text-white"
                        : "text-slate-600"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ff4d4d] text-lg">error</span>
              <p className="text-[#ff4d4d] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#1a2e27] rounded-3xl border border-[rgba(19,236,164,0.12)] shadow-2xl shadow-black/50 overflow-hidden">
            {/* Section 01 — School Details */}
            <div className="p-8 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-10 bg-[#13eca4] rounded-full" />
                <div>
                  <p className="text-[#13eca4] text-xs font-bold uppercase tracking-widest">
                    Section 01
                  </p>
                  <h2 className="text-xl font-bold text-white">School Details</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    School Name *
                  </label>
                  <input
                    className="form-input"
                    placeholder="e.g. Nairobi Junior Academy"
                    value={formData.schoolName}
                    onChange={(e) => setFormData((p) => ({ ...p, schoolName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    School Type
                  </label>
                  <select
                    className="form-input"
                    value={formData.schoolType}
                    onChange={(e) => setFormData((p) => ({ ...p, schoolType: e.target.value }))}
                  >
                    <option value="">Select institution type</option>
                    <option>Public School</option>
                    <option>Private School</option>
                    <option>Community Center</option>
                    <option>Afterschool Provider</option>
                    <option>NGO / Non-Profit</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Campus Location
                  </label>
                  <input
                    className="form-input"
                    placeholder="e.g. Nairobi, Kenya"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Estimated Student Count
                  </label>
                  <select
                    className="form-input"
                    value={formData.studentCount}
                    onChange={(e) => setFormData((p) => ({ ...p, studentCount: e.target.value }))}
                  >
                    <option value="">Select range</option>
                    <option>1–50</option>
                    <option>51–200</option>
                    <option>201–500</option>
                    <option>500+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 02 — Admin Account */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                <div>
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest">
                    Section 02
                  </p>
                  <h2 className="text-xl font-bold text-white">Administrator Account</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    className="form-input"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Role / Designation
                  </label>
                  <input
                    className="form-input"
                    placeholder="e.g. STEM Coordinator"
                    value={formData.roleDesignation}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, roleDesignation: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+254 7xx xxx xxx"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, contactNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="admin@stemimpactcenterkenya.org"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-semibold block mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                }}
                className="px-8 py-3.5 rounded-xl bg-[rgba(255,255,255,0.06)] text-slate-300 font-bold text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-[#13eca4] text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                ) : (
                  <>
                    Save &amp; Continue
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-5 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-2xl flex items-start gap-4">
            <span
              className="material-symbols-outlined text-red-400 text-[22px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <div>
              <p className="text-red-300 text-sm font-semibold mb-1">Security Notice</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your information is encrypted and stored securely. Admin credentials will only be
                used for account access. By submitting this form you agree to STEM Impact
                Academy&apos;s{" "}
                <a href="/terms" className="text-[#13eca4] underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-[#13eca4] underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
