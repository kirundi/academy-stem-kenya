export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/plain",
  "text/csv",
];

export const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "text/plain": "Text",
  "text/csv": "CSV",
};

export const FILE_TYPE_ICONS: Record<string, string> = {
  "application/pdf": "picture_as_pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "description",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "slideshow",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "table_chart",
  "text/plain": "article",
  "text/csv": "table_chart",
};

export const ACCEPT_ALL =
  ".pdf,.docx,.pptx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.gif,.svg,.webp";
export const ACCEPT_IMAGES = ".png,.jpg,.jpeg,.gif,.svg,.webp";
export const ACCEPT_DOCUMENTS = ".pdf,.docx,.pptx,.xlsx,.txt,.csv";

export interface FileValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateFile(
  file: File,
  options?: { maxSize?: number; allowedTypes?: string[] }
): FileValidationResult {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;
  const allowedTypes = options?.allowedTypes ?? ALL_ALLOWED_TYPES;

  if (file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File must be under ${sizeMB} MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not allowed. Accepted: PDF, DOCX, PPTX, XLSX, TXT, CSV, and images.`,
    };
  }

  return { valid: true, error: null };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  return FILE_TYPE_ICONS[mimeType] ?? "insert_drive_file";
}
