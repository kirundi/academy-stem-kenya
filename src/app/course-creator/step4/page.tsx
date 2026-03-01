"use client";

import { useState } from "react";
import Link from "next/link";

const checklistItems = [
  { label: "Step instructions completed",      detail: "All 5 modules have detailed text content.",                              checked: true  },
  { label: "Media assets uploaded",            detail: "12 high-resolution images and 3 videos attached.",                      checked: true  },
  { label: "Interactive tasks configured",     detail: "Final quiz and 2 drag-and-drop activities pending validation.",          checked: false },
  { label: "Course badge assigned",            detail: "'Master Mechanic' badge selected.",                                     checked: true, badge: "military_tech" },
];

const metadata = [
  { label: "Target Age",      value: "Grade 9–12 (14–18 yrs)" },
  { label: "Estimated Time",  value: "4.5 Hours"               },
  { label: "Subject Area",    value: "Engineering & Physics"   },
  { label: "Language",        value: "English (Global)"        },
];

const classrooms = [
  { name: "Section 9-A Robotics Lab",   checked: true  },
  { name: "Section 10-C Advanced STEM", checked: false },
];

export default function CourseCreatorStep4() {
  const [checklist, setChecklist] = useState(checklistItems.map((c) => c.checked));
  const [classAssign, setClassAssign] = useState(classrooms.map((c) => c.checked));
  const [submitToLibrary, setSubmitToLibrary] = useState(true);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#10221c] text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[#10221c] px-10 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#13eca4] rounded-lg flex items-center justify-center text-[#10221c]">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">STEM Learn CMS</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Dashboard", "Courses", "Library", "Reports"].map((item) => (
              <a key={item} href="#" className={`text-sm font-medium transition-colors ${item === "Courses" ? "text-[#13eca4]" : "text-slate-400 hover:text-[#13eca4]"}`}>
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center h-10 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden">
            <div className="flex items-center pl-4 text-slate-500">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input placeholder="Search resources..." className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-600 px-3 outline-none w-48" />
          </div>
          <span className="material-symbols-outlined text-slate-400 hover:text-[#13eca4] cursor-pointer">notifications</span>
          <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] border-2 border-[rgba(19,236,164,0.25)] flex items-center justify-center text-[#13eca4] font-bold text-sm">
            TM
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[1100px] px-6 py-8">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <a href="#" className="text-slate-500 hover:text-[#13eca4]">Course Creator</a>
            <span className="material-symbols-outlined text-slate-600 text-xs">chevron_right</span>
            <a href="#" className="text-slate-500 hover:text-[#13eca4]">Step 3: Interactive Tasks</a>
            <span className="material-symbols-outlined text-slate-600 text-xs">chevron_right</span>
            <span className="text-[#13eca4] font-medium underline underline-offset-4">Step 4: Review &amp; Publish</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-[rgba(255,255,255,0.07)] pb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight mb-2">Review &amp; Publish</h1>
              <p className="text-slate-400 text-lg">Your course &quot;Introduction to Robotics&quot; is almost ready. Verify the checklist and configure access permissions before making it live.</p>
            </div>
            <Link href="/course-creator/preview" className="px-6 py-3 rounded-xl border border-[rgba(255,255,255,0.12)] text-slate-400 font-bold hover:bg-[rgba(255,255,255,0.06)] transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">visibility</span>
              Preview Course
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Checklist + Metadata */}
            <div className="lg:col-span-7 space-y-8">
              {/* Checklist */}
              <section className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.07)]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13eca4]">fact_check</span>
                  Course Summary Checklist
                </h2>
                <div className="space-y-4">
                  {checklistItems.map((item, i) => (
                    <label key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#1a2e27] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(19,236,164,0.3)] cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={checklist[i]}
                        onChange={(e) => setChecklist((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
                        className="h-5 w-5 rounded border-[rgba(255,255,255,0.2)] text-[#13eca4] focus:ring-[#13eca4] bg-[rgba(255,255,255,0.05)]"
                      />
                      <div className="flex flex-col flex-1">
                        <span className="text-white font-medium">{item.label}</span>
                        <span className={`text-xs mt-0.5 ${checklist[i] ? "text-[#13eca4]" : "text-slate-500"}`}>{item.detail}</span>
                      </div>
                      {item.badge && (
                        <div className="w-10 h-10 bg-[rgba(19,236,164,0.1)] rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#13eca4]">{item.badge}</span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </section>

              {/* Metadata */}
              <section className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.07)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13eca4]">analytics</span>
                  Course Metadata
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {metadata.map((m) => (
                    <div key={m.label} className="p-3 bg-[#1a2e27] rounded-lg">
                      <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">{m.label}</p>
                      <p className="text-white font-semibold text-sm">{m.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Access Control + Publish */}
            <div className="lg:col-span-5 space-y-8">
              <section className="bg-[#1a2e27] rounded-2xl p-8 border-2 border-[rgba(19,236,164,0.15)] shadow-xl shadow-[rgba(19,236,164,0.04)]">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#13eca4]">shield_person</span>
                  Access Control
                </h2>
                <div className="space-y-6">
                  {/* Assign to Classrooms */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wide block">Assign to Classrooms</label>
                    <div className="space-y-2">
                      {classrooms.map((cls, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.04)] rounded-xl border border-[rgba(255,255,255,0.08)]">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[rgba(19,236,164,0.6)]">groups</span>
                            <span className="text-white font-medium text-sm">{cls.name}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={classAssign[i]}
                            onChange={(e) => setClassAssign((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
                            className="h-5 w-5 rounded border-[rgba(255,255,255,0.2)] text-[#13eca4] focus:ring-[#13eca4] bg-[rgba(255,255,255,0.05)]"
                          />
                        </div>
                      ))}
                      <button className="w-full py-2 border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl text-slate-500 hover:text-[#13eca4] hover:border-[rgba(19,236,164,0.4)] text-sm font-medium transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Add More Classes
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-[rgba(255,255,255,0.07)]" />

                  {/* Submit to Library */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={submitToLibrary}
                      onChange={(e) => setSubmitToLibrary(e.target.checked)}
                      className="h-6 w-6 rounded-full border-[rgba(255,255,255,0.2)] text-[#13eca4] focus:ring-[#13eca4] bg-[rgba(255,255,255,0.05)]"
                    />
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">Submit to School Library</span>
                      <span className="text-slate-400 text-xs">Allow other teachers to clone and adapt this course.</span>
                    </div>
                  </label>

                  {/* Publish Button */}
                  <div className="pt-6">
                    <button className="w-full bg-[#13eca4] hover:opacity-90 text-[#10221c] font-black text-xl py-5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-[rgba(19,236,164,0.2)]">
                      <span className="material-symbols-outlined font-bold">cloud_upload</span>
                      Publish Course
                    </button>
                    <p className="text-center text-slate-500 text-xs mt-4 italic">
                      By clicking publish, you agree to the school&apos;s digital curriculum guidelines.
                    </p>
                  </div>
                </div>
              </section>

              {/* Course Preview Card */}
              <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Course Preview Card</p>
                <div className="bg-[#1a2e27] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-xl">
                  <div className="h-32 bg-gradient-to-br from-[rgba(19,236,164,0.3)] to-[rgba(19,236,164,0.05)] relative">
                    <div className="absolute bottom-4 left-4 w-14 h-14 bg-[#10221c] rounded-xl flex items-center justify-center border border-[rgba(19,236,164,0.25)]">
                      <span className="material-symbols-outlined text-[#13eca4] text-3xl">precision_manufacturing</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-bold">Introduction to Robotics</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[12px] text-[#13eca4]">person</span>
                      </div>
                      <span className="text-slate-400 text-xs">Sarah Jenkins · Physics Dept.</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <span className="px-2 py-1 bg-[rgba(19,236,164,0.1)] text-[#13eca4] text-[10px] font-bold rounded uppercase">Beginner</span>
                      <span className="px-2 py-1 bg-[rgba(255,255,255,0.06)] text-slate-300 text-[10px] font-bold rounded uppercase">Robotics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-8 px-10 bg-[#10221c] mt-12">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined">copyright</span>
            <span className="text-sm font-medium">2026 STEM Learn Platforms Inc.</span>
          </div>
          <div className="flex gap-8">
            {["Documentation", "Privacy Policy", "Support Center"].map((link) => (
              <a key={link} href="#" className="text-slate-500 hover:text-[#13eca4] text-sm transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
