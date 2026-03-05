const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;

// Types that should skip compression
const SKIP_TYPES = new Set(["image/svg+xml", "image/gif"]);

// Types we can compress via Canvas
const COMPRESSIBLE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

/**
 * Compresses an image file by resizing (if larger than MAX_DIMENSION)
 * and re-encoding as WebP (with JPEG fallback).
 * SVGs and GIFs are returned as-is.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (SKIP_TYPES.has(file.type)) return file;
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Downscale if either dimension exceeds the max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback: return original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compression didn't help — return original
            resolve(file);
            return;
          }

          const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const compressed = new File([blob], `${baseName}${ext}`, {
            type: blob.type,
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        "image/webp",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback: return original
    };

    img.src = url;
  });
}
