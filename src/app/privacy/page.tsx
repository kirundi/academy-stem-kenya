import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#10221c] font-sans text-slate-100 antialiased">
      <PublicNavbar />

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>

          <div className="space-y-10 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p>
                When you register for STEM Impact Academy, we collect personal information such as your name, email address, school affiliation, and role. For students, we may collect information provided by their school or teacher, including names and classroom assignments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                <li>Provide and maintain the STEM Impact Academy platform</li>
                <li>Manage user accounts, classrooms, and enrollments</li>
                <li>Track student progress and generate analytics for educators</li>
                <li>Issue digital badges and certificates</li>
                <li>Communicate platform updates and support information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Data Protection</h2>
              <p>
                We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. We use Firebase infrastructure, which is SOC 2 and ISO 27001 certified, to store and process your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Student Data (COPPA & FERPA)</h2>
              <p>
                We are committed to protecting student privacy. We do not sell student data to third parties. Student accounts are created and managed by authorized educators. We comply with applicable student data privacy regulations including COPPA and FERPA guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
              <p>
                We integrate with Google Classroom for roster management and assignment syncing. When you connect your Google account, Google&apos;s own privacy policy applies to data processed by Google. We only access the minimum data needed for classroom functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active. School administrators can request deletion of all school-related data by contacting our support team. Upon account deletion, we remove personal data within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
                <Link href="/contact" className="text-[#13eca4] hover:underline">our contact page</Link> or email us at{" "}
                <a href="mailto:privacy@stemimpactcenterkenya.org" className="text-[#13eca4] hover:underline">privacy@stemimpactcenterkenya.org</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-[rgba(19,236,164,0.08)] bg-[#10221c] px-6 py-8 text-center">
        <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
