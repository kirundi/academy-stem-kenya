import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#102022] font-sans text-slate-100 antialiased overflow-x-hidden">
      <PublicNavbar />

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative px-6 py-16 lg:py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left */}
              <div className="flex flex-col gap-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(19,218,236,0.1)] border border-[rgba(19,218,236,0.2)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#13daec] w-fit">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Impact-Driven Education
                </div>
                <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-7xl text-slate-100">
                  Build Projects.<br />
                  <span className="text-[#13daec]">Earn Badges.</span><br />
                  Make an <span className="text-[#ff4d4d] italic">Impact.</span>
                </h1>
                <p className="max-w-xl text-lg text-slate-400">
                  Empowering the next generation of innovators through project-based STEM learning that delivers measurable real-world results.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/login"
                    className="rounded-lg bg-[#13daec] px-8 py-4 text-lg font-bold text-[#102022] shadow-lg shadow-[rgba(19,218,236,0.2)] hover:scale-[1.02] transition-transform"
                  >
                    Join the Academy
                  </Link>
                  <Link
                    href="/onboarding"
                    className="rounded-lg border border-[#283739] bg-[#1a2e30] px-8 py-4 text-lg font-bold hover:bg-[#283739] transition-colors"
                  >
                    View Impact Report
                  </Link>
                </div>
              </div>

              {/* Right — Skills Mastery Card */}
              <div className="relative">
                <div className="relative z-10 rounded-2xl border border-[#283739] bg-[#1a2e30] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#283739] pb-4">
                    <h3 className="font-bold text-slate-100">Student Skills Mastery</h3>
                    <span className="text-[#13daec] font-bold">85% Global Avg</span>
                  </div>
                  <div className="py-6">
                    <svg className="mx-auto" height="300" viewBox="0 0 100 100" width="300">
                      <circle cx="50" cy="50" fill="none" r="45" stroke="#283739" strokeWidth="0.5" />
                      <circle cx="50" cy="50" fill="none" r="30" stroke="#283739" strokeWidth="0.5" />
                      <circle cx="50" cy="50" fill="none" r="15" stroke="#283739" strokeWidth="0.5" />
                      <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="#283739" strokeWidth="0.5" />
                      <path d="M50 20 L75 35 L70 65 L40 75 L25 55 L30 30 Z" fill="rgba(19,218,236,0.3)" stroke="#13daec" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Coding</span>
                    <span>Robotics</span>
                    <span>Design</span>
                  </div>
                </div>
                {/* Floating badge — top right */}
                <div className="absolute -right-6 -top-6 z-20 h-24 w-24 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 p-4 shadow-xl rotate-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white">workspace_premium</span>
                </div>
                {/* Floating icon — bottom left */}
                <div className="absolute -bottom-10 -left-10 z-20 h-32 w-32 rounded-xl bg-linear-to-br from-blue-400 to-[#13daec] p-4 shadow-xl -rotate-12 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-white">science</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple 3-Step Implementation */}
        <section id="solutions" className="py-24 px-6 bg-[rgba(26,46,48,0.2)] relative">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-100">Simple 3-Step Implementation</h2>
              <p className="mt-4 text-slate-400">From setup to mastery, we make STEM integration effortless.</p>
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
                    className="w-20 h-20 rounded-2xl bg-[#1a2e30] flex items-center justify-center mb-6 relative z-10 transition-all duration-300"
                    style={{ border: `2px solid ${borderColor}` }}
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ color: borderColor }}>{icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-4">{num}. {title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed px-4">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lessons in Action */}
        <section id="curriculum" className="py-24 px-6 bg-[#102022] overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-100">Lessons in Action</h2>
              <p className="mt-4 text-slate-400">Step-by-step guidance for complex project-based learning.</p>
            </div>
            <div className="relative max-w-5xl mx-auto rounded-2xl border border-[#283739] bg-[#1a2e30] overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="bg-[rgba(40,55,57,0.5)] px-6 py-3 flex items-center justify-between border-b border-[#283739]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Activity: Building a Robot</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">timer</span>
                  <span className="text-xs text-slate-400">45 Min Step</span>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row">
                {/* Main content */}
                <div className="flex-1 p-8 lg:p-12 border-r border-[#283739]">
                  <div className="mb-8">
                    <div className="inline-block px-3 py-1 bg-[rgba(255,77,77,0.15)] text-[#ff4d4d] text-[10px] font-black uppercase tracking-widest rounded mb-4">
                      Step 04: Motor Integration
                    </div>
                    <h4 className="text-3xl font-bold text-slate-100 mb-6">Mounting the Primary Drive Motors</h4>
                    <div className="aspect-video w-full rounded-xl bg-slate-800 relative overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="Robot assembly"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlzHK5yWM6ct-5epWYffgEr24f-CLhHDhe-Rb2TpXI4o7Ejrrr2-zM079b6YmuVzyr15cZcSeSwUc1dvjYYlIP4X8DqDTOni8VmbQZNS64i_oEgJVULn-AjP1KbF6a_axWmYWmLG7NfXi0kAdT0ZjC1cpl_58WYqo5zvu67nY9eM0jAvCufQVkTL7C47Wy3dpEP4CJ9dv4jc0Fh2PjSWAXoNb7QYszjnrkPZbn7yEHzTcSu9Ads14idPnGHcW6GR29QoFQDJYy3LmV"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#102022]/80 to-transparent flex items-end p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#13daec] rounded-lg text-[#102022]">
                            <span className="material-symbols-outlined">play_circle</span>
                          </div>
                          <span className="text-sm font-bold text-white">Watch Video Tutorial</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    Align the servo motor brackets with the pre-drilled holes on the chassis plate. Ensure the wires are facing toward the central control hub to prevent tension during movement.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-2 bg-[#283739] text-slate-100 font-bold rounded-lg text-sm hover:bg-slate-700 transition-colors">
                      Previous Step
                    </button>
                    <button className="px-6 py-2 bg-[#13daec] text-[#102022] font-bold rounded-lg text-sm hover:brightness-110 transition-all">
                      Mark as Complete
                    </button>
                  </div>
                </div>
                {/* Sidebar navigation */}
                <div className="w-full lg:w-72 bg-[rgba(16,32,34,0.3)] p-6">
                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6">Course Navigation</h5>
                  <div className="space-y-4">
                    {[
                      { num: "01", label: "Project Intro" },
                      { num: "02", label: "Safety Protocol" },
                      { num: "03", label: "Chassis Assembly" },
                    ].map(({ num, label }) => (
                      <div key={num} className="flex items-start gap-3 opacity-50">
                        <span className="material-symbols-outlined text-[#13daec] text-sm">check_circle</span>
                        <div className="text-xs text-slate-300">{num}: {label}</div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full border border-[#ff4d4d] flex items-center justify-center text-[10px] text-[#ff4d4d] font-bold shrink-0">04</span>
                      <div className="text-xs text-slate-100 font-bold">Motor Integration</div>
                    </div>
                    {[
                      { num: "05", label: "Sensor Calibration" },
                      { num: "06", label: "Logic Programming" },
                    ].map(({ num, label }) => (
                      <div key={num} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full border border-[#283739] flex items-center justify-center text-[10px] text-slate-500 font-bold shrink-0">{num}</span>
                        <div className="text-xs text-slate-500">{label}</div>
                      </div>
                    ))}
                    <div className="pt-6 border-t border-[#283739] mt-6">
                      <div className="p-4 rounded-lg bg-[#1a2e30] border border-[#283739] text-center">
                        <div className="text-[10px] font-black uppercase text-[#13daec] mb-2">Next Badge</div>
                        <div className="text-xs font-bold text-slate-200">Robotics Lead I</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Classroom Integration */}
        <section className="py-24 px-6 bg-[rgba(26,46,48,0.4)] border-y border-[#283739]">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left — animated sync visual */}
              <div className="order-2 lg:order-1 relative">
                <div className="relative bg-[#102022] rounded-3xl p-8 border border-[#283739] shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[rgba(19,218,236,0.05)]" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-12 mb-12">
                      <div className="w-20 h-20 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center">
                        <div className="w-full h-full bg-emerald-600 rounded flex items-center justify-center text-white font-black text-2xl">G</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-0.5 bg-[#283739] relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#13daec] flex items-center justify-center shadow-lg shadow-[rgba(19,218,236,0.4)]">
                            <span className="material-symbols-outlined text-xs font-bold text-[#102022]">sync</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-[#1a2e30] border border-[#13daec] p-4 shadow-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#13daec] text-3xl">token</span>
                      </div>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="h-10 w-full rounded-lg bg-[rgba(40,55,57,0.3)] animate-pulse" />
                      <div className="h-10 w-3/4 rounded-lg bg-[rgba(40,55,57,0.3)] animate-pulse" />
                      <div className="h-10 w-full rounded-lg bg-[rgba(40,55,57,0.3)] animate-pulse" />
                    </div>
                    <button className="mt-8 px-8 py-3 bg-[#13daec] text-[#102022] font-black rounded-xl shadow-lg shadow-[rgba(19,218,236,0.2)] hover:scale-105 transition-transform flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">touch_app</span>
                      One-click Sync
                    </button>
                  </div>
                </div>
              </div>
              {/* Right — text */}
              <div className="order-1 lg:order-2 flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-[rgba(19,218,236,0.2)] flex items-center justify-center text-[#13daec]">
                  <span className="material-symbols-outlined">sync_alt</span>
                </div>
                <h2 className="text-4xl font-black text-slate-100">Seamless Google Classroom Integration</h2>
                <p className="text-lg text-slate-400">
                  Sync your entire school roster in seconds. Automatically import classes, push assignments, and return grades directly to your existing workspace.
                </p>
                <ul className="space-y-4">
                  {[
                    "Automatic Roster Management",
                    "Single Sign-On (SSO) Support",
                    "Direct Gradebook Export",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-200 font-bold">
                      <span className="material-symbols-outlined text-[#13daec]">verified_user</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Recognized Achievement System */}
        <section className="bg-[rgba(26,46,48,0.3)] py-20 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-slate-100">Recognized Achievement System</h2>
              <div className="mt-4 h-1 w-20 bg-[#13daec]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "code_blocks",
                  color: "#13daec",
                  hoverBorder: "hover:border-[rgba(19,218,236,0.5)]",
                  title: "Master Architect",
                  desc: "Advanced proficiency in computational thinking and structural logic.",
                  count: "12,403 Earned",
                },
                {
                  icon: "eco",
                  color: "#ff4d4d",
                  hoverBorder: "hover:border-[rgba(255,77,77,0.5)]",
                  title: "Green Innovator",
                  desc: "Demonstrated impact in sustainable engineering and environmental solutions.",
                  count: "8,912 Earned",
                },
                {
                  icon: "precision_manufacturing",
                  color: "#13daec",
                  hoverBorder: "hover:border-[rgba(19,218,236,0.5)]",
                  title: "Robotics Lead",
                  desc: "Expertise in automated systems and mechanical design principles.",
                  count: "5,667 Earned",
                },
              ].map(({ icon, color, hoverBorder, title, desc, count }) => (
                <div
                  key={title}
                  className={`flex flex-col items-center rounded-xl bg-[#1a2e30] p-8 border border-[#283739] text-center transition-all group ${hoverBorder}`}
                >
                  <div
                    className="mb-6 rounded-full p-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${color}18`, color }}
                  >
                    <span className="material-symbols-outlined text-4xl">{icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-100">{title}</h4>
                  <p className="mt-2 text-slate-400 text-sm">{desc}</p>
                  <span className="mt-4 text-xs font-bold uppercase" style={{ color }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* School Registration CTA */}
        <section id="about" className="py-24 px-6 relative overflow-hidden">
          <div className="mx-auto max-w-5xl rounded-3xl bg-[#13daec] px-8 py-16 lg:px-20 relative overflow-hidden">
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
                <h2 className="text-4xl font-black text-[#102022] leading-tight">Bring STEM Impact to Your School</h2>
                <p className="mt-6 text-[#102022]/80 text-lg leading-relaxed font-medium">
                  Join 500+ forward-thinking schools transforming their curriculum with our project-based learning framework.
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
              <div className="rounded-2xl bg-[rgba(16,32,34,0.1)] p-1 backdrop-blur-sm">
                <div className="rounded-xl bg-slate-100 p-8 shadow-2xl text-slate-900">
                  <h3 className="text-xl font-bold mb-6">School Registration</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">First Name</label>
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-[#13daec]"
                          placeholder="Jane"
                          type="text"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Last Name</label>
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-[#13daec]"
                          placeholder="Doe"
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">Work Email</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-[#13daec]"
                        placeholder="jane@school.edu"
                        type="email"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">School Name</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-[#13daec]"
                        placeholder="West Valley Academy"
                        type="text"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-500">Role</label>
                      <select className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:border-[#13daec]">
                        <option>School Administrator</option>
                        <option>Department Head</option>
                        <option>Teacher</option>
                        <option>District Official</option>
                      </select>
                    </div>
                    <Link
                      href="/onboarding"
                      className="mt-4 w-full rounded-lg bg-[#102022] py-4 font-bold text-white shadow-lg hover:brightness-125 transition-all text-center block"
                    >
                      Request Demo Access
                    </Link>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#283739] bg-[#102022] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-2xl text-[#13daec]">token</span>
                <h2 className="text-lg font-bold tracking-tight text-slate-100 uppercase italic">
                  STEM <span className="text-[#ff4d4d]">Impact</span>
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Driving global innovation through accessible, project-based STEM education for every student.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              {[
                { heading: "Platform", links: [
                  { label: "Curriculum", href: "/#curriculum" },
                  { label: "Badges", href: "/#solutions" },
                  { label: "Educators", href: "/educators" },
                ]},
                { heading: "Company", links: [
                  { label: "About Us", href: "/about" },
                  { label: "Help Center", href: "/help" },
                  { label: "Contact", href: "/contact" },
                ]},
                { heading: "Legal", links: [
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ]},
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <h4 className="font-bold text-slate-200 mb-4">{heading}</h4>
                  <ul className="space-y-2 text-sm text-slate-500">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="hover:text-[#13daec] transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 border-t border-[#283739] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">&copy; 2024 STEM Impact Academy. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="https://stemimpactcenterkenya.org" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#13daec] transition-colors">
                <span className="material-symbols-outlined">public</span>
              </a>
              <Link href="/contact" className="text-slate-600 hover:text-[#13daec] transition-colors">
                <span className="material-symbols-outlined">alternate_email</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
