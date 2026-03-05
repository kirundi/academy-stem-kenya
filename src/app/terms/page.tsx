import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-(--bg-page) font-sans text-(--text-base) antialiased">
      <PublicNavbar />

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
          <p className="text-(--text-faint) text-sm mb-12">Last updated: March 2026</p>

          <div className="space-y-10 text-(--text-muted) leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the STEM Impact Academy platform, you agree to be bound by
                these Terms of Service. If you do not agree to these terms, you may not use the
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">2. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials.
                School administrators are responsible for managing teacher and student accounts
                within their institution. You must provide accurate and complete information when
                creating an account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">3. Acceptable Use</h2>
              <p>
                You agree to use the platform only for educational purposes and in compliance with
                all applicable laws. You may not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-(--text-muted)">
                <li>Share account credentials with unauthorized users</li>
                <li>Upload inappropriate, harmful, or copyrighted content</li>
                <li>Attempt to access other users&apos; data without authorization</li>
                <li>Use the platform for any commercial purpose outside of education</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">
                4. Content & Intellectual Property
              </h2>
              <p>
                All curriculum content, project guides, and educational materials on the platform
                are the intellectual property of STEM Impact Center Kenya. Schools and educators are
                granted a non-exclusive license to use these materials for educational purposes
                within their institution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">5. Digital Badges</h2>
              <p>
                Badges earned by students are verified credentials issued through the platform. They
                represent demonstrated competency in specific skill areas. STEM Impact Academy
                reserves the right to revoke badges in cases of academic dishonesty.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">6. Service Availability</h2>
              <p>
                We strive to maintain platform availability but do not guarantee uninterrupted
                access. We may perform maintenance, updates, or modifications to the platform with
                reasonable notice when possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">7. Limitation of Liability</h2>
              <p>
                STEM Impact Academy is provided &ldquo;as is&rdquo; without warranties of any kind.
                We are not liable for any indirect, incidental, or consequential damages arising
                from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-(--text-base) mb-3">8. Contact</h2>
              <p>
                For questions about these Terms, please visit our{" "}
                <Link href="/contact" className="text-(--primary-green) hover:underline">
                  contact page
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:legal@stemimpactcenterkenya.org"
                  className="text-(--primary-green) hover:underline"
                >
                  legal@stemimpactcenterkenya.org
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-(--border-subtle) bg-(--bg-page) px-6 py-8 text-center">
        <p className="text-xs text-(--text-faint)">
          &copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
