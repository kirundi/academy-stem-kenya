"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCsrfToken } from "@/lib/csrf";
import { useFileUpload } from "@/hooks/useFileUpload";
import { validateFile, ALLOWED_IMAGE_TYPES, ACCEPT_IMAGES } from "@/lib/file-validation";

const CATEGORIES = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Robotics",
  "Environmental Science",
  "Data Science",
  "General STEM",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function EditorNewCoursePage() {
  const router = useRouter();
  const { uploadFile, uploading: uploadingCover, progress: uploadProgress } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    targetGrade: "",
    estimatedDuration: "",
    totalLessons: 0,
    icon: "📚",
    color: "var(--primary-green)",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(status: "draft" | "pending_review") {
    if (!form.title.trim()) {
      setError("Course title is required.");
      return;
    }
    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let coverImageUrl = "";
      if (coverFile) {
        coverImageUrl = await uploadFile(
          coverFile,
          `courses/covers/${Date.now()}_${coverFile.name}`
        );
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify({
          ...form,
          coverImageUrl,
          status,
          totalLessons: Number(form.totalLessons) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create course");
      }
      router.push("/editor/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(236,72,153,0.1)] px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/editor/courses"
            className="text-(--text-muted) hover:text-(--text-base) transition-colors flex items-center gap-1 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Courses
          </Link>
          <div className="h-4 w-px bg-(--bg-elevated)" />
          <h1 className="text-xl font-bold text-(--text-base)">New Course</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-(--border) text-(--text-base) hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave("pending_review")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-(--text-base) disabled:opacity-50"
            style={{ background: "#ec4899" }}
          >
            {saving ? "Saving…" : "Submit for Review"}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
            Course Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Introduction to Python Programming"
            className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe what students will learn in this course…"
            rows={4}
            className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm resize-none focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
            Cover Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              e.target.value = "";
              const validation = validateFile(file, { allowedTypes: ALLOWED_IMAGE_TYPES });
              if (!validation.valid) {
                setError(validation.error);
                return;
              }
              setCoverFile(file);
              setCoverPreview(URL.createObjectURL(file));
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-48 rounded-xl border-2 border-dashed border-(--border) hover:border-[rgba(236,72,153,0.4)] transition-colors cursor-pointer overflow-hidden flex items-center justify-center bg-(--bg-card)"
          >
            {coverPreview ? (
              <>
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">Click to replace</span>
                </div>
              </>
            ) : uploadingCover ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-3 border-(--border) border-t-[#ec4899] rounded-full animate-spin" />
                <span className="text-[#ec4899] text-sm font-semibold">{uploadProgress}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-(--text-faint)">
                <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                <span className="text-sm">Click to upload cover image</span>
                <span className="text-xs text-(--text-faint)">PNG, JPG, GIF, SVG, WebP — Max 10 MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Category + Difficulty */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Difficulty
            </label>
            <select
              value={form.difficulty}
              onChange={(e) => update("difficulty", e.target.value)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade + Duration + Lessons */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Target Grade
            </label>
            <input
              value={form.targetGrade}
              onChange={(e) => update("targetGrade", e.target.value)}
              placeholder="e.g. 9-12"
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Estimated Duration
            </label>
            <input
              value={form.estimatedDuration}
              onChange={(e) => update("estimatedDuration", e.target.value)}
              placeholder="e.g. 6 weeks"
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Total Lessons
            </label>
            <input
              type="number"
              min="0"
              value={form.totalLessons}
              onChange={(e) => update("totalLessons", Number(e.target.value) || 0)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
        </div>

        {/* Icon + Color */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Course Icon (emoji)
            </label>
            <input
              value={form.icon}
              onChange={(e) => update("icon", e.target.value)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-2xl focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => update("color", e.target.value)}
                className="w-12 h-12 rounded-xl border border-(--border-subtle) bg-transparent cursor-pointer"
              />
              <span className="text-(--text-muted) text-sm font-mono">{form.color}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
