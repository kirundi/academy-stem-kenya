"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── New palette constants (LearnIQ-inspired) ────────────────────────────── */
const C = {
  /* Brand */
  primary:        "#f97316", // warm orange  — CTA, active states
  primaryDark:    "#ea6b0e",
  secondary:      "#8b5cf6", // soft purple  — secondary accent
  secondaryDark:  "#7c3aed",
  blue:           "#3b82f6",
  green:          "#22c55e",

  /* Backgrounds — soft blue-gray wash (from image) */
  bgPage:         "#eef1f8", // page wash
  bgCard:         "#ffffff", // pure white cards
  bgSurface:      "#e4e9f4", // panel/sidebar tint
  bgElevated:     "#d8e0f0", // elevated areas
  bgDark:         "#1a1a2e", // nav selected, dark elements

  /* Pastel course-card accents (mint / rose / lavender) */
  mint:           "#6ecfc3",
  mintBg:         "#e6f7f5",
  rose:           "#e8928c",
  roseBg:         "#fce8e8",
  lavender:       "#a594d6",
  lavenderBg:     "#ede8f8",

  /* Typography */
  textBase:       "#1a1a2e",
  textMuted:      "#6b7280",
  textFaint:      "#9ca3af",

  /* Borders & focus rings */
  border:         "#dde4f0",
  borderOrange:   "rgba(249,115,22,0.25)",
  borderPurple:   "rgba(139,92,246,0.25)",

  /* Status badges */
  badgeBlue:      { bg: "#dbeafe", text: "#1d4ed8" },
  badgeGreen:     { bg: "#dcfce7", text: "#15803d" },
  badgeYellow:    { bg: "#fef9c3", text: "#a16207" },
};

/* ─── Inline navbar for preview (no theme-toggle needed) ─────────────────── */
function PreviewNavbar() {
  const [open, setOpen] = useState(false);
  const navLinks = [
    { label: "Solutions",  href: "#solutions"  },
    { label: "Curriculum", href: "#curriculum" },
    { label: "Educators",  href: "#educators"  },
    { label: "About",      href: "#about"      },
  ];
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(238,241,248,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 1.5rem",
        boxShadow: "0 1px 12px rgba(26,26,46,0.07)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link href="/preview" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 20 }}>token</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: C.textBase, letterSpacing: "-0.02em" }}>
            STEM Impact <span style={{ color: C.primary }}>Academy</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }} className="hidden md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} style={{ fontSize: 14, fontWeight: 500, color: C.textMuted, textDecoration: "none" }}
               onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
               onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="hidden md:flex">
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, textDecoration: "none", padding: "8px 16px" }}>Login</Link>
          <a href="#about"
            style={{ background: C.primary, color: "#fff", borderRadius: 10, padding: "9px 22px", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: `0 4px 14px rgba(249,115,22,0.3)` }}>
            Get Started
          </a>
        </div>

        {/* Mobile */}
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 6 }} className="md:hidden">
          <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
        </button>
      </div>
      {open && (
        <div style={{ background: C.bgCard, borderTop: `1px solid ${C.border}`, padding: "12px 16px" }} className="md:hidden">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
               style={{ display: "block", padding: "10px 12px", borderRadius: 8, color: C.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
          <a href="#about" style={{ display: "block", marginTop: 8, textAlign: "center", background: C.primary, color: "#fff", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Get Started
          </a>
        </div>
      )}
    </header>
  );
}

/* ─── CTA / Registration form ─────────────────────────────────────────────── */
function CtaSection() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", schoolName: "", role: "School Administrator" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.schoolName) return;
    localStorage.setItem("stemimpact_prefill", JSON.stringify({ fullName: `${form.firstName} ${form.lastName}`.trim(), email: form.email, schoolName: form.schoolName, roleDesignation: form.role }));
    router.push("/onboarding");
  };
  return (
    <section id="about" style={{ padding: "96px 24px", background: C.bgPage }}>
      <div style={{ maxWidth: 960, margin: "0 auto", borderRadius: 28, background: `linear-gradient(135deg, ${C.primary} 0%, #fb923c 100%)`, padding: "64px 40px", position: "relative", overflow: "hidden" }}>
        {/* subtle grid overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.08, pointerEvents: "none" }}>
          <svg width="100%" height="100%"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect fill="url(#g)" width="100%" height="100%"/></svg>
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
              Bring STEM Impact to Your School
            </h2>
            <p style={{ marginTop: 20, color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.7, fontWeight: 500 }}>
              Join 500+ forward-thinking schools transforming their curriculum with our project-based learning framework.
            </p>
            <ul style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              {["Administrator Dashboard", "Standard-Aligned Curriculum", "Teacher Training & Support"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff", fontWeight: 700, fontSize: 15 }}>
                  <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 20 }}>check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Right — form */}
          <div style={{ background: C.bgCard, borderRadius: 18, padding: 36, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.textBase, marginBottom: 24 }}>School Registration</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["First Name *", "firstName", "Jane", "text", true], ["Last Name", "lastName", "Doe", "text", false]].map(([label, field, ph, type, req]) => (
                  <div key={field as string}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.textFaint, display: "block", marginBottom: 4 }}>{label as string}</label>
                    <input required={req as boolean} type={type as string} placeholder={ph as string} value={(form as Record<string,string>)[field as string]}
                      onChange={(e) => setForm((p) => ({ ...p, [field as string]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgSurface, fontSize: 14, color: C.textBase, outline: "none", boxSizing: "border-box" }}
                      onFocus={(e) => (e.target.style.borderColor = C.primary)}
                      onBlur={(e) => (e.target.style.borderColor = C.border)} />
                  </div>
                ))}
              </div>
              {[["Work Email *", "email", "jane@school.edu", "email", true], ["School Name *", "schoolName", "West Valley Academy", "text", true]].map(([label, field, ph, type, req]) => (
                <div key={field as string}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.textFaint, display: "block", marginBottom: 4 }}>{label as string}</label>
                  <input required={req as boolean} type={type as string} placeholder={ph as string} value={(form as Record<string,string>)[field as string]}
                    onChange={(e) => setForm((p) => ({ ...p, [field as string]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgSurface, fontSize: 14, color: C.textBase, outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = C.primary)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.textFaint, display: "block", marginBottom: 4 }}>Role</label>
                <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgSurface, fontSize: 14, color: C.textBase, outline: "none" }}>
                  <option>School Administrator</option>
                  <option>Department Head</option>
                  <option>Teacher</option>
                  <option>District Official</option>
                </select>
              </div>
              <button type="submit" style={{ marginTop: 8, background: C.primary, color: "#fff", borderRadius: 10, padding: "14px", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: `0 6px 20px rgba(249,115,22,0.35)` }}>
                Register Your School
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function PreviewPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bgPage, color: C.textBase }}>
      <PreviewNavbar />

      {/* ── DEMO BANNER ── */}
      <div style={{ background: C.bgDark, color: "#fff", textAlign: "center", padding: "10px 24px", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em" }}>
        🎨 COLOR SCHEME PREVIEW — This is a demo at <code style={{ background: "rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 6px" }}>/preview</code>. The live site is unchanged at <Link href="/" style={{ color: "#e9d5ff", textDecoration: "underline" }}>/</Link>
      </div>

      <main>
        {/* ── HERO ───────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px 100px", position: "relative", overflow: "hidden" }}>
          {/* background blobs */}
          <div style={{ position: "absolute", top: -120, right: -80, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -100, left: -100, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,207,195,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "40%", left: "40%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(165,148,214,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `rgba(249,115,22,0.1)`, border: `1px solid rgba(249,115,22,0.25)`, borderRadius: 99, padding: "5px 14px", width: "fit-content" }}>
                <span className="material-symbols-outlined" style={{ color: C.primary, fontSize: 16 }}>verified</span>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary }}>Impact-Driven Education</span>
              </div>

              <h1 style={{ fontSize: "clamp(38px,6vw,68px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", color: C.textBase }}>
                Build Projects.<br />
                <span style={{ color: C.primary }}>Earn Badges.</span><br />
                Make an{" "}
                <span style={{ color: C.secondary, fontStyle: "italic" }}>Impact.</span>
              </h1>

              <p style={{ fontSize: 18, color: C.textMuted, lineHeight: 1.7, maxWidth: 500 }}>
                Empowering the next generation of innovators through project-based STEM learning that delivers measurable real-world results.
              </p>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Link href="/login"
                  style={{ background: C.primary, color: "#fff", borderRadius: 12, padding: "14px 32px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: `0 8px 24px rgba(249,115,22,0.3)`, display: "inline-block" }}>
                  Join the Academy
                </Link>
                <a href="#about"
                  style={{ background: C.bgCard, border: `2px solid ${C.border}`, color: C.textBase, borderRadius: 12, padding: "14px 32px", fontSize: 17, fontWeight: 700, textDecoration: "none" }}>
                  Register Your School
                </a>
              </div>

              {/* social proof strip */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
                <div style={{ display: "flex" }}>
                  {[C.mint, C.rose, C.lavender, C.primary].map((bg, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: bg, border: "2px solid #fff", marginLeft: i === 0 ? 0 : -10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#fff" }}>person</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textBase }}>500+ Schools enrolled</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Join Kenya&apos;s fastest growing STEM platform</div>
                </div>
              </div>
            </div>

            {/* Right — Skills card */}
            <div style={{ position: "relative" }}>
              <div style={{ background: C.bgCard, borderRadius: 20, border: `1px solid ${C.border}`, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 800, color: C.textBase, fontSize: 16 }}>Student Skills Mastery</h3>
                  <span style={{ color: C.mint, fontWeight: 800, fontSize: 15, background: C.mintBg, borderRadius: 8, padding: "4px 10px" }}>85% Global Avg</span>
                </div>
                <svg className="mx-auto" viewBox="0 0 100 100" width="260" height="260">
                  {[45, 30, 15].map((r) => (
                    <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={C.border} strokeWidth="0.6" />
                  ))}
                  <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke={C.border} strokeWidth="0.5" />
                  <path d="M50 20 L75 35 L70 65 L40 75 L25 55 L30 30 Z"
                    fill="rgba(110,207,195,0.22)" stroke={C.mint} strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M50 30 L68 40 L65 60 L43 68 L32 54 L36 38 Z"
                    fill="rgba(165,148,214,0.14)" stroke={C.lavender} strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="3 2" />
                </svg>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                  {[["Coding", C.mint], ["Robotics", C.lavender], ["Design", C.rose]].map(([label, color]) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textFaint }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div style={{ position: "absolute", top: -20, right: -20, width: 84, height: 84, borderRadius: 16, background: `linear-gradient(135deg, ${C.primary}, #fb923c)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px rgba(249,115,22,0.35)`, transform: "rotate(12deg)" }}>
                <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 38 }}>workspace_premium</span>
              </div>
              {/* Floating science icon */}
              <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: 18, background: `linear-gradient(135deg, ${C.mint}, #4ab8ab)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px rgba(110,207,195,0.4)`, transform: "rotate(-10deg)" }}>
                <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 46 }}>science</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3-STEP IMPLEMENTATION ──────────────────────────────────── */}
        <section id="solutions" style={{ padding: "96px 24px", background: `linear-gradient(180deg, ${C.bgPage} 0%, ${C.bgSurface} 100%)` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary }}>How It Works</span>
              <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: C.textBase, marginTop: 10, letterSpacing: "-0.02em" }}>Simple 3-Step Implementation</h2>
              <p style={{ marginTop: 12, color: C.textMuted, fontSize: 17 }}>From setup to mastery, we make STEM integration effortless.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, position: "relative" }} className="grid grid-cols-1 md:grid-cols-3">
              {/* connector line */}
              <div style={{ position: "absolute", top: 44, left: "16%", right: "16%", height: 2, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 99, opacity: 0.3 }} className="hidden md:block" />
              {[
                { icon: "school",        color: C.mint,      cardBg: C.mintBg,     num: "01", title: "School Onboarding",  desc: "Administrators set up the academy dashboard, manage licenses, and define school-wide impact goals." },
                { icon: "co_present",    color: C.rose,      cardBg: C.roseBg,     num: "02", title: "Teacher Setup",       desc: "Teachers organize classrooms, sync student rosters, and assign curriculum-aligned projects in minutes." },
                { icon: "rocket_launch", color: C.lavender,  cardBg: C.lavenderBg, num: "03", title: "Student Learning",    desc: "Students dive into hands-on project guides, building real-world solutions and earning verified badges." },
              ].map(({ icon, color, cardBg, num, title, desc }) => (
                <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 1, background: C.bgCard, borderRadius: 20, padding: "36px 28px", boxShadow: "0 4px 20px rgba(26,26,46,0.06)", border: `1px solid ${C.border}` }}>
                  <div style={{ width: 76, height: 76, borderRadius: 20, background: cardBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <span className="material-symbols-outlined" style={{ color, fontSize: 34 }}>{icon}</span>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: color, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{num}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: C.textBase, marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, padding: "0 4px" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LESSONS IN ACTION ─────────────────────────────────────── */}
        <section id="curriculum" style={{ padding: "96px 24px", background: C.bgSurface }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.secondary }}>Interactive Lessons</span>
              <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: C.textBase, marginTop: 10, letterSpacing: "-0.02em" }}>Lessons in Action</h2>
              <p style={{ marginTop: 12, color: C.textMuted, fontSize: 17 }}>Step-by-step guidance for complex project-based learning.</p>
            </div>

            <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 20, border: `1px solid ${C.border}`, background: C.bgCard, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
              {/* Window chrome */}
              <div style={{ background: C.bgSurface, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#ef4444","#f59e0b","#22c55e"].map((bg) => (
                      <div key={bg} style={{ width: 12, height: 12, borderRadius: "50%", background: bg }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted }}>Activity: JavaScript Chatbot</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textFaint, fontSize: 13 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>timer</span>
                  30 Min Step
                </div>
              </div>

              <div style={{ display: "flex" }} className="flex flex-col lg:flex-row">
                {/* Main */}
                <div style={{ flex: 1, padding: "40px 48px", borderRight: `1px solid ${C.border}` }}>
                  <div style={{ display: "inline-block", background: "rgba(139,92,246,0.1)", color: C.secondary, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: 6, padding: "4px 10px", marginBottom: 16 }}>
                    Step 03: Response Logic
                  </div>
                  <h4 style={{ fontSize: 26, fontWeight: 800, color: C.textBase, marginBottom: 24 }}>Building the Reply Engine</h4>

                  {/* Code block */}
                  <div style={{ background: "#1e1e2e", borderRadius: 12, overflow: "hidden", marginBottom: 24, border: `1px solid rgba(255,255,255,0.05)` }}>
                    <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ color: "#fbbf24", fontSize: 16 }}>javascript</span>
                      <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>chatbot.js</span>
                    </div>
                    <div style={{ padding: "20px", fontFamily: "monospace", fontSize: 13, lineHeight: 1.8 }}>
                      <div><span style={{ color: "#c084fc" }}>function</span> <span style={{ color: "#fde047" }}>getReply</span><span style={{ color: "#94a3b8" }}>(message) {"{"}</span></div>
                      <div style={{ paddingLeft: 20 }}><span style={{ color: "#c084fc" }}>const</span> <span style={{ color: "#7dd3fc" }}>msg</span> <span style={{ color: "#94a3b8" }}>= message.</span><span style={{ color: "#fde047" }}>toLowerCase</span><span style={{ color: "#94a3b8" }}>();</span></div>
                      <div style={{ paddingLeft: 20, marginTop: 8 }}><span style={{ color: "#c084fc" }}>if</span> <span style={{ color: "#94a3b8" }}>(msg.</span><span style={{ color: "#fde047" }}>includes</span><span style={{ color: "#94a3b8" }}>(</span><span style={{ color: "#86efac" }}>&quot;hello&quot;</span><span style={{ color: "#94a3b8" }}>))</span></div>
                      <div style={{ paddingLeft: 40 }}><span style={{ color: "#c084fc" }}>return</span> <span style={{ color: "#86efac" }}>&quot;Hi there! How can I help?&quot;</span><span style={{ color: "#94a3b8" }}>;</span></div>
                      <div style={{ paddingLeft: 20, marginTop: 4 }}><span style={{ color: "#c084fc" }}>return</span> <span style={{ color: "#86efac" }}>&quot;Tell me more!&quot;</span><span style={{ color: "#94a3b8" }}>;</span></div>
                      <div><span style={{ color: "#94a3b8" }}>{"}"}</span></div>
                    </div>
                  </div>

                  <p style={{ color: C.textMuted, lineHeight: 1.75, marginBottom: 24, fontSize: 15 }}>
                    Create a function that reads the user&apos;s message and returns a matching reply. Use{" "}
                    <code style={{ color: C.primary, background: "rgba(249,115,22,0.1)", borderRadius: 4, padding: "2px 6px", fontSize: 12 }}>includes()</code>{" "}
                    to check for keywords and build branching logic.
                  </p>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={{ padding: "10px 22px", background: C.bgSurface, color: C.textBase, borderRadius: 10, fontWeight: 700, fontSize: 14, border: `1px solid ${C.border}`, cursor: "pointer" }}>Previous Step</button>
                    <button style={{ padding: "10px 22px", background: C.primary, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: `0 4px 14px rgba(249,115,22,0.3)` }}>Mark as Complete</button>
                  </div>
                </div>

                {/* Sidebar nav */}
                <div style={{ width: 240, background: C.bgPage, padding: 24 }} className="w-full lg:w-60">
                  <h5 style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.textFaint, marginBottom: 20 }}>Course Navigation</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[["01","Project Setup",true,false],["02","HTML Chat UI",true,false],["03","Response Logic",false,true],["04","Event Listeners",false,false],["05","Styling & Polish",false,false],["06","Deploy & Share",false,false]].map(([num, label, done, active]) => (
                      <div key={num as string} style={{ display: "flex", alignItems: "center", gap: 10, opacity: (!done && !active) ? 0.5 : 1 }}>
                        {done ? (
                          <span className="material-symbols-outlined" style={{ color: C.primary, fontSize: 18 }}>check_circle</span>
                        ) : active ? (
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${C.secondary}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.secondary, fontWeight: 800, flexShrink: 0 }}>{num}</div>
                        ) : (
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.textFaint, fontWeight: 700, flexShrink: 0 }}>{num}</div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? C.textBase : C.textMuted }}>{label as string}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ background: `linear-gradient(135deg, rgba(249,115,22,0.1), rgba(139,92,246,0.1))`, border: `1px solid ${C.borderOrange}`, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary, marginBottom: 6 }}>Next Badge</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.textBase }}>JS Developer I</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GOOGLE CLASSROOM INTEGRATION ──────────────────────────── */}
        <section style={{ padding: "96px 24px", background: `linear-gradient(180deg, ${C.bgSurface} 0%, ${C.bgPage} 100%)`, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="grid grid-cols-1 lg:grid-cols-2">
            {/* Visual */}
            <div style={{ background: C.bgCard, borderRadius: 28, padding: 40, border: `1px solid ${C.border}`, boxShadow: "0 16px 48px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 30%, rgba(110,207,195,0.08), transparent 60%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 48, marginBottom: 40 }}>
                  <div style={{ width: 76, height: 76, borderRadius: 18, background: "#fff", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                    <div style={{ width: 44, height: 44, background: "#16a34a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 900 }}>G</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 48, height: 3, background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`, borderRadius: 99, position: "relative" }}>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 26, height: 26, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px rgba(249,115,22,0.4)` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#fff" }}>sync</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 76, height: 76, borderRadius: 18, background: C.bgSurface, border: `2px solid ${C.primary}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px rgba(249,115,22,0.2)` }}>
                    <span className="material-symbols-outlined" style={{ color: C.primary, fontSize: 32 }}>token</span>
                  </div>
                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[[100, C.mintBg], [75, C.roseBg], [90, C.lavenderBg]].map(([w, bg], i) => (
                    <div key={i} style={{ height: 40, width: `${w}%`, borderRadius: 10, background: bg as string, border: `1px solid ${C.border}` }} />
                  ))}
                </div>
                <button style={{ marginTop: 32, background: C.primary, color: "#fff", borderRadius: 14, padding: "12px 28px", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: `0 6px 20px rgba(249,115,22,0.35)` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>touch_app</span>
                  One-click Sync
                </button>
              </div>
            </div>

            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: C.primary, fontSize: 26 }}>sync_alt</span>
              </div>
              <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: C.textBase, letterSpacing: "-0.02em" }}>
                Seamless Google Classroom Integration
              </h2>
              <p style={{ fontSize: 17, color: C.textMuted, lineHeight: 1.7 }}>
                Sync your entire school roster in seconds. Automatically import classes, push assignments, and return grades directly to your existing workspace.
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {["Automatic Roster Management", "Single Sign-On (SSO) Support", "Direct Gradebook Export"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, color: C.textBase, fontWeight: 600, fontSize: 15 }}>
                    <span className="material-symbols-outlined" style={{ color: C.primary, fontSize: 20 }}>verified_user</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── BADGE SYSTEM ──────────────────────────────────────────── */}
        <section style={{ padding: "96px 24px", background: C.bgSurface }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary }}>Achievements</span>
              <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, color: C.textBase, marginTop: 10, letterSpacing: "-0.02em" }}>Recognized Achievement System</h2>
              <div style={{ width: 48, height: 4, background: `linear-gradient(90deg,${C.primary},${C.secondary})`, borderRadius: 99, margin: "16px auto 0" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }} className="grid grid-cols-1 md:grid-cols-3">
              {[
                { icon: "code_blocks",             color: C.mint,     cardBg: C.mintBg,     badgeBg: C.mint,     title: "Master Architect",  desc: "Advanced proficiency in computational thinking and structural logic.",         count: "12,403 Earned" },
                { icon: "eco",                     color: C.rose,     cardBg: C.roseBg,     badgeBg: C.rose,     title: "Green Innovator",   desc: "Demonstrated impact in sustainable engineering and environmental solutions.", count: "8,912 Earned"  },
                { icon: "precision_manufacturing", color: C.lavender, cardBg: C.lavenderBg, badgeBg: C.lavender, title: "Robotics Lead",     desc: "Expertise in automated systems and mechanical design principles.",           count: "5,667 Earned"  },
              ].map(({ icon, color, cardBg, badgeBg, title, desc, count }) => (
                <div key={title} style={{ background: C.bgCard, borderRadius: 20, padding: "36px 28px", border: `1px solid ${C.border}`, textAlign: "center", boxShadow: "0 4px 20px rgba(26,26,46,0.06)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 76, height: 76, borderRadius: 20, background: cardBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <span className="material-symbols-outlined" style={{ color, fontSize: 38 }}>{icon}</span>
                  </div>
                  <h4 style={{ fontSize: 19, fontWeight: 800, color: C.textBase, marginBottom: 8 }}>{title}</h4>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65, marginBottom: 18 }}>{desc}</p>
                  <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", background: badgeBg, borderRadius: 99, padding: "6px 16px" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ────────────────────────────────────────────── */}
        <CtaSection />
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.bgSurface, padding: "64px 24px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 18 }}>token</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: C.textBase }}>STEM Impact <span style={{ color: C.primary }}>Academy</span></span>
              </div>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>Driving global innovation through accessible, project-based STEM education for every student.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 48 }}>
              {[
                { heading: "Platform", links: [["Curriculum","/#curriculum"],["Badges","/#solutions"],["Educators","/educators"]] },
                { heading: "Company",  links: [["About Us","/about"],["Help Center","/help"],["Contact","/contact"]] },
                { heading: "Legal",    links: [["Privacy Policy","/privacy"],["Terms of Service","/terms"]] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <h4 style={{ fontWeight: 800, color: C.textBase, marginBottom: 16, fontSize: 14 }}>{heading}</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {links.map(([label, href]) => (
                      <li key={label}><Link href={href} style={{ fontSize: 14, color: C.textMuted, textDecoration: "none" }}>{label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 48, borderTop: `1px solid ${C.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: C.textFaint }}>&copy; {new Date().getFullYear()} STEM Impact Academy. All rights reserved.</p>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="https://stemimpactcenterkenya.org" target="_blank" rel="noopener noreferrer" style={{ color: C.textFaint }}>
                <span className="material-symbols-outlined">public</span>
              </a>
              <Link href="/contact" style={{ color: C.textFaint }}>
                <span className="material-symbols-outlined">alternate_email</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
