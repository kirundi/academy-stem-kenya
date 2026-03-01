"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCreateDoc } from "@/hooks/useFirestore";
import { useFileUpload } from "@/hooks/useFileUpload";
import { logActivity } from "@/lib/activity-logger";

const badges = [
  { icon: "rocket_launch", label: "Rocket" },
  { icon: "memory", label: "Memory" },
  { icon: "precision_manufacturing", label: "Robotics" },
  { icon: "biotech", label: "Biotech" },
  { icon: "terminal", label: "Terminal" },
];

const categories = ["Robotics", "Web Design", "Data Science", "Astronomy", "Circuitry", "Game Design", "Coding"];

export default function CourseCreatorStep1Page() {
  const router = useRouter();
  const { appUser } = useAuthContext();
  const { create, loading: creating } = useCreateDoc("courses");
  const { uploadFile, uploading, progress } = useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [description, setDescription] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [durationAmount, setDurationAmount] = useState("");
  const [durationUnit, setDurationUnit] = useState("Hours");
  const [selectedBadge, setSelectedBadge] = useState(0);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Cover image must be under 2MB.");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const handleSave = async (isDraft: boolean) => {
    if (!appUser) {
      setErrorMsg("You must be logged in to create a course.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Course title is required.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      let coverImageUrl = "";

      if (coverFile) {
        coverImageUrl = await uploadFile(
          coverFile,
          `courses/covers/${Date.now()}_${coverFile.name}`
        );
      }

      const courseData: Record<string, unknown> = {
        title: title.trim(),
        category,
        difficulty,
        description: description.trim(),
        targetGrade,
        estimatedDuration: durationAmount ? `${durationAmount} ${durationUnit}` : "",
        badgeId: badges[selectedBadge]?.icon || "",
        coverImageUrl,
        color: "#13eca4",
        icon: badges[selectedBadge]?.icon || "rocket_launch",
        totalLessons: 0,
        createdBy: appUser.uid,
        schoolId: appUser.schoolId || null,
        status: isDraft ? "draft" : "draft",
      };

      const courseId = await create(courseData);

      await logActivity(
        appUser.uid,
        "course_created",
        `Created course "${title.trim()}"`,
        courseId
      );

      if (isDraft) {
        router.push(`/dashboard/courses/create/step2?courseId=${courseId}`);
      } else {
        router.push(`/dashboard/courses/create/step2?courseId=${courseId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save course.";
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = saving || creating || uploading;

  return (
    <div className="min-h-screen bg-[#10221c] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[rgba(16,34,28,0.9)] backdrop-blur-md px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-[#13eca4]">
            <span className="material-symbols-outlined text-3xl">account_tree</span>
            <h2 className="text-white text-lg font-bold tracking-tight">STEM Learn</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Courses", href: "/dashboard/content" },
              { label: "Students", href: "/dashboard/users" },
              { label: "Resources", href: "/dashboard" },
            ].map((item) => (
              <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors ${item.label === "Courses" ? "text-[#13eca4] border-b-2 border-[#13eca4] pb-1" : "text-slate-400 hover:text-[#13eca4]"}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] text-slate-400 hover:bg-[rgba(19,236,164,0.1)] hover:text-[#13eca4] transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] text-slate-400 hover:bg-[rgba(19,236,164,0.1)] hover:text-[#13eca4] transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-[rgba(19,236,164,0.15)] border-2 border-[rgba(19,236,164,0.3)] flex items-center justify-center text-[#13eca4] font-bold text-sm">
            {appUser?.displayName?.slice(0, 2).toUpperCase() || "TM"}
          </div>
        </div>
      </header>

      <main className="flex justify-center py-10 px-4">
        <div className="w-full max-w-240">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 mb-5 text-sm">
            <a href="/dashboard" className="text-slate-500 hover:text-[#13eca4] transition-colors">Dashboard</a>
            <span className="text-slate-600">/</span>
            <a href="/dashboard/content" className="text-slate-500 hover:text-[#13eca4] transition-colors">Course Creator</a>
            <span className="text-slate-600">/</span>
            <span className="text-[#13eca4] font-medium">New Course</span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-tight">Create New Course</h1>
            <p className="text-slate-400 text-lg mt-1">Step 1: Basic Information &amp; Badge Setup</p>
          </div>

          {/* 4-Step Stepper */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {[
              { label: "1. Basic Info",    active: true  },
              { label: "2. Curriculum",    active: false },
              { label: "3. Facilitation",  active: false },
              { label: "4. Publish",       active: false },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`h-1.5 w-full rounded-full ${s.active ? "bg-[#13eca4]" : "bg-[rgba(255,255,255,0.08)]"}`} />
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-xl ${s.active ? "text-[#13eca4]" : "text-slate-600"}`}
                    style={s.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {s.active ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <p className={`text-sm font-medium ${s.active ? "text-[#13eca4] font-bold" : "text-slate-500"}`}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {errorMsg}
            </div>
          )}

          {/* Main Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Cover + Badge */}
            <div className="space-y-8">
              {/* Cover Image */}
              <div>
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13eca4]">image</span>
                  Cover Image
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg"
                  className="hidden"
                  onChange={handleCoverSelect}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer border-2 border-dashed border-[rgba(255,255,255,0.15)] rounded-xl aspect-4/3 flex flex-col items-center justify-center bg-[rgba(255,255,255,0.02)] hover:border-[rgba(19,236,164,0.5)] hover:bg-[rgba(19,236,164,0.03)] transition-all overflow-hidden"
                >
                  {coverPreview ? (
                    <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <span className="material-symbols-outlined text-slate-600 text-5xl mb-2 group-hover:text-[#13eca4] transition-colors block">cloud_upload</span>
                      <p className="text-sm text-slate-400 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-600 mt-1 italic">SVG, PNG, JPG (max 2MB)</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-[rgba(16,34,28,0.8)] flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-[rgba(19,236,164,0.2)] border-t-[#13eca4] rounded-full animate-spin mb-3" />
                      <p className="text-sm text-[#13eca4] font-bold">{progress}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge Selection */}
              <div>
                <h3 className="text-white text-lg font-bold mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13eca4]">workspace_premium</span>
                  Completion Badge
                </h3>
                <p className="text-slate-500 text-sm mb-4 italic">Select the digital token students earn.</p>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((b, i) => (
                    <button
                      key={b.icon}
                      onClick={() => setSelectedBadge(i)}
                      className={`aspect-square rounded-xl bg-[#1a2e27] flex items-center justify-center border-2 transition-all ${
                        selectedBadge === i
                          ? "border-[#13eca4] shadow-[0_0_15px_rgba(19,236,164,0.2)]"
                          : "border-transparent hover:border-[rgba(255,255,255,0.2)]"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-4xl ${selectedBadge === i ? "text-[#13eca4]" : "text-slate-500"}`}>{b.icon}</span>
                    </button>
                  ))}
                  <button className="aspect-square rounded-xl bg-[#1a2e27] flex items-center justify-center border-2 border-dashed border-[rgba(255,255,255,0.12)] hover:border-[rgba(19,236,164,0.4)] transition-all">
                    <span className="material-symbols-outlined text-slate-500">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-white text-base font-bold mb-2">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Mars Robotics"
                  className="w-full bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg focus:ring-2 focus:ring-[#13eca4] focus:border-transparent text-white placeholder-slate-600 p-3 h-12 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-base font-bold mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg focus:ring-2 focus:ring-[#13eca4] text-white p-3 h-12 outline-none appearance-none cursor-pointer transition-all"
                  >
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-white text-base font-bold mb-2">Difficulty Level</label>
                  <div className="flex gap-2 h-12">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 rounded-lg text-xs font-bold transition-all ${
                          difficulty === d
                            ? "bg-[#13eca4] text-[#10221c] border border-[#13eca4]"
                            : "bg-[#1a2e27] text-slate-400 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(19,236,164,0.4)] hover:text-[#13eca4]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white text-base font-bold mb-2">Short Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what students will learn in this course..."
                  className="w-full bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg focus:ring-2 focus:ring-[#13eca4] focus:border-transparent text-white placeholder-slate-600 p-3 outline-none resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white text-base font-bold mb-2">Target Grade Level</label>
                <div className="flex flex-wrap gap-2">
                  {["Grade 5-6", "Grade 7-8", "Grade 9-10", "Grade 11-12", "All Levels"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setTargetGrade(g)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        targetGrade === g
                          ? "border-[#13eca4] text-[#13eca4] bg-[rgba(19,236,164,0.1)]"
                          : "border-[rgba(255,255,255,0.1)] text-slate-400 hover:border-[#13eca4] hover:text-[#13eca4]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white text-base font-bold mb-2">Estimated Duration</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="4"
                    value={durationAmount}
                    onChange={(e) => setDurationAmount(e.target.value)}
                    className="w-24 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg text-white p-3 h-12 outline-none focus:ring-2 focus:ring-[#13eca4]"
                  />
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="flex-1 bg-[#1a2e27] border border-[rgba(255,255,255,0.08)] rounded-lg text-white p-3 h-12 outline-none focus:ring-2 focus:ring-[#13eca4] appearance-none"
                  >
                    <option>Hours</option>
                    <option>Days</option>
                    <option>Weeks</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <button
                  onClick={() => handleSave(true)}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg text-slate-400 font-bold hover:bg-[rgba(255,255,255,0.06)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#13eca4] text-[#10221c] font-black hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(19,236,164,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#10221c]/30 border-t-[#10221c] rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next: Curriculum
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
