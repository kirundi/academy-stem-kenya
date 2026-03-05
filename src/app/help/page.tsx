import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-(--bg-page) font-sans text-(--text-base) antialiased">
      <PublicNavbar />

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black mb-4">Help Center</h1>
            <p className="text-(--text-muted) max-w-xl mx-auto">
              Find answers to common questions and get the support you need to make the most of STEM
              Impact Academy.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: "person_add",
                title: "Getting Started",
                items: [
                  "How do I create an account?",
                  "How do students join a classroom?",
                  "How do I set up my school?",
                ],
              },
              {
                icon: "school",
                title: "For Educators",
                items: [
                  "How do I create a classroom?",
                  "How do I assign projects?",
                  "How do I grade submissions?",
                ],
              },
              {
                icon: "cast_for_education",
                title: "For Students",
                items: [
                  "How do I submit my work?",
                  "How do I earn badges?",
                  "How do I track my progress?",
                ],
              },
              {
                icon: "admin_panel_settings",
                title: "For Administrators",
                items: [
                  "How do I manage teachers?",
                  "How do I view school analytics?",
                  "How do I manage enrollments?",
                ],
              },
              {
                icon: "sync",
                title: "Google Classroom",
                items: [
                  "How do I sync my roster?",
                  "How do I push grades?",
                  "Troubleshooting sync issues",
                ],
              },
              {
                icon: "shield",
                title: "Account & Security",
                items: [
                  "How do I reset my password?",
                  "How do I update my profile?",
                  "Data privacy & protection",
                ],
              },
            ].map(({ icon, title, items }) => (
              <div
                key={title}
                className="rounded-xl bg-(--bg-card) p-6 border border-(--border-subtle) hover:border-(--border-accent) transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(45,212,191,0.1)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-(--primary-green)">{icon}</span>
                  </div>
                  <h3 className="font-bold">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-(--text-muted) flex items-center gap-2">
                      <span className="material-symbols-outlined text-(--text-faint) text-sm">
                        chevron_right
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Still need help? */}
          <div className="rounded-2xl bg-[rgba(45,212,191,0.05)] border border-(--border-medium) p-8 md:p-12 text-center">
            <span className="material-symbols-outlined text-(--primary-green) text-4xl mb-4">
              support_agent
            </span>
            <h2 className="text-2xl font-bold mb-3">Still Need Help?</h2>
            <p className="text-(--text-muted) mb-6 max-w-lg mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is ready to assist you.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-xl bg-(--primary-green) px-8 py-3 font-bold text-[#10221c] hover:opacity-90 transition-opacity"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-(--border-subtle) bg-(--bg-page) px-6 py-8 text-center mt-16">
        <p className="text-xs text-(--text-faint)">
          &copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
