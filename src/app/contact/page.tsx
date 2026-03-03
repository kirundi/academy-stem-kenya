"use client";

import { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setErrorMsg("Unable to send message. Please check your connection and try again.");
      setStatus("error");
    }
  };

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

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <span className="material-symbols-outlined text-5xl text-[#13eca4]">
                  check_circle
                </span>
                <h3 className="text-xl font-bold text-white">Message sent!</h3>
                <p className="text-slate-400 text-sm">
                  Thank you for reaching out. We&apos;ll get back to you within 1–2 business days.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-2 text-[#13eca4] text-sm font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
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
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us more..."
                    required
                    className="w-full rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#13eca4] resize-none"
                  />
                </div>

                {status === "error" && <p className="text-red-400 text-sm">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-xl bg-[#13eca4] py-4 text-[#10221c] font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">
                        progress_activity
                      </span>
                      Sending…
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
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
