"use client";

import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { compressImage } from "@/lib/image-compression";

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File, path: string): Promise<string> {
    setUploading(true);
    setProgress(0);
    setError(null);

    // Auto-compress images before upload
    const processed = file.type.startsWith("image/")
      ? await compressImage(file)
      : file;

    // Update path extension if compression changed the format
    let finalPath = path;
    if (processed !== file && processed.name !== file.name) {
      const newExt = processed.name.match(/\.[^.]+$/)?.[0] || "";
      finalPath = path.replace(/\.[^.]+$/, newExt);
    }

    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, finalPath);
      const uploadTask = uploadBytesResumable(storageRef, processed);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (err) => {
          setError(err.message);
          setUploading(false);
          reject(err);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          setProgress(100);
          resolve(url);
        }
      );
    });
  }

  return { uploadFile, uploading, progress, error };
}
