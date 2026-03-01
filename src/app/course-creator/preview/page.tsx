"use client";

import { useState } from "react";
import Link from "next/link";

const module1Steps = [
  { label: "1. Introduction",    completed: true,  active: false, locked: false },
  { label: "2. Components List", completed: true,  active: false, locked: false },
  { label: "3. Sensor Circuit",  completed: false, active: true,  locked: false },
  { label: "4. Programming",     completed: false, active: false, locked: true  },
  { label: "5. Testing Logic",   completed: false, active: false, locked: true  },
];

const module2Steps = [
  { label: "6. Signal Processing", completed: false, active: false, locked: true },
  { label: "7. Feedback Loops",    completed: false, active: false, locked: true },
];

const instructions = [
  { num: 1, text: <>Connect the <strong>VCC pin</strong> of the sensor to the 5V rail on your breadboard.</> },
  { num: 2, text: <>Connect the <strong>GND pin</strong> to the common ground rail.</> },
  { num: 3, text: <>Attach the <strong>Trig pin</strong> to Digital Pin 9 and the <strong>Echo pin</strong> to Digital Pin 10.</> },
];

export default function CourseCreatorPreview() {
  const [reflection, setReflection] = useState("");

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#10221c] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[rgba(19,236,164,0.1)] bg-[rgba(16,34,28,0.8)] backdrop-blur-md px-6 py-3 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(19,236,164,0.1)] text-[#13eca4]">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-white text-lg font-bold tracking-tight leading-tight">Course Creator</h2>
            <p className="text-[#13eca4] text-xs font-medium uppercase tracking-widest">Student Preview Mode</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {["Editor", "Curriculum", "Resources"].map((item) => (
            <a key={item} href="#" className="text-slate-400 hover:text-[#13eca4] text-sm font-medium transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Previewing as</span>
            <span className="text-white text-xs font-semibold">Demo Student</span>
          </div>
          <Link href="/course-creator/step4" className="flex items-center gap-2 rounded-lg bg-[#13eca4] px-4 py-2 text-[#10221c] text-sm font-bold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-sm">exit_to_app</span>
            Exit Preview
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex flex-col border-r border-[rgba(19,236,164,0.08)] bg-[rgba(16,34,28,0.5)] overflow-y-auto shrink-0">
          <div className="p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-xs font-bold text-[#13eca4]">35%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                <div className="h-full rounded-full bg-[#13eca4] shadow-[0_0_10px_rgba(19,236,164,0.4)]" style={{ width: "35%" }} />
              </div>
              <p className="mt-2 text-[10px] text-slate-500 font-medium">3 of 8 steps completed</p>
            </div>

            {/* Module 1 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-3">Module 1: Foundations</h3>
                <div className="space-y-1">
                  {module1Steps.map((s, i) => (
                    <button
                      key={i}
                      disabled={s.locked}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        s.active ? "bg-[rgba(19,236,164,0.1)] text-[#13eca4]"
                        : s.locked ? "text-slate-600 cursor-not-allowed opacity-50"
                        : "text-slate-400 hover:bg-[rgba(19,236,164,0.05)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {s.active ? "bolt" : s.completed ? "check_circle" : s.locked ? "lock" : "radio_button_unchecked"}
                      </span>
                      <span className={s.active ? "font-bold" : "font-medium"}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module 2 */}
              <div>
                <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-3">Module 2: Advanced Logic</h3>
                <div className="space-y-1 opacity-50">
                  {module2Steps.map((s, i) => (
                    <button key={i} disabled className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 cursor-not-allowed text-sm">
                      <span className="material-symbols-outlined text-lg">lock</span>
                      <span className="font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="mt-auto p-6 border-t border-[rgba(19,236,164,0.08)]">
            <div className="bg-[rgba(19,236,164,0.05)] rounded-xl p-4 border border-[rgba(19,236,164,0.1)]">
              <div className="flex items-center gap-2 text-[#13eca4] mb-2">
                <span className="material-symbols-outlined text-sm">help</span>
                <span className="text-xs font-bold uppercase tracking-wider">Student Support</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Questions? Contact your facilitator or check the knowledge base.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#10221c] p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[rgba(19,236,164,0.5)] mb-4">
              <span className="text-xs font-bold uppercase tracking-widest">Introduction to Robotics</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Module 1</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Step 3: Building the Sensor Circuit
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Now that we have identified the components, it&apos;s time to wire the ultrasonic sensor to the microcontroller. This circuit will allow your robot to &quot;see&quot; obstacles by measuring the time it takes for sound waves to bounce back.
            </p>

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden border border-[rgba(19,236,164,0.15)] bg-[rgba(255,255,255,0.02)] mb-10 group">
              <div className="w-full h-[300px] bg-gradient-to-br from-[rgba(19,236,164,0.08)] to-[rgba(59,130,246,0.06)] flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600 text-8xl">precision_manufacturing</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,34,28,0.8)] to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <span className="bg-[rgba(19,236,164,0.2)] text-[#13eca4] text-[10px] font-bold uppercase px-2 py-1 rounded mb-2 inline-block">Figure 3.1</span>
                  <h4 className="text-white font-bold text-lg">Ultrasonic Wiring Guide</h4>
                </div>
                <button className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[#13eca4] hover:text-[#10221c] transition-colors">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step */}
            <div className="bg-[rgba(255,255,255,0.02)] border-l-4 border-[#13eca4] rounded-r-xl p-6 mb-10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13eca4]">list_alt</span>
                Step-by-Step Instructions
              </h3>
              <ul className="space-y-4 text-slate-300">
                {instructions.map((step) => (
                  <li key={step.num} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(19,236,164,0.15)] text-[#13eca4] text-xs font-bold flex items-center justify-center border border-[rgba(19,236,164,0.3)]">
                      {step.num}
                    </span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Reflection */}
            <div className="bg-[rgba(19,236,164,0.04)] border border-[rgba(19,236,164,0.15)] rounded-2xl p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#13eca4] flex items-center justify-center text-[#10221c]">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Student Reflection</h3>
                  <p className="text-xs text-slate-400">Share your thoughts to unlock the next step</p>
                </div>
              </div>
              <label className="block mb-4">
                <span className="text-sm font-medium text-slate-300 block mb-2">
                  Based on your wiring, why do you think we need both a &quot;Trigger&quot; and an &quot;Echo&quot; pin for this sensor?
                </span>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full rounded-xl bg-[#10221c] border border-[rgba(255,255,255,0.1)] text-slate-200 placeholder-slate-600 focus:border-[#13eca4] focus:ring-1 focus:ring-[#13eca4] h-32 p-4 outline-none transition-all resize-none"
                />
              </label>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-medium italic">Your response will be shared with your instructor.</span>
                <button className="bg-[rgba(19,236,164,0.1)] text-[#13eca4] hover:bg-[#13eca4] hover:text-[#10221c] px-6 py-2 rounded-lg font-bold text-sm transition-all border border-[rgba(19,236,164,0.3)]">
                  Save Reflection
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-[rgba(19,236,164,0.08)] mb-20">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
                Previous Step
              </button>
              <button className="flex items-center gap-2 bg-[#13eca4] px-8 py-3 rounded-xl text-[#10221c] font-black tracking-wide shadow-[0_0_20px_rgba(19,236,164,0.25)] hover:shadow-[0_0_30px_rgba(19,236,164,0.4)] transition-all">
                Complete &amp; Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Hidden Elements Tooltip */}
      <div className="absolute top-20 right-8 w-64 pointer-events-none hidden md:block">
        <div className="bg-[rgba(0,0,0,0.85)] backdrop-blur-sm border border-[rgba(245,158,11,0.3)] rounded-xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <span className="material-symbols-outlined text-sm">visibility_off</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Hidden Elements</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            &quot;Facilitation Notes&quot; are hidden in preview mode to provide an authentic student experience.
          </p>
        </div>
      </div>
    </div>
  );
}
