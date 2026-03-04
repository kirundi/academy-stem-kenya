import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-(--bg-page) font-sans text-(--text-base) antialiased">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl mb-6">
              About <span className="text-[#13eca4]">STEM Impact</span> Academy
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-(--text-muted)">
              We are on a mission to empower the next generation of African innovators through
              accessible, project-based STEM education that delivers measurable real-world results.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-6 bg-[rgba(26,46,39,0.3)]">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="rounded-xl bg-(--bg-card) p-8 border border-(--border-subtle)">
              <div className="w-12 h-12 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#13eca4] text-2xl">flag</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-(--text-muted) leading-relaxed">
                To provide schools across Kenya and beyond with a comprehensive, project-based STEM
                learning platform that equips students with critical 21st-century skills while
                empowering educators with the tools they need to deliver transformative learning
                experiences.
              </p>
            </div>
            <div className="rounded-xl bg-(--bg-card) p-8 border border-(--border-subtle)">
              <div className="w-12 h-12 rounded-xl bg-[rgba(255,77,77,0.1)] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#ff4d4d] text-2xl">
                  visibility
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-(--text-muted) leading-relaxed">
                A world where every student, regardless of their background, has access to
                high-quality STEM education that inspires innovation, builds practical skills, and
                creates measurable impact in their communities.
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
                  <p className="text-sm text-(--text-muted) mt-2 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners & Affiliations */}
        <section className="py-16 px-6">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-(--text-faint) mb-10">
              Partners &amp; Affiliations
            </p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="bg-white rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow inline-flex items-center">
                <Image
                  src="/images/logo/sic-logo.png"
                  alt="STEM Impact Center Kenya"
                  height={56}
                  width={220}
                  style={{ height: "56px", width: "auto" }}
                />
              </div>
              <div className="bg-white rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow inline-flex items-center">
                <Image
                  src="/images/logo/wro-logo.png"
                  alt="World Robot Olympiad Kenya"
                  height={56}
                  width={220}
                  style={{ height: "56px", width: "auto" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-[rgba(26,46,39,0.3)]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black mb-6">Join Our Mission</h2>
            <p className="text-(--text-muted) mb-10">
              Whether you are a school administrator, educator, or partner organization, there is a
              place for you in the STEM Impact community.
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
                className="rounded-xl border border-(--border-medium) bg-(--bg-card) px-8 py-4 text-lg font-bold hover:bg-(--input-bg) transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--border-subtle) bg-(--bg-page) px-6 py-8 text-center">
        <p className="text-xs text-(--text-faint)">
          &copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
