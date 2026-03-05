"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import EditorSidebar from "@/components/EditorSidebar";
import FileUploadButton from "@/components/FileUploadButton";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection, useCreateDoc, orderBy } from "@/hooks/useFirestore";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  formatFileSize,
  getFileIcon,
  FILE_TYPE_LABELS,
  ACCEPT_ALL,
  ALL_ALLOWED_TYPES,
  validateFile,
} from "@/lib/file-validation";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { MediaItem } from "@/lib/types";

type FilterTab = "all" | "images" | "documents";

export default function EditorMediaPage() {
  const { appUser } = useAuthContext();
  const { create: createMediaDoc } = useCreateDoc("media");
  const { uploadFile, uploading, progress } = useFileUpload();
  const { data: mediaItems, loading } = useCollection<MediaItem>(
    "media",
    [orderBy("createdAt", "desc")],
    true
  );

  const [filter, setFilter] = useState<FilterTab>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredItems = mediaItems.filter((item) => {
    if (filter === "images") return item.mimeType.startsWith("image/");
    if (filter === "documents") return !item.mimeType.startsWith("image/");
    return true;
  });

  const handleUploadComplete = async (url: string, file: File) => {
    if (!appUser) return;
    setUploadError(null);
    try {
      await createMediaDoc({
        fileName: file.name,
        url,
        mimeType: file.type,
        size: file.size,
        uploadedBy: appUser.uid,
        createdAt: new Date(),
      });
    } catch {
      setUploadError("File uploaded but failed to save metadata.");
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "media", id));
    } catch {
      // Silently fail — item may already be deleted
    } finally {
      setDeleting(null);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (!file || !appUser) return;

      const validation = validateFile(file, { allowedTypes: ALL_ALLOWED_TYPES });
      if (!validation.valid) {
        setUploadError(validation.error);
        return;
      }

      setUploadError(null);
      try {
        const path = `media/${Date.now()}_${file.name}`;
        const url = await uploadFile(file, path);
        await createMediaDoc({
          fileName: file.name,
          url,
          mimeType: file.type,
          size: file.size,
          uploadedBy: appUser.uid,
          createdAt: new Date(),
        });
      } catch {
        setUploadError("Upload failed. Please try again.");
      }
    },
    [appUser, uploadFile, createMediaDoc]
  );

  return (
    <div className="flex h-screen bg-(--bg-page)">
      <EditorSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(236,72,153,0.1)] px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-(--text-base)">Media Library</h1>
            <p className="text-(--text-muted) text-xs mt-0.5">
              Images and documents for your courses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-(--text-faint) text-xs">
              {mediaItems.length} {mediaItems.length === 1 ? "file" : "files"}
            </span>
            <FileUploadButton
              storagePath="media"
              accept="all"
              label="Upload"
              icon="cloud_upload"
              className="bg-[#ec4899] text-white hover:opacity-90"
              onUploadComplete={handleUploadComplete}
              onError={(msg) => setUploadError(msg)}
            />
          </div>
        </header>

        <div className="px-8 py-8 space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed transition-all ${
              dragOver
                ? "border-[#ec4899] bg-[rgba(236,72,153,0.08)]"
                : "border-[rgba(236,72,153,0.2)] hover:border-[rgba(236,72,153,0.4)]"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-12 h-12 border-3 border-(--border) border-t-[#ec4899] rounded-full animate-spin" />
                <span className="text-[#ec4899] text-sm font-semibold">{progress}%</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[40px] text-[rgba(236,72,153,0.4)]">
                  cloud_upload
                </span>
                <p className="text-(--text-muted) text-sm">
                  Drag & drop files here, or use the Upload button
                </p>
                <p className="text-(--text-faint) text-xs">
                  PDF, DOCX, PPTX, XLSX, TXT, CSV, PNG, JPG, GIF, SVG, WebP — Max 10 MB
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {uploadError}
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-(--bg-card) rounded-xl p-1 w-fit">
            {([
              { key: "all", label: "All" },
              { key: "images", label: "Images" },
              { key: "documents", label: "Documents" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.key
                    ? "bg-[rgba(236,72,153,0.15)] text-[#ec4899]"
                    : "text-(--text-muted) hover:text-(--text-base)"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Media grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-3 border-(--border) border-t-[#ec4899] rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-[48px] text-[rgba(236,72,153,0.3)]">
                {filter === "images" ? "image" : filter === "documents" ? "description" : "photo_library"}
              </span>
              <p className="text-(--text-faint) text-sm">
                {filter === "all"
                  ? "No media uploaded yet. Upload your first file above."
                  : `No ${filter} found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isImage = item.mimeType.startsWith("image/");
                return (
                  <div
                    key={item.id}
                    className="group bg-(--bg-card) rounded-2xl border border-[rgba(236,72,153,0.08)] overflow-hidden hover:border-[rgba(236,72,153,0.25)] transition-all"
                  >
                    {/* Preview */}
                    <div className="aspect-video relative bg-black/20 flex items-center justify-center">
                      {isImage ? (
                        <Image
                          src={item.url}
                          alt={item.fileName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[40px] text-[rgba(236,72,153,0.4)]">
                          {getFileIcon(item.mimeType)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-(--text-base) text-xs font-medium truncate mb-0.5">
                        {item.fileName}
                      </p>
                      <p className="text-(--text-faint) text-[10px]">
                        {isImage
                          ? "Image"
                          : FILE_TYPE_LABELS[item.mimeType] || "Document"}{" "}
                        · {formatFileSize(item.size)}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleCopy(item.url, item.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold bg-[rgba(236,72,153,0.1)] text-[#ec4899] hover:bg-[rgba(236,72,153,0.2)] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {copied === item.id ? "check" : "content_copy"}
                          </span>
                          {copied === item.id ? "Copied!" : "Copy URL"}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="p-1.5 rounded-lg text-(--text-faint) hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {deleting === item.id ? "progress_activity" : "delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
