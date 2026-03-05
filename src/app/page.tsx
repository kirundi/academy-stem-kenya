"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

function CtaSection() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    schoolName: "",
    role: "School Administrator",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.schoolName) return;
    localStorage.setItem(
      "stemimpact_prefill",
      JSON.stringify({
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        schoolName: form.schoolName,
        roleDesignation: form.role,
      })
    );
    router.push("/onboarding");
  };

  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      <div className="mx-auto max-w-5xl rounded-3xl bg-[#0d6b5e] px-8 py-16 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="40" id="cta-grid" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#cta-grid)" height="100%" width="100%" />
          </svg>
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Bring STEM Impact to Your School
            </h2>
            <p className="mt-6 text-white/80 text-lg leading-relaxed font-medium">
              Join 500+ forward-thinking schools transforming their curriculum with our
              project-based learning framework.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Administrator Dashboard",
                "Standard-Aligned Curriculum",
                "Teacher Training & Support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white font-bold">
                  <span className="material-symbols-outlined font-bold">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.1)] p-1 backdrop-blur-sm">
            <div className="rounded-xl bg-white p-8 shadow-2xl text-gray-900">
              <h3 className="text-xl font-bold mb-6">School Registration</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">
                      First Name *
                    </label>
                    <input
                      required
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-[#0d6b5e]"
                      placeholder="Jane"
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-[#0d6b5e]"
                      placeholder="Doe"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Work Email *</label>
                  <input
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-[#0d6b5e]"
                    placeholder="jane@school.edu"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    School Name *
                  </label>
                  <input
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-[#0d6b5e]"
                    placeholder="West Valley Academy"
                    type="text"
                    value={form.schoolName}
                    onChange={(e) => setForm((p) => ({ ...p, schoolName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Role</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-[#0d6b5e]"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option>School Administrator</option>
                    <option>Department Head</option>
                    <option>Teacher</option>
                    <option>District Official</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full rounded-lg bg-white py-4 font-bold text-[#0d6b5e] shadow-lg hover:bg-gray-50 transition-all text-center block border border-white/20"
                >
                  Register Your School
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-(--bg-page) font-sans text-(--text-base) antialiased overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-16 lg:py-24 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[#fde8e0] opacity-40 blur-2xl dark:opacity-5 pointer-events-none" />
          <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full bg-[#e0f5f0] opacity-50 dark:opacity-5 pointer-events-none" />

          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-(--border) bg-(--bg-card)/50 p-8 lg:p-12">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
                {/* Left — Hero Text */}
                <div className="flex flex-col gap-6">
                  {/* Tagline badge with dot */}
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d6b5e] w-fit">
                    <span className="w-2 h-2 rounded-full bg-[#0d6b5e]" />
                    E-Learning Platform
                  </div>

                  {/* Main headline */}
                  <h1 className="text-5xl font-black leading-[1.1] tracking-tight lg:text-6xl text-(--text-base)">
                    Master the Skills to{" "}
                    <span className="text-[#e8542f] italic">Drive Your Future</span>
                  </h1>

                  {/* Description */}
                  <p className="max-w-lg text-lg leading-relaxed text-(--text-muted)">
                    Empowering the next generation of innovators through project-based
                    STEM learning that delivers measurable real-world results across
                    Kenya and beyond.
                  </p>

                  {/* CTA buttons */}
                  <div className="flex flex-wrap items-center gap-5 mt-2">
                    <Link
                      href="/login"
                      className="rounded-full bg-[#0d6b5e] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[rgba(13,107,94,0.25)] hover:bg-[#0a5a4f] hover:scale-[1.02] transition-all"
                    >
                      Get Started Free
                    </Link>

                    {/* Play button + label */}
                    <button className="flex items-center gap-3 group">
                      <span className="w-14 h-14 rounded-full bg-[#e8542f] flex items-center justify-center text-white shadow-lg shadow-[rgba(232,84,47,0.3)] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">play_arrow</span>
                      </span>
                      <span className="text-sm font-semibold text-(--text-muted) group-hover:text-(--text-base) transition-colors">
                        Watch Demo
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right — Hero Visual */}
                <div className="relative flex items-center justify-center min-h-[400px]">
                  {/* Small floating teal dots */}
                  <div className="absolute top-4 left-8 w-3 h-3 rounded-full bg-[#0d6b5e] opacity-40 animate-float" />
                  <div className="absolute top-24 right-12 w-2 h-2 rounded-full bg-[#0d6b5e] opacity-30 animate-float-reverse" />
                  <div className="absolute bottom-16 right-8 w-4 h-4 rounded-full bg-[#e8542f] opacity-30 animate-float-slow" />

                  {/* Student hero image */}
                  <div className="relative z-10 w-full max-w-md">
                    <div className="rounded-3xl overflow-hidden shadow-2xl">
                      <Image
                        src="/images/logo/hero/hero-student.png"
                        alt="Student learning STEM"
                        width={500}
                        height={600}
                        className="w-full h-auto object-cover"
                        priority
                      />
                    </div>
                  </div>

                  {/* Floating badge card — top right */}
                  <div className="absolute -top-4 -right-4 z-20 rounded-2xl bg-(--bg-card) border border-(--border) p-4 shadow-lg animate-float-slow max-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-8 rounded-full bg-[#0d6b5e] flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-sm">workspace_premium</span>
                      </span>
                      <div className="text-xs font-bold text-(--text-base)">Top Rated</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className="material-symbols-outlined text-sm text-[#e8542f]">star</span>
                      ))}
                    </div>
                    <div className="text-[10px] text-(--text-muted) mt-1">by 500+ schools</div>
                  </div>

                  {/* Floating icon — bottom left */}
                  <div className="absolute -bottom-6 -left-6 z-20 w-16 h-16 rounded-xl bg-[#e8542f] flex items-center justify-center shadow-lg animate-float-reverse">
                    <span className="material-symbols-outlined text-2xl text-white">trending_up</span>
                  </div>

                  {/* Floating checkmark — mid left */}
                  <div className="absolute top-1/3 -left-8 z-20 w-12 h-12 rounded-full bg-[#0d6b5e] flex items-center justify-center shadow-lg animate-float">
                    <span className="material-symbols-outlined text-xl text-white">check</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple 3-Step Implementation */}
        <section id="solutions" className="py-24 px-6 bg-(--bg-surface) relative">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-(--text-base)">Simple 3-Step Implementation</h2>
              <p className="mt-4 text-(--text-muted)">
                From setup to mastery, we make STEM integration effortless.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-linear-to-r from-transparent via-(--border) to-transparent" />
              {[
                {
                  icon: "school",
                  borderColor: "#0d6b5e",
                  num: "1",
                  title: "School Onboarding",
                  desc: "Administrators set up the academy dashboard, manage licenses, and define school-wide impact goals.",
                },
                {
                  icon: "co_present",
                  borderColor: "#e8542f",
                  num: "2",
                  title: "Teacher Setup",
                  desc: "Teachers organize classrooms, sync student rosters, and assign curriculum-aligned projects in minutes.",
                },
                {
                  icon: "rocket_launch",
                  borderColor: "#0d6b5e",
                  num: "3",
                  title: "Student Learning",
                  desc: "Students dive into hands-on project guides, building real-world solutions and earning verified badges.",
                },
              ].map(({ icon, borderColor, num, title, desc }) => (
                <div key={num} className="relative flex flex-col items-center text-center group">
                  <div
                    className="w-20 h-20 rounded-2xl bg-(--bg-card) flex items-center justify-center mb-6 relative z-10 transition-all duration-300"
                    style={{ border: `2px solid ${borderColor}` }}
                  >
                    <span
                      className="material-symbols-outlined text-3xl"
                      style={{ color: borderColor }}
                    >
                      {icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-(--text-base) mb-4">
                    {num}. {title}
                  </h3>
                  <p className="text-sm text-(--text-muted) leading-relaxed px-4">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lessons in Action */}
        <section id="curriculum" className="py-24 px-6 bg-(--bg-page) overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-(--text-base)">Lessons in Action</h2>
              <p className="mt-4 text-(--text-muted)">
                Step-by-step guidance for complex project-based learning.
              </p>
            </div>
            <div className="relative max-w-5xl mx-auto rounded-2xl border border-(--border) bg-(--bg-card) overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="bg-(--bg-elevated)/50 px-6 py-3 flex items-center justify-between border-b border-(--border)">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs font-medium text-(--text-muted) uppercase tracking-widest">
                    Activity: JavaScript Chatbot
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-(--text-muted) text-lg">timer</span>
                  <span className="text-xs text-(--text-muted)">30 Min Step</span>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row">
                {/* Main content */}
                <div className="flex-1 p-8 lg:p-12 border-r border-(--border)">
                  <div className="mb-8">
                    <div className="inline-block px-3 py-1 bg-[rgba(232,84,47,0.15)] text-[#e8542f] text-[10px] font-black uppercase tracking-widest rounded mb-4">
                      Step 03: Response Logic
                    </div>
                    <h4 className="text-3xl font-bold text-(--text-base) mb-6">
                      Building the Reply Engine
                    </h4>
                    <div className="w-full rounded-xl bg-[#1e293b] border border-(--border) overflow-hidden font-mono text-sm">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#334155]/50 border-b border-[#334155]">
                        <span className="material-symbols-outlined text-yellow-400 text-sm">
                          javascript
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                          chatbot.js
                        </span>
                      </div>
                      <div className="p-4 space-y-1 text-[13px] leading-relaxed">
                        <div>
                          <span className="text-purple-400">function</span>{" "}
                          <span className="text-yellow-300">getReply</span>
                          <span className="text-slate-400">(message) {"{"}</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-purple-400">const</span>{" "}
                          <span className="text-sky-300">msg</span>{" "}
                          <span className="text-slate-400">=</span>{" "}
                          <span className="text-slate-400">message.</span>
                          <span className="text-yellow-300">toLowerCase</span>
                          <span className="text-slate-400">();</span>
                        </div>
                        <div className="pl-4 mt-2">
                          <span className="text-purple-400">if</span>{" "}
                          <span className="text-slate-400">(msg.</span>
                          <span className="text-yellow-300">includes</span>
                          <span className="text-slate-400">(</span>
                          <span className="text-green-400">&quot;hello&quot;</span>
                          <span className="text-slate-400">))</span>
                        </div>
                        <div className="pl-8">
                          <span className="text-purple-400">return</span>{" "}
                          <span className="text-green-400">
                            &quot;Hi there! How can I help?&quot;
                          </span>
                          <span className="text-slate-400">;</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-purple-400">if</span>{" "}
                          <span className="text-slate-400">(msg.</span>
                          <span className="text-yellow-300">includes</span>
                          <span className="text-slate-400">(</span>
                          <span className="text-green-400">&quot;weather&quot;</span>
                          <span className="text-slate-400">))</span>
                        </div>
                        <div className="pl-8">
                          <span className="text-purple-400">return</span>{" "}
                          <span className="text-green-400">
                            &quot;Nairobi is sunny today!&quot;
                          </span>
                          <span className="text-slate-400">;</span>
                        </div>
                        <div className="pl-4 mt-2">
                          <span className="text-purple-400">return</span>{" "}
                          <span className="text-green-400">&quot;Tell me more!&quot;</span>
                          <span className="text-slate-400">;</span>
                        </div>
                        <div>
                          <span className="text-slate-400">{"}"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-(--text-muted) leading-relaxed mb-6">
                    Create a function that reads the user&apos;s message and returns a matching
                    reply. Use{" "}
                    <code className="text-[#0d6b5e] bg-[rgba(13,107,94,0.1)] px-1.5 py-0.5 rounded text-xs">
                      includes()
                    </code>{" "}
                    to check for keywords and build branching logic that gives your chatbot
                    personality.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 bg-(--bg-elevated) text-(--text-base) font-bold rounded-lg text-sm hover:brightness-110 transition-all">
                      Previous Step
                    </button>
                    <button className="px-6 py-2 bg-[#0d6b5e] text-white font-bold rounded-lg text-sm hover:bg-[#0a5a4f] transition-all">
                      Mark as Complete
                    </button>
                  </div>
                </div>
                {/* Sidebar navigation */}
                <div className="w-full lg:w-72 bg-(--bg-surface) p-6">
                  <h5 className="text-xs font-black uppercase text-(--text-faint) tracking-widest mb-6">
                    Course Navigation
                  </h5>
                  <div className="space-y-4">
                    {[
                      { num: "01", label: "Project Setup" },
                      { num: "02", label: "HTML Chat UI" },
                    ].map(({ num, label }) => (
                      <div key={num} className="flex items-start gap-3 opacity-50">
                        <span className="material-symbols-outlined text-[#0d6b5e] text-sm">
                          check_circle
                        </span>
                        <div className="text-xs text-(--text-muted)">
                          {num}: {label}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full border border-[#e8542f] flex items-center justify-center text-[10px] text-[#e8542f] font-bold shrink-0">
                        03
                      </span>
                      <div className="text-xs text-(--text-base) font-bold">Response Logic</div>
                    </div>
                    {[
                      { num: "04", label: "Event Listeners" },
                      { num: "05", label: "Styling & Polish" },
                      { num: "06", label: "Deploy & Share" },
                    ].map(({ num, label }) => (
                      <div key={num} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full border border-(--border) flex items-center justify-center text-[10px] text-(--text-faint) font-bold shrink-0">
                          {num}
                        </span>
                        <div className="text-xs text-(--text-faint)">{label}</div>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-(--border) mt-6">
                      <div className="p-4 rounded-lg bg-(--bg-card) border border-(--border) text-center">
                        <div className="text-[10px] font-black uppercase text-[#0d6b5e] mb-2">
                          Next Badge
                        </div>
                        <div className="text-xs font-bold text-(--text-base)">JS Developer I</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Classroom Integration */}
        <section className="py-24 px-6 bg-(--bg-surface) border-y border-(--border)">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left — animated sync visual */}
              <div className="order-2 lg:order-1 relative">
                <div className="relative bg-(--bg-page) rounded-3xl p-8 border border-(--border) shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[rgba(13,107,94,0.05)]" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-12 mb-12">
                      <div className="w-20 h-20 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center">
                        <div className="w-full h-full bg-emerald-600 rounded flex items-center justify-center text-white font-black text-2xl">
                          G
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-0.5 bg-(--bg-elevated) relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#0d6b5e] flex items-center justify-center shadow-lg shadow-[rgba(13,107,94,0.4)]">
                            <span className="material-symbols-outlined text-xs font-bold text-white">
                              sync
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-(--bg-card) border border-[#0d6b5e] p-4 shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#0d6b5e] text-3xl">
                          token
                        </span>
                      </div>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="h-10 w-full rounded-lg bg-(--bg-elevated)/30 animate-pulse" />
                      <div className="h-10 w-3/4 rounded-lg bg-(--bg-elevated)/30 animate-pulse" />
                      <div className="h-10 w-full rounded-lg bg-(--bg-elevated)/30 animate-pulse" />
                    </div>
                    <button className="mt-8 px-8 py-3 bg-[#0d6b5e] text-white font-black rounded-xl shadow-lg shadow-[rgba(13,107,94,0.2)] hover:scale-105 transition-transform flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">touch_app</span>
                      One-click Sync
                    </button>
                  </div>
                </div>
              </div>
              {/* Right — text */}
              <div className="order-1 lg:order-2 flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-[rgba(13,107,94,0.15)] flex items-center justify-center text-[#0d6b5e]">
                  <span className="material-symbols-outlined">sync_alt</span>
                </div>
                <h2 className="text-4xl font-black text-(--text-base)">
                  Seamless Google Classroom Integration
                </h2>
                <p className="text-lg text-(--text-muted)">
                  Sync your entire school roster in seconds. Automatically import classes, push
                  assignments, and return grades directly to your existing workspace.
                </p>
                <ul className="space-y-4">
                  {[
                    "Automatic Roster Management",
                    "Single Sign-On (SSO) Support",
                    "Direct Gradebook Export",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-(--text-base) font-bold">
                      <span className="material-symbols-outlined text-[#0d6b5e]">
                        verified_user
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Recognized Achievement System */}
        <section className="bg-(--bg-page) py-20 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-(--text-base)">Recognized Achievement System</h2>
              <div className="mt-4 h-1 w-20 bg-[#0d6b5e]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "code_blocks",
                  color: "#0d6b5e",
                  hoverBorder: "hover:border-[rgba(13,107,94,0.5)]",
                  title: "Master Architect",
                  desc: "Advanced proficiency in computational thinking and structural logic.",
                  count: "12,403 Earned",
                },
                {
                  icon: "eco",
                  color: "#e8542f",
                  hoverBorder: "hover:border-[rgba(232,84,47,0.5)]",
                  title: "Green Innovator",
                  desc: "Demonstrated impact in sustainable engineering and environmental solutions.",
                  count: "8,912 Earned",
                },
                {
                  icon: "precision_manufacturing",
                  color: "#0d6b5e",
                  hoverBorder: "hover:border-[rgba(13,107,94,0.5)]",
                  title: "Robotics Lead",
                  desc: "Expertise in automated systems and mechanical design principles.",
                  count: "5,667 Earned",
                },
              ].map(({ icon, color, hoverBorder, title, desc, count }) => (
                <div
                  key={title}
                  className={`flex flex-col items-center rounded-xl bg-(--bg-card) p-8 border border-(--border) text-center transition-all group ${hoverBorder}`}
                >
                  <div
                    className="mb-6 rounded-full p-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${color}18`, color }}
                  >
                    <span className="material-symbols-outlined text-4xl">{icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-(--text-base)">{title}</h4>
                  <p className="mt-2 text-(--text-muted) text-sm">{desc}</p>
                  <span className="mt-4 text-xs font-bold uppercase" style={{ color }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* School Registration CTA */}
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) bg-(--bg-page) px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="mb-6 inline-flex">
                <span className="bg-white rounded-lg px-3 py-1.5 inline-flex items-center">
                  <Image
                    src="/images/logo/sic-academy.png"
                    alt="STEM Impact Academy"
                    height={36}
                    width={180}
                    style={{ height: "36px", width: "auto" }}
                  />
                </span>
              </div>
              <p className="text-sm text-(--text-faint)">
                Driving global innovation through accessible, project-based STEM education for every
                student.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              {[
                {
                  heading: "Platform",
                  links: [
                    { label: "Curriculum", href: "/#curriculum" },
                    { label: "Badges", href: "/#solutions" },
                    { label: "Educators", href: "/educators" },
                  ],
                },
                {
                  heading: "Company",
                  links: [
                    { label: "About Us", href: "/about" },
                    { label: "Help Center", href: "/help" },
                    { label: "Contact", href: "/contact" },
                  ],
                },
                {
                  heading: "Legal",
                  links: [
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                  ],
                },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <h4 className="font-bold text-(--text-base) mb-4">{heading}</h4>
                  <ul className="space-y-2 text-sm text-(--text-faint)">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="hover:text-[#0d6b5e] transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 border-t border-(--border) pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-(--text-faint)">
              &copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="https://stemimpactcenterkenya.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--text-faint) hover:text-[#0d6b5e] transition-colors"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <Link
                href="/contact"
                className="text-(--text-faint) hover:text-[#0d6b5e] transition-colors"
              >
                <span className="material-symbols-outlined">alternate_email</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
