"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCsrfToken } from "@/lib/csrf";

export default function EditorNewChallengePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    theme: "",
    scope: "global",
    date: "",
    time: "09:00",
    duration: 7,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(status: "draft" | "published") {
    if (!form.title.trim()) {
      setError("Challenge title is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrfToken(),
        },
        body: JSON.stringify({ ...form, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create challenge");
      }
      router.push("/editor/challenges");
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
            href="/editor/challenges"
            className="text-(--text-muted) hover:text-(--text-base) transition-colors flex items-center gap-1 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Challenges
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <h1 className="text-xl font-bold text-(--text-base)">New Challenge</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-(--border) text-(--text-muted) hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-(--text-base) disabled:opacity-50"
            style={{ background: "#ec4899" }}
          >
            {saving ? "Saving…" : "Publish Challenge"}
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

        <div>
          <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
            Challenge Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Eco-Hack 2025: Sustainable Cities"
            className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
          />
        </div>

        <div>
          <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the challenge objectives and expected outcomes…"
            rows={4}
            className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm resize-none focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Theme
            </label>
            <input
              value={form.theme}
              onChange={(e) => update("theme", e.target.value)}
              placeholder="e.g. Sustainability, AI, Robotics"
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) placeholder:text-(--text-faint) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Scope
            </label>
            <select
              value={form.scope}
              onChange={(e) => update("scope", e.target.value)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none"
            >
              <option value="global">Global</option>
              <option value="national">National</option>
              <option value="school">School</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
          <div>
            <label className="block text-(--text-muted) text-xs font-semibold uppercase tracking-wide mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) => update("duration", Number(e.target.value) || 1)}
              className="w-full bg-(--bg-card) border border-(--border-subtle) rounded-xl px-4 py-3 text-(--text-base) text-sm focus:outline-none focus:border-[rgba(236,72,153,0.4)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
