"use client";

import { useState } from "react";
import Link from "next/link";

export default function CourseCreatorStep3() {
  const [notesContent, setNotesContent] = useState(
`Common Pitfalls:
- Many students forget to ground the breadboard to the MCU common rail.
- Ensure they are using the 3.3V pin and NOT the 5V pin for the sensors to avoid hardware damage.

Discussion Prompts:
1. Why is it important to have a common ground across all components?
2. What happens to the motor speed if we provide less voltage than specified?

Pro-Tip:
Keep some extra jumper wires ready, as the tips often break if students are too aggressive with the breadboard sockets.`
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-[#10221c] text-white overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(16,34,28,0.9)] backdrop-blur-md px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-[#13eca4]">
            <span className="material-symbols-outlined text-3xl">token</span>
            <h2 className="text-white text-lg font-bold tracking-tight">STEM Lab Creator</h2>
          </div>
          <div className="hidden md:flex items-center gap-1 h-10 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
            <div className="flex items-center pl-3 text-slate-500">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input placeholder="Search resources..." className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 px-3 py-2 outline-none w-48" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6">
            {["Curriculum", "Library", "Students"].map((item) => (
              <a key={item} href="#" className="text-slate-400 text-sm font-medium hover:text-[#13eca4] transition-colors">{item}</a>
            ))}
          </nav>
          <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity">
            Save Course
          </button>
          <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] border border-[rgba(19,236,164,0.3)] flex items-center justify-center text-[#13eca4] font-bold text-sm">
            TM
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Title Area */}
        <div className="px-6 lg:px-10 py-6 border-b border-[rgba(255,255,255,0.07)]">
          <nav className="flex flex-wrap gap-2 mb-4 text-sm">
            <a href="#" className="text-slate-500 hover:text-[#13eca4]">My Courses</a>
            <span className="text-slate-600">/</span>
            <a href="#" className="text-slate-500 hover:text-[#13eca4]">Robotics 101</a>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">Step 3: Facilitation Notes</span>
          </nav>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="max-w-2xl">
              <h1 className="text-white text-3xl font-black tracking-tight mb-2">Teacher Facilitation Notes</h1>
              <p className="text-slate-400 text-base">Add educator-only tips, classroom management strategies, and answer keys for this specific learning step.</p>
            </div>
            <Link href="/course-creator/preview" className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1a2e27] text-white text-sm font-bold border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              <span className="material-symbols-outlined text-lg">visibility</span>
              Preview as Student
            </Link>
          </div>

          {/* Tab Nav */}
          <div className="mt-8 flex border-b border-[rgba(255,255,255,0.07)] gap-8">
            {[
              { label: "Content Builder",    num: "1", active: false },
              { label: "Interactive Tasks",   num: "2", active: false },
              { label: "Facilitation Notes",  num: "3", active: true  },
            ].map((tab) => (
              <button
                key={tab.label}
                className={`flex items-center gap-2 pb-3 font-bold text-sm transition-all border-b-2 ${
                  tab.active
                    ? "border-[#13eca4] text-[#13eca4]"
                    : "border-transparent text-slate-500 hover:text-slate-200"
                }`}
              >
                <span className={`text-xs flex items-center justify-center w-5 h-5 rounded-full font-bold ${
                  tab.active ? "bg-[#13eca4] text-[#10221c]" : "bg-[rgba(255,255,255,0.08)] text-slate-400"
                }`}>{tab.num}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Split View */}
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: "600px" }}>
          {/* Left: Student View */}
          <section className="flex-1 flex flex-col border-r border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.01)] overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(16,34,28,0.8)] backdrop-blur-sm flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">school</span>
                Student View (Read-Only)
              </h3>
              <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Live Content</span>
              </div>
            </div>

            <div className="p-8 max-w-3xl mx-auto w-full">
              <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] relative group flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600 text-7xl">play_circle</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[rgba(16,34,28,0.5)]">
                  <span className="material-symbols-outlined text-7xl text-white">play_circle</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Module 3: Wiring the Controller</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                In this step, students will connect the microcontroller to the motor driver. Ensure that all power is disconnected before starting the wiring process. Use the color-coded jumper wires as shown in the diagram.
              </p>
              <div className="bg-[rgba(19,236,164,0.06)] border-l-4 border-[#13eca4] p-4 rounded-r-lg mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#13eca4]">warning</span>
                  <div>
                    <p className="font-bold text-white text-sm">Safety Check</p>
                    <p className="text-sm text-slate-400">Always double-check your ground connections to prevent short circuits.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#1a2e27]">
                  <span className="material-symbols-outlined text-[#13eca4] mb-2 block">inventory_2</span>
                  <p className="font-bold text-sm">Required Materials</p>
                  <ul className="text-xs text-slate-500 mt-2 space-y-1">
                    <li>• Microcontroller board</li>
                    <li>• 4x Jumper Wires</li>
                    <li>• Breadboard</li>
                  </ul>
                </div>
                <div className="p-4 border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#1a2e27]">
                  <span className="material-symbols-outlined text-[#13eca4] mb-2 block">timer</span>
                  <p className="font-bold text-sm">Estimated Time</p>
                  <p className="text-xs text-slate-500 mt-2">15–20 Minutes</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Teacher Notes */}
          <section className="flex-1 flex flex-col bg-[#10221c] overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 border-b border-[rgba(255,255,255,0.07)] bg-[rgba(16,34,28,0.9)] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#13eca4] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Teacher Facilitation Notes
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Visibility: Private</span>
                <div className="w-10 h-5 bg-[rgba(19,236,164,0.15)] rounded-full relative cursor-pointer border border-[rgba(19,236,164,0.3)]">
                  <div className="absolute top-0.5 left-5 w-3.5 h-3.5 bg-[#13eca4] rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Instructional Strategies</label>
                <div className="rounded-lg border border-[rgba(255,255,255,0.1)] overflow-hidden flex flex-col min-h-80">
                  {/* Toolbar */}
                  <div className="bg-[#1a2e27] p-2 border-b border-[rgba(255,255,255,0.08)] flex gap-1 flex-wrap">
                    {["format_bold", "format_italic", "format_list_bulleted", "format_list_numbered"].map((icon) => (
                      <button key={icon} className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                      </button>
                    ))}
                    <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] mx-1 self-center" />
                    {["link", "image"].map((icon) => (
                      <button key={icon} className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button className="p-1.5 hover:bg-[rgba(255,255,255,0.1)] rounded transition-colors text-slate-400 hover:text-white">
                      <span className="material-symbols-outlined text-lg">help</span>
                    </button>
                  </div>
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    className="flex-1 p-6 bg-[rgba(255,255,255,0.02)] focus:ring-0 border-none text-base leading-relaxed placeholder-slate-600 resize-none text-slate-200 outline-none min-h-64"
                    placeholder="Add notes for other teachers here..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload */}
                <div className="p-5 rounded-xl bg-[#1a2e27] border-2 border-dashed border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center gap-2 text-center py-8 cursor-pointer hover:border-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.03)] transition-all">
                  <span className="material-symbols-outlined text-3xl text-slate-500">upload_file</span>
                  <p className="text-sm font-bold">Upload Educator Resources</p>
                  <p className="text-[10px] text-slate-500">PDF, PPTX, or ZIP files (Max 20MB)</p>
                </div>

                {/* Collaborator Notes */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collaborator Notes</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(19,236,164,0.04)] border border-[rgba(19,236,164,0.1)]">
                    <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.15)] flex items-center justify-center text-[#13eca4] font-bold text-xs shrink-0">
                      JK
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">Mrs. Jenkins <span className="text-slate-400 font-normal">added a note:</span></p>
                      <p className="text-[11px] italic text-slate-400">&quot;My period 4 class struggled with the blue wire length.&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] bg-[#10221c] p-4 flex justify-between items-center px-10 shrink-0">
        <div className="flex items-center gap-4 text-slate-500">
          <span className="text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">history</span>
            Last autosaved at 2:45 PM
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/course-creator/step2" className="px-6 py-2 rounded-lg text-slate-400 font-bold text-sm hover:bg-[rgba(255,255,255,0.06)] transition-colors">
            Back to Task 2
          </Link>
          <Link href="/course-creator/step4" className="px-8 py-2 rounded-lg bg-[#13eca4] text-[#10221c] font-black text-sm shadow-lg shadow-[rgba(19,236,164,0.15)] hover:opacity-90 transition-opacity">
            Publish Step
          </Link>
        </div>
      </footer>
    </div>
  );
}
