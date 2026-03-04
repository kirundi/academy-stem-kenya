"use client";

import EditorSidebar from "@/components/EditorSidebar";

const PLACEHOLDER_SLOTS = [0, 1, 2, 3, 4, 5];

export default function EditorMediaPage() {
  return (
    <div className="flex h-screen bg-(--bg-page)">
      <EditorSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(236,72,153,0.1)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Media Library</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">Images and assets for your courses</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(236,72,153,0.12)] border border-[rgba(236,72,153,0.2)]">
            <span className="material-symbols-outlined text-[#ec4899] text-[16px]">
              photo_library
            </span>
            <span className="text-[#ec4899] text-xs font-semibold">Coming Soon</span>
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[rgba(236,72,153,0.08)] border border-[rgba(236,72,153,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-[rgba(236,72,153,0.15)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ec4899] text-[20px]">info</span>
            </div>
            <div>
              <p className="text-(--text-base) font-semibold text-sm mb-1">Media uploads not yet available</p>
              <p className="text-(--text-muted) text-sm leading-relaxed">
                Media uploads are not yet available. Course thumbnail images can be added via URL
                when creating a course.
              </p>
            </div>
          </div>

          {/* Placeholder grid */}
          <div>
            <h2 className="text-(--text-base) font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ec4899] text-[20px]">
                grid_view
              </span>
              Media Assets
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PLACEHOLDER_SLOTS.map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl border-2 border-dashed border-[rgba(236,72,153,0.2)] flex flex-col items-center justify-center gap-2 text-center p-4 hover:border-[rgba(236,72,153,0.4)] transition-colors"
                >
                  <span className="material-symbols-outlined text-[32px] text-[rgba(236,72,153,0.3)]">
                    image
                  </span>
                  <p className="text-slate-600 text-xs font-medium">Empty Slot</p>
                </div>
              ))}
            </div>
          </div>

          {/* Note card */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-(--bg-card) border border-[rgba(236,72,153,0.08)]">
            <div className="w-10 h-10 rounded-xl bg-[rgba(236,72,153,0.08)] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#ec4899] text-[20px]">
                contact_support
              </span>
            </div>
            <div>
              <p className="text-(--text-base) font-semibold text-sm mb-1">Need a specific image?</p>
              <p className="text-(--text-muted) text-sm leading-relaxed">
                Contact the platform admin to upload media assets. Once uploaded, image URLs
                can be used in your course thumbnails and lesson content.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
