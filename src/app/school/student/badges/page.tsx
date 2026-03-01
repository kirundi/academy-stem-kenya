"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudentData } from "@/hooks/useStudentData";

const skillColors: Record<string, string> = {
  Coding: "#13eca4",
  Logic: "#3b82f6",
  Math: "#f59e0b",
  Design: "#8b5cf6",
  Engineering: "#06b6d4",
  Science: "#10b981",
  Robotics: "#ec4899",
  Creativity: "#f97316",
};
const defaultSkillColor = "#13eca4";

const CX = 180, CY = 180, R_MAX = 130;
function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export default function BadgesPage() {
  const { appUser } = useAuthContext();
  const { earnedBadges, lockedBadges, loading } = useStudentData();
  const [activeSkill, setActiveSkill] = useState<number | null>(null);

  // Build skills array from appUser.skills
  const skills = useMemo(() => {
    const raw = appUser?.skills ?? {};
    const entries = Object.entries(raw);
    if (entries.length === 0) {
      return [
        { name: "Coding", value: 0, color: "#13eca4" },
        { name: "Logic", value: 0, color: "#3b82f6" },
        { name: "Math", value: 0, color: "#f59e0b" },
        { name: "Design", value: 0, color: "#8b5cf6" },
        { name: "Engineering", value: 0, color: "#06b6d4" },
      ];
    }
    return entries.map(([name, value]) => ({
      name,
      value: typeof value === "number" ? value : 0,
      color: skillColors[name] ?? defaultSkillColor,
    }));
  }, [appUser?.skills]);

  const axes = useMemo(() => {
    if (skills.length === 0) return [];
    return skills.map((_, i) => (360 / skills.length) * i);
  }, [skills]);

  function ringPoints(pct: number) {
    return axes.map((a) => polarToXY(a, R_MAX * pct)).map((p) => `${p.x},${p.y}`).join(" ");
  }
  function dataPoints() {
    return axes.map((a, i) => polarToXY(a, R_MAX * (skills[i].value / 100))).map((p) => `${p.x},${p.y}`).join(" ");
  }

  const level = appUser?.level ?? 1;
  const xp = appUser?.xp ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Skills Portfolio</h1>
          <p className="text-slate-400 text-xs mt-0.5">Comprehensive visualisation of your STEM growth &amp; achievements</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-[rgba(255,255,255,0.1)] text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl hover:border-[rgba(19,236,164,0.3)] hover:text-[#13eca4] transition-colors">
            <span className="material-symbols-outlined text-[18px]">share</span>Share Profile
          </button>
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#0d1f1a] text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#0dd494] transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>Download
          </button>
        </div>
      </header>

      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">

        {/* Radar + Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-[rgba(19,236,164,0.03)] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Skill Proficiency Map</h3>
              <div className="flex items-center gap-2 bg-[rgba(19,236,164,0.1)] px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-[#13eca4] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#13eca4]">Live Data</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <svg width="300" height="300" viewBox="0 0 360 360">
                  {[0.25,0.5,0.75,1].map((pct)=>(<polygon key={pct} points={ringPoints(pct)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>))}
                  {axes.map((a,i)=>{const t=polarToXY(a,R_MAX);return(<line key={i} x1={CX} y1={CY} x2={t.x} y2={t.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>);})}
                  <polygon points={dataPoints()} fill="rgba(19,236,164,0.15)" stroke="#13eca4" strokeWidth="2.5"/>
                  {axes.map((a,i)=>{const pt=polarToXY(a,R_MAX*(skills[i].value/100));return(<circle key={i} cx={pt.x} cy={pt.y} r={activeSkill===i?7:5} fill={skills[i].color} style={{cursor:"pointer"}} onMouseEnter={()=>setActiveSkill(i)} onMouseLeave={()=>setActiveSkill(null)}/>);})}
                  {axes.map((a,i)=>{const lp=polarToXY(a,R_MAX+22);return(<text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill={activeSkill===i?skills[i].color:"rgba(255,255,255,0.55)"} fontSize="11" fontWeight="700">{skills[i].name.toUpperCase()}</text>);})}
                </svg>
                {activeSkill!==null&&(<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-[#0d1f1a] border border-[rgba(19,236,164,0.2)] rounded-xl px-4 py-2 text-center"><p className="font-black text-2xl" style={{color:skills[activeSkill].color}}>{skills[activeSkill].value}%</p><p className="text-slate-400 text-xs">{skills[activeSkill].name}</p></div></div>)}
              </div>
              <div className="flex-1 w-full space-y-3">
                {skills.map((s,i)=>(
                  <div key={s.name} className="cursor-pointer" onMouseEnter={()=>setActiveSkill(i)} onMouseLeave={()=>setActiveSkill(null)}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold" style={{color:activeSkill===i?"white":"rgb(148,163,184)"}}>{s.name}</span>
                      <span className="font-bold" style={{color:s.color}}>{s.value}%</span>
                    </div>
                    <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${s.value}%`,background:s.color}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-5" style={{background:"linear-gradient(135deg, #13eca4, #0dd494)"}}>
              <p className="text-[#0a1a18] text-xs font-bold uppercase tracking-widest opacity-80">Current Level</p>
              <p className="text-[#0a1a18] text-2xl font-black mt-1 leading-tight">Level {level}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#0a1a18]"><span>Badges</span><span>{earnedBadges.length} / {earnedBadges.length + lockedBadges.length}</span></div>
                <div className="w-full h-3 bg-[rgba(10,26,24,0.2)] rounded-full overflow-hidden"><div className="h-full bg-[#0a1a18] rounded-full" style={{width: earnedBadges.length + lockedBadges.length > 0 ? `${Math.round((earnedBadges.length / (earnedBadges.length + lockedBadges.length)) * 100)}%` : "0%"}}/></div>
                <p className="text-[10px] font-medium opacity-70 pt-1 italic text-[#0a1a18]">Earn more badges to level up.</p>
              </div>
            </div>
            <div className="bg-[#1a2e27] border border-[rgba(19,236,164,0.08)] rounded-2xl p-5 flex-1">
              <h3 className="text-white font-bold mb-4">Mastery Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-slate-400 text-sm">Current Level</span><span className="text-white font-bold text-sm">Lvl {level}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-400 text-sm">Total XP</span><span className="text-[#13eca4] font-bold text-sm">{xp}</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Badges Earned</span>
                  <div className="flex items-center gap-1 text-[#f59e0b] font-bold">
                    <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:"'FILL' 1"}}>military_tech</span>
                    <span className="text-sm">{earnedBadges.length}</span>
                  </div>
                </div>
                <hr className="border-[rgba(255,255,255,0.06)]"/>
                {skills.length > 0 && (
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    Your strongest skill is <span className="text-slate-200 font-bold">{[...skills].sort((a, b) => b.value - a.value)[0]?.name ?? "N/A"}</span> at <span className="text-[#13eca4] font-bold">{[...skills].sort((a, b) => b.value - a.value)[0]?.value ?? 0}%</span>.
                  </p>
                )}
                <Link href="/school/student/progress" className="flex items-center gap-1 text-[#13eca4] text-xs font-bold hover:underline">View Full Progress<span className="material-symbols-outlined text-[14px]">arrow_forward</span></Link>
              </div>
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#13eca4]" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
            Earned Badges <span className="text-slate-500 text-base font-normal">({earnedBadges.length})</span>
          </h2>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {earnedBadges.map((b)=>(
                <div key={b.id} className="bg-[#1a2e27] border border-[rgba(19,236,164,0.06)] rounded-2xl p-4 flex flex-col items-center text-center hover:border-[rgba(19,236,164,0.3)] hover:shadow-lg hover:shadow-[rgba(19,236,164,0.05)] transition-all cursor-pointer group">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{background:`${b.color}15`}}>
                    <span className="material-symbols-outlined text-[28px]" style={{color:b.color,fontVariationSettings:"'FILL' 1"}}>{b.icon}</span>
                  </div>
                  <p className="text-white text-[11px] font-bold uppercase leading-tight">{b.name}</p>
                  <p className="text-slate-500 text-[10px] mt-1 leading-tight">{b.requirement}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[48px] text-slate-600 mb-2 block">military_tech</span>
              <p className="text-slate-500 text-sm">No badges earned yet. Complete courses and activities to earn badges!</p>
            </div>
          )}
        </div>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div className="pb-8">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-slate-500 text-[22px]">lock</span>
              <h2 className="text-white font-bold text-xl">Yet to Unlock <span className="text-slate-500 text-base font-normal ml-2">({lockedBadges.length})</span></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {lockedBadges.map((b)=>(
                <div key={b.id} className="bg-[rgba(26,46,39,0.4)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 flex flex-col items-center text-center opacity-50 grayscale hover:opacity-70 hover:grayscale-0 transition-all">
                  <div className="w-14 h-14 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[28px] text-slate-600">{b.icon}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] font-bold uppercase leading-tight">{b.name}</p>
                  <p className="text-slate-600 text-[10px] mt-1">{b.requirement}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
