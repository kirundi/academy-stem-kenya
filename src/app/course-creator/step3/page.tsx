"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument, useUpdateDoc } from "@/hooks/useFirestore";
import { useFileUpload } from "@/hooks/useFileUpload";
import { logActivity } from "@/lib/activity-logger";
import type { Course } from "@/lib/types";

interface UploadedResource {
  name: string;
  url: string;
  size: string;
  type: string;
}

export default function CourseCreatorStep3() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { appUser } = useAuthContext();
  const { data: course, loading: courseLoading } = useDocument<Course>("courses", courseId);
  const { update, loading: updating } = useUpdateDoc("courses");
  const { uploadFile, uploading, progress } = useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;

    if (file.size > 20 * 1024 * 1024) {
      setSaveStatus("Error: File must be under 20MB.");
      return;
    }

    try {
      const url = await uploadFile(
        file,
        `courses/${courseId}/resources/${Date.now()}_${file.name}`
      );

      setUploadedResources((prev) => [
        ...prev,
        {
          name: file.name,
          url,
          size: formatFileSize(file.size),
          type: file.type,
        },
      ]);

      setSaveStatus("Resource uploaded successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setSaveStatus(`Error: ${message}`);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveNotes = async () => {
    if (!courseId || !appUser) return;

    setSavingNotes(true);
    setSaveStatus(null);

    try {
      await update(courseId, {
        facilitationNotes: notesContent,
        resources: uploadedResources,
      });

      await logActivity(
        appUser.uid,
        "facilitation_notes_saved",
        `Updated facilitation notes for course "${course?.title || courseId}"`,
        courseId
      );

      setSaveStatus("Notes saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save notes.";
      setSaveStatus(`Error: ${message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const isLoading = savingNotes || updating || uploading;

  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#10221c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[rgba(19,236,164,0.2)] border-t-[#13eca4] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading facilitation notes...</p>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#10221c] text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No course ID provided.</p>
          <Link href="/course-creator/step1" className="text-[#13eca4] hover:underline font-bold">
            Go back to Step 1
          </Link>
        </div>
      </div>
    );
  }

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
          <button
            onClick={handleSaveNotes}
            disabled={isLoading}
            className="flex items-center justify-center h-10 px-4 rounded-lg bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingNotes ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#10221c]/30 border-t-[#10221c] rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              "Save Course"
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] border border-[rgba(19,236,164,0.3)] flex items-center justify-center text-[#13eca4] font-bold text-sm">
            {appUser?.displayName?.slice(0, 2).toUpperCase() || "TM"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Title Area */}
        <div className="px-6 lg:px-10 py-6 border-b border-[rgba(255,255,255,0.07)]">
          <nav className="flex flex-wrap gap-2 mb-4 text-sm">
            <a href="#" className="text-slate-500 hover:text-[#13eca4]">My Courses</a>
            <span className="text-slate-600">/</span>
            <a href="#" className="text-slate-500 hover:text-[#13eca4]">{course?.title || "Course"}</a>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">Step 3: Facilitation Notes</span>
          </nav>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="max-w-2xl">
              <h1 className="text-white text-3xl font-black tracking-tight mb-2">Teacher Facilitation Notes</h1>
              <p className="text-slate-400 text-base">Add educator-only tips, classroom management strategies, and answer keys for this specific learning step.</p>
            </div>
            <Link href={`/course-creator/preview?courseId=${courseId}`} className="flex items-center gap-2 h-10 px-4 rounded-lg bg-[#1a2e27] text-white text-sm font-bold border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] transition-colors">
              <span className="material-symbols-outlined text-lg">visibility</span>
              Preview as Student
            </Link>
          </div>

          {/* Status Message */}
          {saveStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              saveStatus.startsWith("Error")
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.3)] text-[#13eca4]"
            }`}>
              <span className="material-symbols-outlined text-lg">
                {saveStatus.startsWith("Error") ? "error" : "check_circle"}
              </span>
              {saveStatus}
            </div>
          )}

          {/* Tab Nav */}
          <div className="mt-8 flex border-b border-[rgba(255,255,255,0.07)] gap-8">
            {[
              { label: "Content Builder",    num: "1", active: false, href: `/course-creator/step2?courseId=${courseId}` },
              { label: "Interactive Tasks",   num: "2", active: false, href: `/course-creator/step2?courseId=${courseId}` },
              { label: "Facilitation Notes",  num: "3", active: true,  href: "#" },
            ].map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
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
              </Link>
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
              <h2 className="text-2xl font-bold mb-4">{course?.title || "Module 3: Wiring the Controller"}</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                {course?.description || "In this step, students will connect the microcontroller to the motor driver. Ensure that all power is disconnected before starting the wiring process. Use the color-coded jumper wires as shown in the diagram."}
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
                    <li>- Microcontroller board</li>
                    <li>- 4x Jumper Wires</li>
                    <li>- Breadboard</li>
                  </ul>
                </div>
                <div className="p-4 border border-[rgba(255,255,255,0.08)] rounded-lg bg-[#1a2e27]">
                  <span className="material-symbols-outlined text-[#13eca4] mb-2 block">timer</span>
                  <p className="font-bold text-sm">Estimated Time</p>
                  <p className="text-xs text-slate-500 mt-2">{course?.estimatedDuration || "15-20 Minutes"}</p>
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
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.pptx,.zip,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleResourceUpload}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-xl bg-[#1a2e27] border-2 border-dashed border-[rgba(255,255,255,0.1)] flex flex-col items-center justify-center gap-2 text-center py-8 cursor-pointer hover:border-[rgba(19,236,164,0.4)] hover:bg-[rgba(19,236,164,0.03)] transition-all"
                  >
                    {uploading ? (
                      <>
                        <div className="w-10 h-10 border-3 border-[rgba(19,236,164,0.2)] border-t-[#13eca4] rounded-full animate-spin" />
                        <p className="text-sm font-bold text-[#13eca4]">{progress}%</p>
                        <p className="text-[10px] text-slate-500">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-3xl text-slate-500">upload_file</span>
                        <p className="text-sm font-bold">Upload Educator Resources</p>
                        <p className="text-[10px] text-slate-500">PDF, PPTX, or ZIP files (Max 20MB)</p>
                      </>
                    )}
                  </div>

                  {/* Uploaded Resources List */}
                  {uploadedResources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedResources.map((res, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(19,236,164,0.04)] border border-[rgba(19,236,164,0.1)]">
                          <span className="material-symbols-outlined text-[#13eca4] text-sm">description</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{res.name}</p>
                            <p className="text-[10px] text-slate-500">{res.size}</p>
                          </div>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#13eca4] hover:underline text-[10px] font-bold"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
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
            <span className="material-symbols-outlined text-sm">
              {savingNotes ? "sync" : "history"}
            </span>
            {savingNotes ? "Saving..." : saveStatus || "Ready to save"}
          </span>
        </div>
        <div className="flex gap-4">
          <Link href={`/course-creator/step2?courseId=${courseId}`} className="px-6 py-2 rounded-lg text-slate-400 font-bold text-sm hover:bg-[rgba(255,255,255,0.06)] transition-colors">
            Back to Curriculum
          </Link>
          <Link href={`/course-creator/step4?courseId=${courseId}`} className="px-8 py-2 rounded-lg bg-[#13eca4] text-[#10221c] font-black text-sm shadow-lg shadow-[rgba(19,236,164,0.15)] hover:opacity-90 transition-opacity">
            Next: Review &amp; Publish
          </Link>
        </div>
      </footer>
    </div>
  );
}
