"use client";

import { useState, useEffect, useRef } from "react";

/* ─── mock data (replace with real props / fetch) ─── */
const WINNER = {
  name: "Amara Odhiambo",
  school: "Oakridge Tech High",
  challenge: "Climate Action 2024",
  theme: "Sustainability & Renewable Energy",
  rank: 1,
  score: 9840,
  date: "March 2, 2026",
  adminName: "Dr. Samuel K. Njoroge",
  adminTitle: "Global Administrator, SIC Kenya Academy",
  certificateId: "SIC-2026-CA-00147",
};

/* ─── Confetti particle data ─── */
const PARTICLE_COUNT = 60;
const COLORS = ["#FFD700", "#13eca4", "#FF6B6B", "#845EF7", "#FF922B", "#74C0FC"];

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 200,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
}

/* ─── Share helper ─── */
function getShareUrl(platform: string, text: string, url: string) {
  const enc = encodeURIComponent;
  if (platform === "twitter")
    return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
  if (platform === "linkedin")
    return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}&summary=${enc(text)}`;
  if (platform === "whatsapp")
    return `https://api.whatsapp.com/send?text=${enc(text + " " + url)}`;
  return "#";
}

export default function ChallengeWinnerPage() {
  const [particles] = useState(generateParticles);
  const [showShare, setShowShare] = useState(false);
  const [addedPortfolio, setAddedPortfolio] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  };

  const handleAddPortfolio = () => {
    setAddedPortfolio(true);
    setTimeout(() => setAddedPortfolio(false), 3000);
  };

  const shareText = `🏆 I won 1st Place in the "${WINNER.challenge}" Hackathon at SIC Kenya Academy! Scored ${WINNER.score.toLocaleString()} points. #SICKenya #STEM #Hackathon`;
  const shareUrl = "https://academy.sickenya.org/challenges/climate-action-2024";

  return (
    <>
      {/* ── Print-only styles ── */}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10vh) translateX(0) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
        @keyframes badge-float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px 8px rgba(255,215,0,0.35), 0 0 80px 20px rgba(255,215,0,0.12); }
          50%       { box-shadow: 0 0 50px 16px rgba(255,215,0,0.55), 0 0 120px 40px rgba(255,215,0,0.22); }
        }
        @keyframes star-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shine-sweep {
          0%   { left: -80%; }
          100% { left: 130%;  }
        }
        .badge-float   { animation: badge-float 4s ease-in-out infinite; }
        .glow-pulse    { animation: glow-pulse  2.5s ease-in-out infinite; }
        .slide-up-1    { animation: slide-up 0.6s ease both 0.1s; }
        .slide-up-2    { animation: slide-up 0.6s ease both 0.35s; }
        .slide-up-3    { animation: slide-up 0.6s ease both 0.6s; }
        .slide-up-4    { animation: slide-up 0.6s ease both 0.85s; }
        .badge-shine::after {
          content: '';
          position: absolute;
          top: 0; left: -80%;
          width: 60%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
          animation: shine-sweep 3s ease-in-out infinite 2s;
          border-radius: inherit;
        }
        @media print {
          body * { visibility: hidden !important; }
          #certificate-print, #certificate-print * { visibility: visible !important; }
          #certificate-print { position: fixed; inset: 0; width: 100vw; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="relative min-h-screen bg-[#060f0c] text-white overflow-x-hidden">

        {/* ── CONFETTI LAYER ── */}
        <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden>
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: "-5%",
                width: p.size,
                height: p.shape === "circle" ? p.size : p.size * 0.5,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
                opacity: 0,
                animationName: "confetti-fall",
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                animationTimingFunction: "linear",
                animationFillMode: "forwards",
                // @ts-expect-error CSS custom property
                "--drift": `${p.drift}px`,
              }}
            />
          ))}
        </div>

        {/* ── RADIAL GLOW BG ── */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 20%, rgba(255,215,0,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 50% 90%, rgba(19,236,164,0.06) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* ── BACK LINK ── */}
        <div className="no-print relative z-20 px-6 pt-6">
          <a
            href="/dashboard/challenges"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#13eca4] transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Challenges
          </a>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-4 pb-20 pt-4">

          {/* ── HEADLINE ── */}
          <div className={`text-center mb-10 ${animateIn ? "slide-up-1" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-sm">emoji_events</span>
              Challenge Complete · 1st Place
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
              <span className="text-white">Congratulations, </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 40%, #FFD700 70%, #FFEC80 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {WINNER.name.split(" ")[0]}!
              </span>
            </h1>
            <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">
              You&apos;ve topped the leaderboard in the <span className="text-white font-semibold">{WINNER.challenge}</span> hackathon.
            </p>
          </div>

          {/* ── BADGE + STATS ROW ── */}
          <div className={`flex flex-col lg:flex-row items-center justify-center gap-10 mb-14 ${animateIn ? "slide-up-2" : "opacity-0"}`}>

            {/* 3-D GOLD BADGE */}
            <div className="relative flex flex-col items-center">
              {/* outer glow */}
              <div
                className="glow-pulse rounded-full p-1.5"
                style={{
                  background: "linear-gradient(145deg, #FFD700, #B8860B, #FFD700, #B8860B)",
                  padding: "5px",
                  borderRadius: "50%",
                }}
              >
                {/* badge body */}
                <div
                  className="badge-float badge-shine relative flex flex-col items-center justify-center rounded-full overflow-hidden"
                  style={{
                    width: 220,
                    height: 220,
                    background:
                      "radial-gradient(circle at 35% 30%, #FFE87C 0%, #FFD700 30%, #B8860B 65%, #7A5800 100%)",
                    boxShadow:
                      "inset 0 6px 20px rgba(255,255,150,0.5), inset 0 -8px 20px rgba(0,0,0,0.5), 0 12px 40px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* inner ring */}
                  <div
                    className="absolute inset-4 rounded-full border-2 opacity-60"
                    style={{ borderColor: "rgba(255,255,255,0.4)" }}
                  />
                  {/* rank numeral */}
                  <span
                    className="relative z-10 font-black text-7xl leading-none select-none"
                    style={{
                      textShadow: "0 4px 12px rgba(0,0,0,0.5), 0 2px 0 #7A5800",
                      color: "#fff8e0",
                    }}
                  >
                    1
                  </span>
                  <span
                    className="relative z-10 text-xs font-black uppercase tracking-[0.3em] mt-0.5"
                    style={{ color: "#fff0a0", textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}
                  >
                    Champion
                  </span>

                  {/* 5-point star ring */}
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <span
                      key={deg}
                      className="material-symbols-outlined absolute text-yellow-200 text-[13px]"
                      style={{
                        opacity: 0.75,
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${deg}deg) translateY(-86px) rotate(-${deg}deg)`,
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              {/* score chip */}
              <div
                className="mt-5 px-5 py-2 rounded-full font-black text-sm flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#3d2000",
                  boxShadow: "0 4px 20px rgba(255,165,0,0.4)",
                }}
              >
                <span className="material-symbols-outlined text-base">bolt</span>
                {WINNER.score.toLocaleString()} pts
              </div>
            </div>

            {/* STATS PANEL */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {[
                { icon: "school",        label: "Institution", value: WINNER.school,    accent: "#13eca4" },
                { icon: "leaderboard",   label: "Global Rank", value: "#1 of 312",      accent: "#FFD700" },
                { icon: "workspace_premium", label: "Accuracy",value: "96.4%",          accent: "#845EF7" },
                { icon: "schedule",      label: "Submitted",   value: "43h 12m",        accent: "#FF922B" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 border flex flex-col gap-2"
                  style={{
                    background: "rgba(13,31,26,0.8)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.accent}18` }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ color: s.accent }}>
                      {s.icon}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                  <p className="text-base font-black text-white leading-tight">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── DIGITAL CERTIFICATE ── */}
          <div
            id="certificate-print"
            ref={certRef}
            className={`relative ${animateIn ? "slide-up-3" : "opacity-0"}`}
          >

            {/* outer gold frame */}
            <div
              className="rounded-2xl p-0.75"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #B8860B 25%, #FFE680 50%, #B8860B 75%, #FFD700 100%)",
              }}
            >
              {/* inner card */}
              <div
                className="relative rounded-[14px] overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #0b1e19 0%, #071410 50%, #0b1e19 100%)",
                }}
              >
                {/* decorative corner ornaments (SVG) */}
                {[
                  "top-3 left-3    rotate-0",
                  "top-3 right-3   rotate-90",
                  "bottom-3 right-3 rotate-180",
                  "bottom-3 left-3  -rotate-90",
                ].map((pos) => (
                  <svg
                    key={pos}
                    className={`absolute ${pos} w-12 h-12 opacity-50`}
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <path
                      d="M4 4 Q4 4 24 4 Q4 4 4 24"
                      stroke="#FFD700"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="4" cy="4" r="3" fill="#FFD700" fillOpacity="0.7" />
                    <path d="M12 4 L16 8 M4 12 L8 16" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
                  </svg>
                ))}

                {/* watermark */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                  aria-hidden
                >
                  <span
                    className="font-black text-[11rem] leading-none tracking-tighter opacity-[0.025]"
                    style={{ color: "#13eca4" }}
                  >
                    SIC
                  </span>
                </div>

                <div className="relative z-10 px-8 md:px-16 py-12">

                  {/* header row */}
                  <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    {/* Academy seal */}
                    <div className="flex flex-col items-center gap-3">
                      <svg viewBox="0 0 100 100" width="80" height="80">
                        {/* outer ring */}
                        <circle cx="50" cy="50" r="47" fill="none" stroke="#FFD700" strokeWidth="2" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#FFD700" strokeWidth="0.8" strokeDasharray="3 3" />
                        {/* body */}
                        <circle cx="50" cy="50" r="38" fill="url(#sealGrad)" />
                        <defs>
                          <radialGradient id="sealGrad" cx="40%" cy="35%">
                            <stop offset="0%" stopColor="#1a3d30" />
                            <stop offset="100%" stopColor="#071410" />
                          </radialGradient>
                        </defs>
                        {/* torch icon */}
                        <text x="50" y="54" textAnchor="middle" fontSize="26" fill="#13eca4" fontFamily="'Material Symbols Outlined', sans-serif">&#xe3a5;</text>
                        {/* circular text */}
                        <path id="sealArc" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0" fill="none" />
                        <text fontSize="6.5" fill="#FFD700" fontWeight="700" letterSpacing="2">
                          <textPath href="#sealArc" startOffset="8%">SIC KENYA ACADEMY · EST. 2018</textPath>
                        </text>
                      </svg>
                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-500/80">Official Seal</p>
                    </div>

                    {/* cert type */}
                    <div className="text-center">
                      <p
                        className="text-[10px] font-black uppercase tracking-[0.4em] mb-2"
                        style={{ color: "#FFD700" }}
                      >
                        SIC Kenya Academy Presents
                      </p>
                      <h2
                        className="font-black text-3xl md:text-4xl leading-tight"
                        style={{
                          background: "linear-gradient(135deg, #FFD700 0%, #FFF0A0 50%, #FFD700 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Certificate of
                        <br />
                        Excellence
                      </h2>
                    </div>

                    {/* cert ID */}
                    <div className="flex flex-col items-center md:items-end gap-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Certificate ID</p>
                      <p className="text-[11px] font-mono text-yellow-500/80 font-bold">{WINNER.certificateId}</p>
                      {/* QR stand-in */}
                      <div
                        className="mt-1 w-14 h-14 rounded-lg border border-[rgba(255,215,0,0.2)] grid grid-cols-3 gap-0.5 p-1"
                        style={{ background: "rgba(255,215,0,0.03)" }}
                        title="Scan to verify"
                      >
                        {Array.from({ length: 9 }, (_, i) => (
                          <div
                            key={i}
                            className="rounded-xs"
                            style={{
                              background: [0, 2, 4, 6, 8, 3, 5].includes(i)
                                ? "rgba(255,215,0,0.6)"
                                : "transparent",
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[8px] text-slate-600">Scan to verify</p>
                    </div>
                  </div>

                  {/* divider */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,215,0,0.4))" }} />
                    <span className="material-symbols-outlined text-yellow-500/60 text-lg">diamond</span>
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,215,0,0.4))" }} />
                  </div>

                  {/* body text */}
                  <div className="text-center space-y-2 mb-10">
                    <p className="text-slate-400 text-sm tracking-wide">This is to certify that</p>
                    <p
                      className="font-black text-4xl md:text-5xl py-2"
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #e0ffe8 50%, #ffffff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontFamily: "'Georgia', serif",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {WINNER.name}
                    </p>
                    <p className="text-slate-400 text-sm">of <span className="text-white font-semibold">{WINNER.school}</span></p>

                    <p className="text-slate-400 text-sm pt-3 leading-relaxed max-w-lg mx-auto">
                      has demonstrated <span className="text-[#13eca4] font-semibold">exceptional innovation</span> and{" "}
                      <span className="text-[#13eca4] font-semibold">technical excellence</span>, earning
                      <span className="text-white font-bold"> 1st Place</span> in the
                    </p>
                    <p
                      className="text-xl md:text-2xl font-black pt-1"
                      style={{ color: "#FFD700" }}
                    >
                      {WINNER.challenge}
                    </p>
                    <p className="text-slate-500 text-sm italic">Theme: {WINNER.theme}</p>
                    <p className="text-slate-500 text-sm pt-1">Awarded on <span className="text-slate-300">{WINNER.date}</span></p>
                  </div>

                  {/* divider */}
                  <div className="flex items-center gap-3 mb-10">
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,215,0,0.4))" }} />
                    <span className="material-symbols-outlined text-yellow-500/60 text-lg">star</span>
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,215,0,0.4))" }} />
                  </div>

                  {/* signature section */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* signature */}
                    <div className="flex flex-col items-center gap-1 flex-1">
                      {/* stylised SVG signature */}
                      <svg viewBox="0 0 220 70" width="220" height="70" className="overflow-visible">
                        <path
                          d="M10,55 C30,10 60,5 80,30 C95,48 100,15 130,40 C150,55 160,25 190,35 C205,40 210,50 215,45"
                          fill="none"
                          stroke="rgba(255,255,255,0.85)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M30,58 C60,52 100,54 130,58 C155,61 175,58 210,58"
                          fill="none"
                          stroke="rgba(255,215,0,0.5)"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="h-px w-48 bg-[rgba(255,215,0,0.3)] my-1" />
                      <p className="text-sm font-bold text-white">{WINNER.adminName}</p>
                      <p className="text-[10px] text-slate-500 text-center max-w-50 leading-tight">{WINNER.adminTitle}</p>
                    </div>

                    {/* trophy icon centred */}
                    <div
                      className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "radial-gradient(circle, rgba(255,215,0,0.15), transparent)",
                        border: "1px solid rgba(255,215,0,0.3)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-4xl"
                        style={{ color: "#FFD700" }}
                      >
                        emoji_events
                      </span>
                    </div>

                    {/* verifier */}
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <svg viewBox="0 0 220 70" width="220" height="70" className="overflow-visible">
                        <path
                          d="M15,48 C35,20 65,18 90,38 C108,52 115,22 145,42 C165,55 170,28 200,35 C210,38 215,46 218,42"
                          fill="none"
                          stroke="rgba(255,255,255,0.85)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M20,58 C55,52 100,56 140,58 C165,60 185,57 210,58"
                          fill="none"
                          stroke="rgba(19,236,164,0.4)"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="h-px w-48 bg-[rgba(19,236,164,0.3)] my-1" />
                      <p className="text-sm font-bold text-white">Ms. Priya Nkemdirim</p>
                      <p className="text-[10px] text-slate-500 text-center max-w-50 leading-tight">Head of Competitions, SIC Kenya Academy</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className={`mt-10 ${animateIn ? "slide-up-4" : "opacity-0"}`}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 no-print">

              {/* Download PDF */}
              <button
                onClick={handleDownload}
                disabled={printing}
                className="relative overflow-hidden group flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-base transition-all min-w-48 justify-center"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#3d2000",
                  boxShadow: "0 8px 32px rgba(255,165,0,0.35)",
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                />
                {printing ? (
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-xl">download</span>
                )}
                {printing ? "Preparing…" : "Download Certificate"}
              </button>

              {/* Add to Portfolio */}
              <button
                onClick={handleAddPortfolio}
                className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-base transition-all min-w-48 justify-center border"
                style={
                  addedPortfolio
                    ? {
                        background: "rgba(19,236,164,0.12)",
                        borderColor: "rgba(19,236,164,0.5)",
                        color: "#13eca4",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(255,255,255,0.12)",
                        color: "#e2e8f0",
                      }
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {addedPortfolio ? "check_circle" : "add_circle"}
                </span>
                {addedPortfolio ? "Added to Portfolio!" : "Add to Portfolio"}
              </button>

              {/* Share */}
              <div className="relative">
                <button
                  onClick={() => setShowShare((v) => !v)}
                  className="flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-base transition-all min-w-48 justify-center border"
                  style={{
                    background: "rgba(132,94,247,0.1)",
                    borderColor: "rgba(132,94,247,0.35)",
                    color: "#c4b5fd",
                  }}
                >
                  <span className="material-symbols-outlined text-xl">share</span>
                  Share Achievement
                </button>

                {/* Share dropdown */}
                {showShare && (
                  <div
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 rounded-2xl border p-4 w-60 space-y-2 shadow-2xl z-40"
                    style={{
                      background: "#0d1f1a",
                      borderColor: "rgba(132,94,247,0.3)",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Share on</p>
                    {[
                      { platform: "twitter",  label: "Twitter / X",       icon: "alternate_email", color: "#1DA1F2" },
                      { platform: "linkedin", label: "LinkedIn",           icon: "business_center", color: "#0A66C2" },
                      { platform: "whatsapp", label: "WhatsApp",           icon: "chat",            color: "#25D366" },
                    ].map((s) => (
                      <a
                        key={s.platform}
                        href={getShareUrl(s.platform, shareText, shareUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                      >
                        <span
                          className="material-symbols-outlined text-base"
                          style={{ color: s.color }}
                        >
                          {s.icon}
                        </span>
                        <span className="text-sm font-semibold text-slate-300">{s.label}</span>
                      </a>
                    ))}

                    {/* Copy link */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setShowShare(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">link</span>
                      <span className="text-sm font-semibold text-slate-300">Copy Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* hint text */}
            <p className="text-center text-xs text-slate-600 mt-5">
              Certificate is digitally signed and verifiable at{" "}
              <span className="text-slate-500 font-mono">academy.sickenya.org/verify/{WINNER.certificateId}</span>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
