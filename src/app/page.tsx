import PublicNavbar from "@/components/PublicNavbar";
import Link from "next/link";

const courses = [
  { icon: "bolt", color: "#f59e0b", title: "Circuitry & Electronics", desc: "Build real circuits and understand how electricity flows through the world around you.", level: "Beginner" },
  { icon: "sports_esports", color: "#8b5cf6", title: "Game Design", desc: "Create your own video games from scratch using industry-standard tools and code.", level: "Intermediate" },
  { icon: "language", color: "#3b82f6", title: "Web Literacy", desc: "Design and build websites that make an impact. HTML, CSS, and beyond.", level: "Beginner" },
  { icon: "code", color: "#13eca4", title: "Coding & Python", desc: "Master programming fundamentals and bring your ideas to life with real code.", level: "Beginner" },
  { icon: "eco", color: "#10b981", title: "Green Technology", desc: "Explore how technology can solve environmental challenges and build a better future.", level: "All Levels" },
  { icon: "precision_manufacturing", color: "#06b6d4", title: "Robotics", desc: "Design, build, and program robots that can sense and interact with the physical world.", level: "Intermediate" },
];

const stats = [
  { number: "50,000+", label: "Young Learners" },
  { number: "1,200+", label: "Partner Schools" },
  { number: "200+", label: "Project-Based Courses" },
  { number: "48", label: "US States & Territories" },
];

const testimonials = [
  {
    quote: "Mouse Create completely changed how my students engage with technology. They go from passive consumers to active creators.",
    name: "Ms. Aisha Williams",
    role: "STEM Teacher, Brooklyn, NY",
    initials: "AW",
    color: "#13eca4",
  },
  {
    quote: "I built my first website at 14 with Mouse. Now I'm studying Computer Science. It genuinely started my journey.",
    name: "Kevin Osei",
    role: "Former Student, Now CS Undergrad",
    initials: "KO",
    color: "#8b5cf6",
  },
  {
    quote: "The project-based curriculum fits perfectly into our after-school program. Kids are excited to come in every day.",
    name: "Director Priya Patel",
    role: "Community Center, Chicago, IL",
    initials: "PP",
    color: "#f59e0b",
  },
];

const partners = ["Schools", "Community Centers", "Afterschool Programs", "Libraries", "Youth Organizations"];

export default function Home() {
  return (
    <div className="tech-gradient min-h-screen text-white overflow-x-hidden">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[rgba(19,236,164,0.15)] rounded-2xl rotate-12 hidden lg:block animate-float" />
        <div className="absolute top-20 right-14 w-20 h-20 border-2 border-[rgba(255,77,77,0.15)] rounded-full hidden lg:block animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-20 w-16 h-16 bg-[rgba(19,236,164,0.06)] rounded-xl rotate-45 hidden lg:block" />

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.2)] text-[#13eca4] text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
          Hands-on Tech & Design Education for Young People
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-8 max-w-5xl mx-auto">
          Build the Skills to{" "}
          <span className="relative">
            <span className="text-[#13eca4]">Create</span>
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-[#13eca4] to-transparent rounded-full" />
          </span>{" "}
          Anything
        </h1>

        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-12">
          Mouse Create empowers young people with the tech & design skills they need to become
          <span className="text-white font-semibold"> creative problem solvers</span>. 
          Project-based courses in circuitry, coding, game design, and more.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition-all shadow-2xl shadow-[rgba(19,236,164,0.3)] animate-pulse-glow"
          >
            Start Learning Free
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link
            href="/educators"
            className="flex items-center gap-2 border border-[rgba(255,255,255,0.15)] text-white font-semibold px-8 py-4 rounded-xl text-lg hover:border-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.05)] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
            For Educators
          </Link>
        </div>

        {/* Partner types */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
          <span>Trusted by educators at:</span>
          {partners.map((p) => (
            <span
              key={p}
              className="px-3 py-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-full font-medium text-slate-300"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-pattern -z-10 opacity-30 pointer-events-none" />
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[rgba(19,236,164,0.08)] bg-[rgba(0,0,0,0.2)]">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ number, label }) => (
            <div key={label}>
              <p className="text-4xl font-bold text-[#13eca4] mb-1">{number}</p>
              <p className="text-slate-400 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-[#13eca4] text-sm font-bold uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl font-bold mt-3 text-white">Your journey to becoming a creator</h2>
          <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto">
            From joining a class to showcasing your work — Mouse Create guides every step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: "groups",
              color: "#13eca4",
              title: "Join Your Class",
              desc: "Enter a class code from your teacher or connect via Google Classroom to get started instantly.",
            },
            {
              step: "02",
              icon: "play_circle",
              color: "#8b5cf6",
              title: "Complete Projects",
              desc: "Work through hands-on, step-by-step lessons at your own pace. Build real things you can show off.",
            },
            {
              step: "03",
              icon: "military_tech",
              color: "#f59e0b",
              title: "Earn Badges & Level Up",
              desc: "Show your growth with certificates, badges, and a portfolio of projects you've created.",
            },
          ].map(({ step, icon, color, title, desc }) => (
            <div
              key={step}
              className="relative bg-[#1a2e27] rounded-2xl p-8 border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.2)] transition-all group"
            >
              <div
                className="absolute -top-4 -left-2 text-7xl font-black opacity-10 select-none"
                style={{ color }}
              >
                {step}
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[26px]" style={{ color }}>
                  {icon}
                </span>
              </div>
              <h3 className="text-white text-xl font-bold mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[#13eca4] text-sm font-bold uppercase tracking-widest">Course Catalog</span>
            <h2 className="text-4xl font-bold mt-3 text-white">Explore what you can build</h2>
            <p className="text-slate-400 text-lg mt-3 max-w-lg">
              Project-based courses designed to spark creativity and grow technical skills.
            </p>
          </div>
          <Link
            href="/courses"
            className="flex items-center gap-2 text-[#13eca4] font-semibold hover:underline whitespace-nowrap"
          >
            View all courses
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(({ icon, color, title, desc, level }) => (
            <div
              key={title}
              className="group bg-[#1a2e27] rounded-2xl p-6 border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.25)] hover:shadow-xl hover:shadow-[rgba(19,236,164,0.05)] transition-all cursor-pointer"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[26px]" style={{ color }}>{icon}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold group-hover:text-[#13eca4] transition-colors">{title}</h3>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${color}18`, color }}
                >
                  {level}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[#13eca4] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Explore course
                <span className="material-symbols-outlined text-[18px] animate-bounce-x">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For Educators Section */}
      <section className="bg-[rgba(19,236,164,0.04)] border-y border-[rgba(19,236,164,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#13eca4] text-sm font-bold uppercase tracking-widest">For Educators</span>
              <h2 className="text-4xl font-bold mt-3 text-white leading-snug">
                Build an environment where learners explore their creative identity
              </h2>
              <p className="text-slate-400 text-lg mt-5 leading-relaxed">
                Mouse Create gives educators the tools to integrate real tech & design projects into any
                program — whether you're a classroom teacher, community center director, or afterschool provider.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Assign courses tailored to your students' skill level",
                  "Track progress, grade submissions & give feedback",
                  "Sync seamlessly with Google Classroom",
                  "Access a library of 200+ ready-to-use project curricula",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-300">
                    <span className="text-[#13eca4] material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/register/teacher"
                  className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(19,236,164,0.25)]"
                >
                  Join as an Educator
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link
                  href="/onboarding"
                  className="flex items-center gap-2 border border-[rgba(255,255,255,0.15)] text-white font-semibold px-6 py-3.5 rounded-xl hover:border-[rgba(19,236,164,0.3)] transition-all"
                >
                  Onboard your School
                </Link>
              </div>
            </div>

            {/* Dashboard Preview Card */}
            <div className="relative">
              <div className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.12)] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">Teacher Dashboard</h3>
                    <p className="text-slate-400 text-sm">Grade 8 Robotics · 24 students</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    3 Active
                  </span>
                </div>
                {["Intro to Circuits", "Python Basics", "3D Design"].map((c, i) => (
                  <div key={c} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ["#3b82f6", "#8b5cf6", "#f97316"][i] }}
                    >
                      {c.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{c}</p>
                      <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#13eca4] to-[#0dd494] rounded-full"
                          style={{ width: `${[72, 45, 88][i]}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[#13eca4] text-xs font-bold">{[72, 45, 88][i]}%</span>
                  </div>
                ))}
                <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-3 gap-4 text-center">
                  {[["24", "Students"], ["156", "Submissions"], ["89%", "Engagement"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <p className="text-white font-bold text-xl">{val}</p>
                      <p className="text-slate-500 text-xs">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-[#1a2e27] border border-[rgba(19,236,164,0.2)] rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[28px]">military_tech</span>
                  <div>
                    <p className="text-white text-sm font-bold">Badge Earned!</p>
                    <p className="text-slate-400 text-xs">Circuit Master · +100 XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <span className="text-[#13eca4] text-sm font-bold uppercase tracking-widest">Stories</span>
          <h2 className="text-4xl font-bold mt-3 text-white">What educators & learners say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(({ quote, name, role, initials, color }) => (
            <div
              key={name}
              className="bg-[#1a2e27] rounded-2xl p-8 border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.2)] transition-all"
            >
              <div className="text-[#13eca4] mb-5">
                <span className="material-symbols-outlined text-[36px]">format_quote</span>
              </div>
              <p className="text-slate-300 text-base leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: color }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 text-center">
        <div className="relative bg-gradient-to-br from-[#13eca4] to-[#0dd494] rounded-3xl p-14 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[rgba(255,77,77,0.15)] rounded-full -ml-16 -mb-16" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-[#10221c] mb-4">
              Ready to start creating?
            </h2>
            <p className="text-[#10221c]/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join 50,000+ young people building tech & design skills that matter. It&apos;s free to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="bg-[#10221c] text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#1a3a2c] transition-colors shadow-2xl"
              >
                I&apos;m a Student
              </Link>
              <Link
                href="/register/teacher"
                className="bg-white/20 text-[#10221c] font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/30 transition-colors border border-[rgba(16,34,28,0.2)]"
              >
                I&apos;m an Educator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(19,236,164,0.08)] bg-[rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="text-[#13eca4] w-8 h-8">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
                    <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">mouse <span className="text-[#ff4d4d]">create</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Empowering young people with the tech & design skills to become creative problem solvers.
              </p>
            </div>
            {[
              { heading: "Platform", links: ["Student Portal", "Teacher Tools", "Admin Dashboard", "Course Library"] },
              { heading: "Learn", links: ["Coding", "Game Design", "Circuitry", "Web Literacy", "Green Tech"] },
              { heading: "For Educators", links: ["Join as Teacher", "Onboard School", "Help Center", "Contact Us"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-slate-400 text-sm hover:text-[#13eca4] transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(19,236,164,0.06)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2026 Mouse Create. All rights reserved. Empowering youth worldwide.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-[#13eca4] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[#13eca4] transition-colors">Terms</Link>
              <Link href="#" className="hover:text-[#13eca4] transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

