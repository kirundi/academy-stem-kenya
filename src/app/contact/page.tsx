import PublicNavbar from "@/components/PublicNavbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#10221c] font-sans text-slate-100 antialiased">
      <PublicNavbar />

      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black mb-4">Contact Us</h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              Have questions about STEM Impact Academy? We are here to help. Reach out using any of
              the methods below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "mail",
                title: "Email",
                desc: "General inquiries and support",
                detail: "programs@stemimpactcenterkenya.org",
                href: "mailto:programs@stemimpactcenterkenya.org",
              },
              {
                icon: "location_on",
                title: "Location",
                desc: "STEM Impact Center Kenya",
                detail: "Nairobi, Kenya",
                href: undefined,
              },
              {
                icon: "public",
                title: "Website",
                desc: "Visit our main site",
                detail: "stemimpactcenterkenya.org",
                href: "https://stemimpactcenterkenya.org",
              },
            ].map(({ icon, title, desc, detail, href }) => (
              <div
                key={title}
                className="rounded-xl bg-[#1a2e27] p-8 border border-[rgba(255,255,255,0.06)] text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-[rgba(19,236,164,0.1)] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#13eca4] text-2xl">{icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-sm text-slate-500 mb-3">{desc}</p>
                {href ? (
                  <a href={href} className="text-[#13eca4] text-sm font-medium hover:underline">
                    {detail}
                  </a>
                ) : (
                  <p className="text-slate-300 text-sm font-medium">{detail}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto rounded-2xl bg-[#1a2e27] border border-[rgba(19,236,164,0.12)] p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-8">Send Us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@stemimpactcenterkenya.org"
                    className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4] resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#13eca4] py-4 text-[#10221c] font-bold hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-[rgba(19,236,164,0.08)] bg-[#10221c] px-6 py-8 text-center mt-16">
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
