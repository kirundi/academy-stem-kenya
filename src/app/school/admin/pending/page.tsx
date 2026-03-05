"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/contexts/AuthContext";
import StemLogo from "@/components/StemLogo";
import { useAuth } from "@/hooks/useAuth";

type SchoolState = "review" | "rejected" | "suspended" | null;

export default function SchoolAdminPendingPage() {
  const router = useRouter();
  const { appUser, loading } = useAuthContext();
  const { signOut } = useAuth();
  const [checkCount, setCheckCount] = useState(0);
  const [schoolStatus, setSchoolStatus] = useState<SchoolState>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  useEffect(() => {
    if (loading || !appUser?.schoolId) return;

    const check = async () => {
      const snap = await getDoc(doc(db, "schools", appUser.schoolId!));
      if (!snap.exists()) return;
      const data = snap.data();
      const status = data?.status as string;

      if (status === "active") {
        router.replace("/school/admin");
        return;
      }

      setSchoolStatus((status as SchoolState) ?? "review");
      if (status === "rejected") {
        setRejectionReason(data?.rejectionReason ?? "");
      }
    };

    check();
    const id = setInterval(() => {
      setCheckCount((n) => n + 1);
    }, 30_000);

    return () => clearInterval(id);
  }, [appUser?.schoolId, loading, router, checkCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-page) flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-(--primary-green) text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-page) text-(--text-base) flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px]"
          style={{
            background:
              schoolStatus === "rejected" || schoolStatus === "suspended"
                ? "rgba(255,77,77,0.07)"
                : "rgba(45,212,191,0.06)",
          }}
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[rgba(255,77,77,0.04)] rounded-full blur-[120px]" />
      </div>

      <header className="flex items-center justify-between px-6 md:px-20 py-4 border-b border-(--border-subtle) bg-[rgba(16,34,28,0.5)] backdrop-blur-md sticky top-0 z-50">
        <StemLogo />
        <button
          onClick={() => signOut().then(() => router.replace("/login"))}
          className="text-(--text-muted) hover:text-(--text-base) text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        {/* ── REJECTED ── */}
        {schoolStatus === "rejected" && (
          <div className="max-w-lg w-full text-center">
            <div className="inline-flex items-center gap-2 bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.25)] rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
                Application Not Approved
              </span>
            </div>

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(255,77,77,0.08)] border border-[rgba(255,77,77,0.2)] mb-6">
              <span className="material-symbols-outlined text-red-400 text-4xl">cancel</span>
            </div>

            <h1 className="text-3xl font-bold text-(--text-base) mb-3">Application Not Approved</h1>
            <p className="text-(--text-muted) text-base leading-relaxed mb-6">
              We&apos;re sorry, but your school&apos;s application was not approved at this time.
              Please review the feedback below and contact our support team for next steps.
            </p>

            {rejectionReason && (
              <div className="bg-[rgba(255,77,77,0.06)] border border-[rgba(255,77,77,0.18)] rounded-2xl p-5 mb-8 text-left">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">
                  Reason provided
                </p>
                <p className="text-(--text-muted) text-sm leading-relaxed">{rejectionReason}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a
                href="mailto:support@stemimpactcenterkenya.org"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-(--input-bg) text-(--text-muted) hover:text-(--text-base) hover:bg-[rgba(255,255,255,0.1)] font-semibold text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Contact Support
              </a>
              <a
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-(--primary-green) text-[#10221c] font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Resubmit Application
              </a>
            </div>
          </div>
        )}

        {/* ── SUSPENDED ── */}
        {schoolStatus === "suspended" && (
          <div className="max-w-lg w-full text-center">
            <div className="inline-flex items-center gap-2 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                Account Suspended
              </span>
            </div>

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] mb-6">
              <span className="material-symbols-outlined text-amber-400 text-4xl">block</span>
            </div>

            <h1 className="text-3xl font-bold text-(--text-base) mb-3">Account Suspended</h1>
            <p className="text-(--text-muted) text-base leading-relaxed mb-8">
              Your school account has been temporarily suspended. Please contact our support team to
              resolve this and restore access to your dashboard.
            </p>

            <a
              href="mailto:support@stemimpactcenterkenya.org"
              className="inline-flex items-center gap-2 text-(--primary-green) text-sm font-semibold hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Contact support to restore access
            </a>
          </div>
        )}

        {/* ── UNDER REVIEW (default) ── */}
        {(schoolStatus === "review" || schoolStatus === null) && (
          <div className="max-w-lg w-full text-center">
            <div className="inline-flex items-center gap-2 bg-[rgba(234,179,8,0.1)] border border-[rgba(234,179,8,0.25)] rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">
                Under Review
              </span>
            </div>

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(45,212,191,0.08)] border border-(--border-medium) mb-6">
              <span className="material-symbols-outlined text-(--primary-green) text-4xl">
                hourglass_top
              </span>
            </div>

            <h1 className="text-3xl font-bold text-(--text-base) mb-3">Your School is Under Review</h1>
            <p className="text-(--text-muted) text-base leading-relaxed mb-8">
              Thank you for registering! Our team is reviewing your school application. This page
              will automatically update when your school is approved.
            </p>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6 mb-8 text-left space-y-4">
              {[
                {
                  icon: "check_circle",
                  color: "text-(--primary-green)",
                  label: "Application submitted",
                  detail: "We received your registration",
                  done: true,
                },
                {
                  icon: "pending",
                  color: "text-yellow-400",
                  label: "Under review",
                  detail: "Our team is verifying your school details",
                  done: false,
                },
                {
                  icon: "radio_button_unchecked",
                  color: "text-(--text-faint)",
                  label: "Approval & activation",
                  detail: "You'll get full dashboard access",
                  done: false,
                },
              ].map((step) => (
                <div key={step.label} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-[20px] mt-0.5 ${step.color}`}>
                    {step.icon}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${step.done ? "text-(--text-base)" : "text-(--text-muted)"}`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-(--text-faint)">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-(--text-faint) text-sm mb-6">
              Typical review time: <strong className="text-(--text-muted)">24–48 hours</strong>. This
              page checks for updates automatically every 30 seconds.
            </p>

            <a
              href="mailto:support@stemimpactcenterkenya.org"
              className="text-(--primary-green) text-sm font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Contact support if you have questions
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
