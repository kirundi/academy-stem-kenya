import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function EducatorsPage() {
  return (
    <div className="min-h-screen bg-[#10221c] font-sans text-slate-100 antialiased">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#13eca4] mb-6">
              <span className="material-symbols-outlined text-sm">school</span>
              For Educators
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl mb-6">
              Empower Your Classroom with <span className="text-[#13eca4]">STEM Impact</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10">
              Access project-based curriculum, facilitation guides, and real-time analytics to
              deliver meaningful STEM experiences to every student.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register/teacher"
                className="rounded-xl bg-[#13eca4] px-8 py-4 text-lg font-bold text-[#10221c] shadow-lg shadow-[rgba(19,236,164,0.2)] hover:scale-[1.02] transition-transform"
              >
                Get Started as an Educator
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#1a2e27] px-8 py-4 text-lg font-bold hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-20 px-6 bg-[rgba(26,46,39,0.3)]">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black text-center mb-16">
              Everything You Need to Teach STEM
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "menu_book",
                  title: "Ready-Made Curriculum",
                  desc: "Standards-aligned, project-based lessons you can deploy immediately. No prep required.",
                },
                {
                  icon: "groups",
                  title: "Classroom Management",
                  desc: "Organize students into groups, track progress in real-time, and manage submissions from one dashboard.",
                },
                {
                  icon: "insights",
                  title: "Analytics & Reporting",
                  desc: "Visualize student mastery, identify gaps, and generate reports for stakeholders automatically.",
                },
                {
                  icon: "badge",
                  title: "Digital Badge System",
                  desc: "Students earn verified badges as they complete projects, motivating continuous learning.",
                },
                {
                  icon: "sync_alt",
                  title: "Google Classroom Sync",
                  desc: "One-click integration with Google Classroom. Import rosters and push grades seamlessly.",
                },
                {
                  icon: "support_agent",
                  title: "Dedicated Support",
                  desc: "Access facilitation notes, educator guides, and our support team whenever you need help.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl bg-[#1a2e27] p-8 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(19,236,164,0.3)] transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[#13eca4] text-2xl">
                      {icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black mb-6">Ready to Transform Your Teaching?</h2>
            <p className="text-slate-400 mb-10">
              Join hundreds of educators across Kenya using STEM Impact Academy to deliver
              world-class project-based learning.
            </p>
            <Link
              href="/register/teacher"
              className="inline-block rounded-xl bg-[#13eca4] px-10 py-4 text-lg font-bold text-[#10221c] shadow-lg shadow-[rgba(19,236,164,0.2)] hover:scale-[1.02] transition-transform"
            >
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(19,236,164,0.08)] bg-[#10221c] px-6 py-8 text-center">
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
