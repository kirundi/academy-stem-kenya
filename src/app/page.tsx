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
      <div className="mx-auto max-w-5xl rounded-3xl bg-primary px-8 py-16 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="40" id="cta-grid" patternUnits="userSpaceOnUse" width="40">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#cta-grid)" height="100%" width="100%" />
          </svg>
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black text-[#102022] leading-tight">
              Bring STEM Impact to Your School
            </h2>
            <p className="mt-6 text-(--text-base)/80 text-lg leading-relaxed font-medium">
              Join 500+ forward-thinking schools transforming their curriculum with our
              project-based learning framework.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Administrator Dashboard",
                "Standard-Aligned Curriculum",
                "Teacher Training & Support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#102022] font-bold">
                  <span className="material-symbols-outlined font-bold">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-(--bg-surface)/10 p-1 backdrop-blur-sm">
            <div className="rounded-xl bg-slate-100 p-8 shadow-2xl text-slate-900">
              <h3 className="text-xl font-bold mb-6">School Registration</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-(--text-faint)">
                      First Name *
                    </label>
                    <input
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-primary"
                      placeholder="Jane"
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-(--text-faint)">Last Name</label>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-primary"
                      placeholder="Doe"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-(--text-faint)">Work Email *</label>
                  <input
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-primary"
                    placeholder="jane@school.edu"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-(--text-faint)">
                    School Name *
                  </label>
                  <input
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-primary"
                    placeholder="West Valley Academy"
                    type="text"
                    value={form.schoolName}
                    onChange={(e) => setForm((p) => ({ ...p, schoolName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-(--text-faint)">Role</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-primary"
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
                  className="mt-4 w-full rounded-lg bg-(--bg-page) py-4 font-bold text-(--text-base) shadow-lg hover:brightness-125 transition-all text-center block"
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
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left */}
              <div className="flex flex-col gap-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary w-fit">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Impact-Driven Education
                </div>
                <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-7xl text-(--text-base)">
                  Build Projects.
                  <br />
                  <span className="text-primary">Earn Badges.</span>
                  <br />
                  Make an <span className="text-accent-red italic">Impact.</span>
                </h1>
                <p className="max-w-xl text-lg text-(--text-muted)">
                  Empowering the next generation of innovators through project-based STEM learning
                  that delivers measurable real-world results.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/login"
                    className="rounded-lg bg-accent-orange px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[rgba(249,115,22,0.25)] hover:scale-[1.02] transition-transform"
                  >
                    Join the Academy
                  </Link>
                  <Link
                    href="#about"
                    className="rounded-lg border border-(--border) bg-(--bg-card) px-8 py-4 text-lg font-bold hover:bg-(--bg-elevated) transition-colors"
                  >
                    Register Your School
                  </Link>
                </div>
              </div>

              {/* Right — Skills Mastery Card */}
              <div className="relative">
                <div className="relative z-10 rounded-2xl border border-(--border) bg-(--bg-card) p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-(--border) pb-4">
                    <h3 className="font-bold text-(--text-base)">Student Skills Mastery</h3>
                    <span className="text-primary font-bold">85% Global Avg</span>
                  </div>
                  <div className="py-6">
                    <svg className="mx-auto" height="300" viewBox="0 0 100 100" width="300">
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="#283739"
                        strokeWidth="0.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="30"
                        stroke="#283739"
                        strokeWidth="0.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="15"
                        stroke="#283739"
                        strokeWidth="0.5"
                      />
                      <path
                        d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18"
                        stroke="#283739"
                        strokeWidth="0.5"
                      />
                      <path
                        d="M50 20 L75 35 L70 65 L40 75 L25 55 L30 30 Z"
                        fill="rgba(19,218,236,0.3)"
                        stroke="#13daec"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-(--text-faint)">
                    <span>Coding</span>
                    <span>Robotics</span>
                    <span>Design</span>
                  </div>
                </div>
                {/* Floating badge — top right */}
                <div className="absolute -right-6 -top-6 z-20 h-24 w-24 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 p-4 shadow-xl rotate-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-(--text-base)">
                    workspace_premium
                  </span>
                </div>
                {/* Floating icon — bottom left */}
                <div className="absolute -bottom-10 -left-10 z-20 h-32 w-32 rounded-xl bg-linear-to-br from-blue-400 to-[#13daec] p-4 shadow-xl -rotate-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-(--text-base)">science</span>
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
              <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-linear-to-r from-transparent via-[#283739] to-transparent" />
              {[
                {
                  icon: "school",
                  borderColor: "#13daec",
                  num: "1",
                  title: "School Onboarding",
                  desc: "Administrators set up the academy dashboard, manage licenses, and define school-wide impact goals.",
                },
                {
                  icon: "co_present",
                  borderColor: "#ff4d4d",
                  num: "2",
                  title: "Teacher Setup",
                  desc: "Teachers organize classrooms, sync student rosters, and assign curriculum-aligned projects in minutes.",
                },
                {
                  icon: "rocket_launch",
                  borderColor: "#13daec",
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
              <div className="bg-[rgba(40,55,57,0.5)] px-6 py-3 flex items-center justify-between border-b border-(--border)">
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
                    <div className="inline-block px-3 py-1 bg-accent-red/15 text-accent-red text-[10px] font-black uppercase tracking-widest rounded mb-4">
                      Step 03: Response Logic
                    </div>
                    <h4 className="text-3xl font-bold text-(--text-base) mb-6">
                      Building the Reply Engine
                    </h4>
                    <div className="w-full rounded-xl bg-(--bg-sidebar) border border-(--border) overflow-hidden font-mono text-sm">
                      <div className="flex items-center gap-2 px-4 py-2 bg-(--bg-elevated)/50 border-b border-(--border)">
                        <span className="material-symbols-outlined text-yellow-400 text-sm">
                          javascript
                        </span>
                        <span className="text-[10px] text-(--text-muted) uppercase tracking-widest">
                          chatbot.js
                        </span>
                      </div>
                      <div className="p-4 space-y-1 text-[13px] leading-relaxed">
                        <div>
                          <span className="text-purple-400">function</span>{" "}
                          <span className="text-yellow-300">getReply</span>
                          <span className="text-(--text-muted)">(message) {"{"}</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-purple-400">const</span>{" "}
                          <span className="text-sky-300">msg</span>{" "}
                          <span className="text-(--text-muted)">=</span>{" "}
                          <span className="text-(--text-muted)">message.</span>
                          <span className="text-yellow-300">toLowerCase</span>
                          <span className="text-(--text-muted)">();</span>
                        </div>
                        <div className="pl-4 mt-2">
                          <span className="text-purple-400">if</span>{" "}
                          <span className="text-(--text-muted)">(msg.</span>
                          <span className="text-yellow-300">includes</span>
                          <span className="text-(--text-muted)">(</span>
                          <span className="text-green-400">&quot;hello&quot;</span>
                          <span className="text-(--text-muted)">))</span>
                        </div>
                        <div className="pl-8">
                          <span className="text-purple-400">return</span>{" "}
                          <span className="text-green-400">
                            &quot;Hi there! How can I help?&quot;
                          </span>
                          <span className="text-(--text-muted)">;</span>
                        </div>
                        <div className="pl-4">
                          <span className="text-purple-400">if</span>{" "}
                          <span className="text-(--text-muted)">(msg.</span>
                          <span className="text-yellow-300">includes</span>
                          <span className="text-(--text-muted)">(</span>
                          <span className="text-green-400">&quot;weather&quot;</span>
                          <span className="text-(--text-muted)">))</span>
                        </div>
                        <div className="pl-8">
                          <span className="text-purple-400">return</span>{" "}
                          <span className="text-green-400">
                            &quot;Nairobi is sunny today!&quot;
                          </span>
                          <span className="text-(--text-muted)">;</span>
                        </div>
                        <div className="pl-4 mt-2">
                          <span className="text-purple-400">return</span>{" "}
                          <span className="text-green-400">&quot;Tell me more!&quot;</span>
                          <span className="text-(--text-muted)">;</span>
                        </div>
                        <div>
                          <span className="text-(--text-muted)">{"}"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-(--text-muted) leading-relaxed mb-6">
                    Create a function that reads the user&apos;s message and returns a matching
                    reply. Use{" "}
                    <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">
                      includes()
                    </code>{" "}
                    to check for keywords and build branching logic that gives your chatbot
                    personality.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 bg-(--bg-elevated) text-(--text-base) font-bold rounded-lg text-sm hover:bg-(--bg-elevated) transition-colors">
                      Previous Step
                    </button>
                    <button className="px-6 py-2 bg-primary-green text-white font-bold rounded-lg text-sm hover:brightness-110 transition-all">
                      Mark as Complete
                    </button>
                  </div>
                </div>
                {/* Sidebar navigation */}
                <div className="w-full lg:w-72 bg-(--bg-surface)/30 p-6">
                  <h5 className="text-xs font-black uppercase text-(--text-faint) tracking-widest mb-6">
                    Course Navigation
                  </h5>
                  <div className="space-y-4">
                    {[
                      { num: "01", label: "Project Setup" },
                      { num: "02", label: "HTML Chat UI" },
                    ].map(({ num, label }) => (
                      <div key={num} className="flex items-start gap-3 opacity-50">
                        <span className="material-symbols-outlined text-primary text-sm">
                          check_circle
                        </span>
                        <div className="text-xs text-(--text-muted)">
                          {num}: {label}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full border border-accent-red flex items-center justify-center text-[10px] text-accent-red font-bold shrink-0">
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
                        <div className="text-[10px] font-black uppercase text-primary mb-2">
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
        <section className="py-24 px-6 bg-(--bg-card-alt) border-y border-(--border)">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left — animated sync visual */}
              <div className="order-2 lg:order-1 relative">
                <div className="relative bg-(--bg-page) rounded-3xl p-8 border border-(--border) shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-12 mb-12">
                      <div className="w-20 h-20 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center">
                        <div className="w-full h-full bg-emerald-600 rounded flex items-center justify-center text-(--text-base) font-black text-2xl">
                          G
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-0.5 bg-(--bg-elevated) relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                            <span className="material-symbols-outlined text-xs font-bold text-[#102022]">
                              sync
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-(--bg-card) border border-primary p-4 shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">
                          token
                        </span>
                      </div>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="h-10 w-full rounded-lg bg-(--bg-elevated)/30 animate-pulse" />
                      <div className="h-10 w-3/4 rounded-lg bg-(--bg-elevated)/30 animate-pulse" />
                      <div className="h-10 w-full rounded-lg bg-(--bg-elevated)/30 animate-pulse" />
                    </div>
                    <button className="mt-8 px-8 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">touch_app</span>
                      One-click Sync
                    </button>
                  </div>
                </div>
              </div>
              {/* Right — text */}
              <div className="order-1 lg:order-2 flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
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
                      <span className="material-symbols-outlined text-primary">
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
        <section className="bg-(--bg-surface) py-20 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-(--text-base)">Recognized Achievement System</h2>
              <div className="mt-4 h-1 w-20 bg-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "code_blocks",
                  color: "#13daec",
                  hoverBorder: "hover:border-primary/50",
                  title: "Master Architect",
                  desc: "Advanced proficiency in computational thinking and structural logic.",
                  count: "12,403 Earned",
                },
                {
                  icon: "eco",
                  color: "#ff4d4d",
                  hoverBorder: "hover:border-accent-red/50",
                  title: "Green Innovator",
                  desc: "Demonstrated impact in sustainable engineering and environmental solutions.",
                  count: "8,912 Earned",
                },
                {
                  icon: "precision_manufacturing",
                  color: "#13daec",
                  hoverBorder: "hover:border-primary/50",
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
                        <Link href={link.href} className="hover:text-primary transition-colors">
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
                className="text-(--text-faint) hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <Link
                href="/contact"
                className="text-(--text-faint) hover:text-primary transition-colors"
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
