"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StemLogo from "@/components/StemLogo";

const STEP_LABELS = ["School Information", "Admin Account", "Review & Submit"];
const DRAFT_TOKEN_KEY = "stemimpact_draft_token";

interface FormData {
  schoolName: string;
  schoolType: string;
  location: string;
  studentCount: string;
  fullName: string;
  roleDesignation: string;
  contactNumber: string;
  email: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const EMPTY_FORM: FormData = {
  schoolName: "",
  schoolType: "",
  location: "",
  studentCount: "",
  fullName: "",
  roleDesignation: "",
  contactNumber: "",
  email: "",
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-(--accent-red) text-xs font-medium flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">error</span>
      {msg}
    </p>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [submittedData, setSubmittedData] = useState<FormData>(EMPTY_FORM);
  // Plaintext draft token kept in state + sessionStorage for the submit call to use.
  const [draftToken, setDraftToken] = useState<string | null>(null);

  // ── Pre-fill from landing page CTA form ────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("stemimpact_prefill");
      if (raw) {
        const prefill = JSON.parse(raw) as Partial<FormData>;
        setFormData((p) => ({
          ...p,
          fullName: prefill.fullName ?? "",
          email: prefill.email ?? "",
          schoolName: prefill.schoolName ?? "",
          roleDesignation: prefill.roleDesignation ?? "",
        }));
        localStorage.removeItem("stemimpact_prefill");
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  // ── Resume from email link ──────────────────────────────────────────────
  // Handles /onboarding?resume=<token> — also falls back to sessionStorage
  // in case the user refreshes after reaching step 3.
  useEffect(() => {
    const urlToken = searchParams.get("resume");
    const storedToken = sessionStorage.getItem(DRAFT_TOKEN_KEY);
    const token = urlToken ?? storedToken;
    if (!token) return;

    setResumeLoading(true);
    fetch(`/api/schools/apply/draft?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setResumeError(data.error ?? "Unable to load saved draft.");
          // Clear stale token
          sessionStorage.removeItem(DRAFT_TOKEN_KEY);
          return;
        }
        setFormData((p) => ({ ...p, ...data }));
        setDraftToken(token);
        sessionStorage.setItem(DRAFT_TOKEN_KEY, token);
        setStep(3); // jump straight to the review step
      })
      .catch(() => setResumeError("Network error loading saved draft."))
      .finally(() => setResumeLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateStep1 = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!formData.schoolName.trim()) errs.schoolName = "School name is required.";
    if (!formData.schoolType) errs.schoolType = "Please select an institution type.";
    if (!formData.location.trim()) errs.location = "Campus location is required.";
    if (!formData.studentCount) errs.studentCount = "Please select an estimated student count.";
    return errs;
  };

  const validateStep2 = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required.";
    if (!formData.roleDesignation.trim()) errs.roleDesignation = "Role / designation is required.";
    if (!formData.contactNumber.trim()) errs.contactNumber = "Contact number is required.";
    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Enter a valid email address.";
    }
    return errs;
  };

  const handleNext = async () => {
    setError("");
    if (step === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setError("Please complete all required fields before continuing.");
        return;
      }
      setFieldErrors({});
      setStep(2);
    } else if (step === 2) {
      const errs = validateStep2();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setError("Please complete all required fields before continuing.");
        return;
      }
      setFieldErrors({});

      // ── Auto-save draft and send "complete registration" email ──────────
      // Non-blocking: we proceed to step 3 regardless of whether this succeeds.
      // If it fails the user can still submit — they just won't get the resume email.
      fetch("/api/schools/apply/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              setDraftToken(data.token);
              sessionStorage.setItem(DRAFT_TOKEN_KEY, data.token);
            }
          }
        })
        .catch((err) => console.error("Draft save failed:", err));

      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/schools/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, draftToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }
      sessionStorage.removeItem(DRAFT_TOKEN_KEY);
      setSubmittedData(formData);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for input class with error state
  const inputCls = (field: keyof FormData) =>
    `form-input${fieldErrors[field] ? " !border-(--accent-red) focus:!border-(--accent-red)" : ""}`;

  // ── Resume loading screen ──────────────────────────────────────────────
  if (resumeLoading) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
            progress_activity
          </span>
          <p className="text-(--text-muted) text-sm mt-4">Loading your saved application…</p>
        </div>
      </div>
    );
  }

  // ── Post-submit success ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-start justify-center p-8">
        <div className="fixed inset-0 dot-pattern opacity-20" />
        <div className="relative w-full max-w-2xl">
          <div className="flex justify-center mb-10">
            <StemLogo size="lg" href="/" />
          </div>
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-[#f59e0b] text-[48px]">
                hourglass_empty
              </span>
            </div>
            <h1 className="text-4xl font-black text-(--text-base) leading-tight mb-4">
              Registration Received
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              Under Review
            </div>
            <p className="text-(--text-muted) text-lg leading-relaxed max-w-xl">
              A Global Administrator is reviewing your application to ensure it meets platform
              standards. Once approved, you will receive an email invite to set up your account
              password and access your dashboard.
            </p>
            <p className="text-(--text-faint) mt-4 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-base">schedule</span>
              Typical turnaround: 24–48 hours
            </p>
          </div>
          <div className="bg-(--bg-card) border border-(--border-subtle) rounded-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-(--border-subtle) flex justify-between items-center">
              <h2 className="text-(--text-base) font-bold text-lg">Submitted Details</h2>
              <span className="text-(--text-faint) text-xs font-medium uppercase tracking-widest">
                Pending Review
              </span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "School Name", value: submittedData.schoolName },
                { label: "Institution Type", value: submittedData.schoolType },
                { label: "Admin Name", value: submittedData.fullName },
                { label: "Admin Role", value: submittedData.roleDesignation },
                { label: "Location", value: submittedData.location },
                { label: "Email", value: submittedData.email },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-(--text-faint) text-xs font-bold uppercase tracking-wider mb-1">
                    {r.label}
                  </p>
                  <p className="text-(--text-base) font-medium">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6">
            <Link
              href="/#curriculum"
              className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-base) transition-colors py-2 px-4 rounded-lg text-sm"
            >
              <span className="material-symbols-outlined text-xl">book_5</span>
              Browse Curriculum
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-(--text-muted) hover:text-(--text-base) transition-colors py-2 px-4 rounded-lg text-sm"
            >
              <span className="material-symbols-outlined text-xl">home</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Multi-step form ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-20 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <StemLogo size="sm" href="/" />
        <span className="text-xs font-bold text-(--text-muted) bg-(--input-bg) border border-(--border-subtle) px-3 py-1.5 rounded-full">
          Guest Admin
        </span>
      </header>

      <div className="flex items-start justify-center p-8">
        <div className="fixed inset-0 dot-pattern opacity-30" />
        <div className="relative w-full max-w-2xl">

          {/* Resume error banner */}
          {resumeError && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-400 text-lg">warning</span>
              <p className="text-amber-300 text-sm font-medium">{resumeError} Please fill in your details below.</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-(--primary-green) text-sm font-bold">Step {step} of 3</span>
              <span className="text-(--text-muted) text-xs">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="h-2 bg-(--input-bg) rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-(--primary-green) to-(--primary-green-dark) rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`text-xs font-semibold ${
                    i + 1 < step
                      ? "text-(--primary-green)"
                      : i + 1 === step
                        ? "text-(--text-base)"
                        : "text-(--text-faint)"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center gap-3">
              <span className="material-symbols-outlined text-(--accent-red) text-lg">error</span>
              <p className="text-(--accent-red) text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-(--bg-card) rounded-3xl border border-(--border-medium) shadow-2xl shadow-black/50 overflow-hidden">
            {/* Step 1 */}
            {step === 1 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-10 bg-(--primary-green) rounded-full" />
                  <div>
                    <p className="text-(--primary-green) text-xs font-bold uppercase tracking-widest">
                      Step 01
                    </p>
                    <h2 className="text-xl font-bold text-(--text-base)">School Details</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      School Name <span className="text-(--accent-red)">*</span>
                    </label>
                    <input
                      className={inputCls("schoolName")}
                      placeholder="e.g. Nairobi Junior Academy"
                      value={formData.schoolName}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, schoolName: e.target.value }));
                        if (fieldErrors.schoolName) setFieldErrors((f) => ({ ...f, schoolName: undefined }));
                      }}
                    />
                    <FieldError msg={fieldErrors.schoolName} />
                  </div>
                  <div>
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      School Type <span className="text-(--accent-red)">*</span>
                    </label>
                    <select
                      className={inputCls("schoolType")}
                      value={formData.schoolType}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, schoolType: e.target.value }));
                        if (fieldErrors.schoolType) setFieldErrors((f) => ({ ...f, schoolType: undefined }));
                      }}
                    >
                      <option value="">Select institution type</option>
                      <option>Public School</option>
                      <option>Private School</option>
                      <option>Community Center</option>
                      <option>Afterschool Provider</option>
                      <option>NGO / Non-Profit</option>
                    </select>
                    <FieldError msg={fieldErrors.schoolType} />
                  </div>
                  <div>
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      Campus Location <span className="text-(--accent-red)">*</span>
                    </label>
                    <input
                      className={inputCls("location")}
                      placeholder="e.g. Nairobi, Kenya"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, location: e.target.value }));
                        if (fieldErrors.location) setFieldErrors((f) => ({ ...f, location: undefined }));
                      }}
                    />
                    <FieldError msg={fieldErrors.location} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      Estimated Student Count <span className="text-(--accent-red)">*</span>
                    </label>
                    <select
                      className={inputCls("studentCount")}
                      value={formData.studentCount}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, studentCount: e.target.value }));
                        if (fieldErrors.studentCount) setFieldErrors((f) => ({ ...f, studentCount: undefined }));
                      }}
                    >
                      <option value="">Select range</option>
                      <option>1–50</option>
                      <option>51–200</option>
                      <option>201–500</option>
                      <option>500+</option>
                    </select>
                    <FieldError msg={fieldErrors.studentCount} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                  <div>
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest">
                      Step 02
                    </p>
                    <h2 className="text-xl font-bold text-(--text-base)">Administrator Account</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      Full Name <span className="text-(--accent-red)">*</span>
                    </label>
                    <input
                      className={inputCls("fullName")}
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, fullName: e.target.value }));
                        if (fieldErrors.fullName) setFieldErrors((f) => ({ ...f, fullName: undefined }));
                      }}
                    />
                    <FieldError msg={fieldErrors.fullName} />
                  </div>
                  <div>
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      Role / Designation <span className="text-(--accent-red)">*</span>
                    </label>
                    <input
                      className={inputCls("roleDesignation")}
                      placeholder="e.g. STEM Coordinator"
                      value={formData.roleDesignation}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, roleDesignation: e.target.value }));
                        if (fieldErrors.roleDesignation) setFieldErrors((f) => ({ ...f, roleDesignation: undefined }));
                      }}
                    />
                    <FieldError msg={fieldErrors.roleDesignation} />
                  </div>
                  <div>
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      Contact Number <span className="text-(--accent-red)">*</span>
                    </label>
                    <input
                      type="tel"
                      className={inputCls("contactNumber")}
                      placeholder="+254 7xx xxx xxx"
                      value={formData.contactNumber}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, contactNumber: e.target.value }));
                        if (fieldErrors.contactNumber) setFieldErrors((f) => ({ ...f, contactNumber: undefined }));
                      }}
                    />
                    <FieldError msg={fieldErrors.contactNumber} />
                  </div>
                  <div>
                    <label className="text-(--text-muted) text-xs font-semibold block mb-1.5">
                      Email Address <span className="text-(--accent-red)">*</span>
                    </label>
                    <input
                      type="email"
                      className={inputCls("email")}
                      placeholder="admin@school.org"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, email: e.target.value }));
                        if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                      }}
                    />
                    <FieldError msg={fieldErrors.email} />
                  </div>
                </div>
                <div className="mt-5 p-4 bg-[rgba(45,212,191,0.05)] border border-[rgba(45,212,191,0.15)] rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-(--primary-green) text-[18px] mt-0.5 shrink-0">info</span>
                  <p className="text-(--text-muted) text-xs leading-relaxed">
                    No password needed here. Once your application is approved, you&apos;ll receive
                    an email invite with a secure link to set your account password. We&apos;ll also
                    send you a link to this page so you can pick up where you left off if needed.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-10 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">
                      Step 03
                    </p>
                    <h2 className="text-xl font-bold text-(--text-base)">Review & Submit</h2>
                  </div>
                </div>
                <p className="text-(--text-muted) text-sm mb-6">
                  Please confirm your details before submitting. Once approved, you will receive an
                  email invite to set up your account.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "School Name", value: formData.schoolName },
                    { label: "School Type", value: formData.schoolType },
                    { label: "Location", value: formData.location },
                    { label: "Student Count", value: formData.studentCount },
                    { label: "Admin Name", value: formData.fullName },
                    { label: "Role", value: formData.roleDesignation },
                    { label: "Contact", value: formData.contactNumber },
                    { label: "Email", value: formData.email },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="p-4 bg-[rgba(255,255,255,0.03)] border border-(--border-subtle) rounded-xl"
                    >
                      <p className="text-(--text-faint) text-xs font-bold uppercase tracking-wider mb-1">
                        {r.label}
                      </p>
                      <p className="text-(--text-base) text-sm font-medium break-all">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="px-8 pb-8 flex gap-3">
              {step === 1 ? (
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-3.5 rounded-xl bg-(--input-bg) text-(--text-muted) font-bold text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={handleBack}
                  className="px-8 py-3.5 rounded-xl bg-(--input-bg) text-(--text-muted) font-bold text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3.5 rounded-xl bg-(--primary-green) text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Next Step
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-(--primary-green) text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-sm">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      Submit Application
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </button>
              )}
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
              <p className="text-(--text-muted) text-xs leading-relaxed">
                Your information is encrypted and stored securely. By submitting this form you agree
                to STEM Impact Academy&apos;s{" "}
                <a href="/terms" className="text-(--primary-green) underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-(--primary-green) underline">
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

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-(--bg-page) flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
            progress_activity
          </span>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
