import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#10221c] font-sans text-slate-100 antialiased">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl mb-6">
              About <span className="text-[#13eca4]">STEM Impact</span> Academy
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-400">
              We are on a mission to empower the next generation of African innovators through accessible, project-based STEM education that delivers measurable real-world results.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-6 bg-[rgba(26,46,39,0.3)]">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="rounded-xl bg-[#1a2e27] p-8 border border-[rgba(255,255,255,0.06)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#13eca4] text-2xl">flag</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed">
                To provide schools across Kenya and beyond with a comprehensive, project-based STEM learning platform that equips students with critical 21st-century skills while empowering educators with the tools they need to deliver transformative learning experiences.
              </p>
            </div>
            <div className="rounded-xl bg-[#1a2e27] p-8 border border-[rgba(255,255,255,0.06)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,77,77,0.1)] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#ff4d4d] text-2xl">visibility</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-slate-400 leading-relaxed">
                A world where every student, regardless of their background, has access to high-quality STEM education that inspires innovation, builds practical skills, and creates measurable impact in their communities.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Numbers */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-16">Our Impact So Far</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { num: "500+", label: "Schools" },
                { num: "2,000+", label: "Educators" },
                { num: "50,000+", label: "Students" },
                { num: "27,000+", label: "Badges Earned" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p className="text-4xl font-black text-[#13eca4]">{num}</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-[rgba(26,46,39,0.3)]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black mb-6">Join Our Mission</h2>
            <p className="text-slate-400 mb-10">
              Whether you are a school administrator, educator, or partner organization, there is a place for you in the STEM Impact community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/onboarding"
                className="rounded-xl bg-[#13eca4] px-8 py-4 text-lg font-bold text-[#10221c] shadow-lg shadow-[rgba(19,236,164,0.2)] hover:scale-[1.02] transition-transform"
              >
                Register Your School
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#1a2e27] px-8 py-4 text-lg font-bold hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(19,236,164,0.08)] bg-[#10221c] px-6 py-8 text-center">
        <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
