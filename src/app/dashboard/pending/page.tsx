"use client";

import Link from "next/link";

const profileFields = [
  { label: "Institution Type", value: "Private K-12 Academy" },
  { label: "Estimated Students", value: "1,200 – 1,500 students" },
  { label: "Administrator", value: "Dr. Sarah Jenkins" },
  { label: "Email Address", value: "s.jenkins@stemimpactcenterkenya.org" },
];

export default function SchoolPendingPage() {
  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-green/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-green text-[20px]">
              rocket_launch
            </span>
          </div>
          <span className="text-(--text-base) font-bold text-lg">STEM Impact Academy</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/contact"
            className="text-(--text-muted) hover:text-primary-green text-sm font-medium transition-colors"
          >
            Support
          </a>
          <a
            href="/help"
            className="text-(--text-muted) hover:text-primary-green text-sm font-medium transition-colors"
          >
            Documentation
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-lg bg-(--input-bg) flex items-center justify-center text-(--text-muted) hover:text-(--text-base) transition-colors">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-green/10 border border-(--border-strong) flex items-center justify-center text-primary-green font-bold text-sm">
            SA
          </div>
        </div>
      </header>

      <main className="px-6 md:px-20 py-10 max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-(--bg-card) border border-(--border-subtle) mb-10">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, #13eca4 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-green/10 border border-(--border-accent) text-primary-green text-xs font-bold uppercase tracking-wider mb-5">
                <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
                Verification in Progress
              </div>
              <h1 className="text-(--text-base) text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                Registration Under Review
              </h1>
              <p className="text-(--text-muted) text-lg max-w-xl">
                Our Global Admin team is currently verifying your school&apos;s credentials. This
                typically takes 24–48 hours to ensure a secure learning environment for all
                students.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary-green text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-[20px]">help_center</span>
                  Contact Support
                </button>
                <button className="px-6 py-3 bg-(--input-bg) text-(--text-base) font-bold rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-(--border-subtle)">
                  Refresh Status
                </button>
              </div>
            </div>
            {/* Spinning Icon */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
              <div className="absolute inset-0 bg-primary-green/10 rounded-full animate-ping opacity-20" />
              <div
                className="absolute inset-4 border-2 border-dashed border-(--border-strong) rounded-full"
                style={{ animation: "spin 10s linear infinite" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-green text-[80px] md:text-[96px]">
                  verified_user
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Timeline */}
          <div className="space-y-6">
            <h2 className="text-(--text-base) font-bold text-xl px-1">Verification Progress</h2>
            <div className="bg-(--bg-card) rounded-2xl p-6 border border-(--border-subtle)">
              <div className="flex flex-col gap-0">
                {/* Step 1 — Done */}
                <div className="grid grid-cols-[40px_1fr] gap-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-green text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    </div>
                    <div className="w-0.5 bg-primary-green h-12" />
                  </div>
                  <div className="pb-8">
                    <p className="text-(--text-base) font-bold">Application Submitted</p>
                    <p className="text-(--text-faint) text-sm">Completed on Oct 24, 2023</p>
                  </div>
                </div>
                {/* Step 2 — In Progress */}
                <div className="grid grid-cols-[40px_1fr] gap-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-green/10 border border-(--border-strong) text-primary-green flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ animation: "spin 1s linear infinite" }}
                      >
                        sync
                      </span>
                    </div>
                    <div className="w-0.5 bg-(--bg-elevated) h-12" />
                  </div>
                  <div className="pb-8">
                    <p className="text-(--text-base) font-bold">Initial Screening</p>
                    <p className="text-primary-green text-sm font-medium">In Progress</p>
                  </div>
                </div>
                {/* Step 3 — Pending */}
                <div className="grid grid-cols-[40px_1fr] gap-x-4 opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-(--input-bg) text-(--text-faint) flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">shield_person</span>
                    </div>
                    <div className="w-0.5 bg-(--bg-elevated) h-12" />
                  </div>
                  <div className="pb-8">
                    <p className="text-(--text-base) font-bold">Manual Verification</p>
                    <p className="text-(--text-faint) text-sm">Pending Admin Review</p>
                  </div>
                </div>
                {/* Step 4 — Upcoming */}
                <div className="grid grid-cols-[40px_1fr] gap-x-4 opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-(--input-bg) text-(--text-faint) flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-(--text-base) font-bold">Dashboard Access</p>
                    <p className="text-(--text-faint) text-sm">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* School Profile Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-(--text-base) font-bold text-xl">School Profile Summary</h2>
              <span className="flex items-center gap-1 text-(--text-faint) text-xs">
                <span className="material-symbols-outlined text-[14px]">lock</span> Read-only
              </span>
            </div>
            <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) overflow-hidden">
              <div className="px-6 py-5 border-b border-(--border-subtle) bg-[rgba(255,255,255,0.02)] flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-green/10 border border-(--border-accent) flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-green text-[32px]">
                    corporate_fare
                  </span>
                </div>
                <div>
                  <h3 className="text-(--text-base) font-bold text-lg leading-none mb-1">
                    Horizon Academy of STEM
                  </h3>
                  <p className="text-(--text-faint) text-sm">ID: STEM-2023-08942</p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {profileFields.map((f) => (
                  <div key={f.label}>
                    <p className="text-(--text-faint) text-xs uppercase font-bold tracking-wider mb-1">
                      {f.label}
                    </p>
                    <p className="text-(--text-base) font-medium">{f.value}</p>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <p className="text-(--text-faint) text-xs uppercase font-bold tracking-wider mb-1">
                    Mailing Address
                  </p>
                  <p className="text-(--text-base) font-medium">
                    1200 Innovation Way, Silicon Forest, WA 98004, USA
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-(--text-faint) text-xs uppercase font-bold tracking-wider mb-2">
                    Supporting Documents
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["School Accreditation Certificate", "Administrator ID"].map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center gap-2 px-3 py-2 bg-(--glass-bg) rounded-lg text-sm border border-(--border-subtle)"
                      >
                        <span className="material-symbols-outlined text-primary-green text-[16px]">
                          description
                        </span>
                        <span className="text-(--text-muted)">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-(--input-bg) text-(--text-muted) font-semibold rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-(--border-subtle) text-sm">
                <span className="material-symbols-outlined text-[18px]">edit</span>Edit Application
              </button>
              <Link
                href="/onboarding"
                className="flex items-center gap-2 px-5 py-2.5 border border-(--border-strong) text-primary-green font-semibold rounded-xl hover:bg-[rgba(19,236,164,0.05)] transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to
                Form
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
