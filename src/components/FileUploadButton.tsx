"use client";

import { useRef, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  validateFile,
  ACCEPT_ALL,
  ACCEPT_IMAGES,
  ACCEPT_DOCUMENTS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALL_ALLOWED_TYPES,
} from "@/lib/file-validation";

interface FileUploadButtonProps {
  storagePath: string;
  onUploadComplete: (url: string, file: File) => void;
  onError?: (message: string) => void;
  accept?: "all" | "images" | "documents";
  label?: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

export default function FileUploadButton({
  storagePath,
  onUploadComplete,
  onError,
  accept = "all",
  label = "Upload File",
  icon = "upload_file",
  className = "",
  disabled = false,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, progress } = useFileUpload();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const acceptString =
    accept === "images"
      ? ACCEPT_IMAGES
      : accept === "documents"
        ? ACCEPT_DOCUMENTS
        : ACCEPT_ALL;

  const allowedTypes =
    accept === "images"
      ? ALLOWED_IMAGE_TYPES
      : accept === "documents"
        ? ALLOWED_DOCUMENT_TYPES
        : ALL_ALLOWED_TYPES;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploadError(null);
    const validation = validateFile(file, { allowedTypes });
    if (!validation.valid) {
      setUploadError(validation.error);
      onError?.(validation.error!);
      return;
    }

    try {
      const path = `${storagePath}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      onUploadComplete(url, file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      onError?.(msg);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            <span>{progress}%</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            <span>{label}</span>
          </>
        )}
      </button>
      {uploadError && !uploading && (
        <p className="text-red-400 text-xs mt-1">{uploadError}</p>
      )}
    </div>
  );
}
