/**
 * Safely converts a Firestore Timestamp or Date-like value to a native Date.
 * Handles Firestore Timestamps (with `.toDate()`), Date objects, strings, and numbers.
 * Returns the provided fallback (default: `new Date()`) if conversion fails.
 */
export function toDate(value: unknown, fallback: Date = new Date()): Date {
  if (!value) return fallback;

  // Firestore Timestamp object
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  // Already a Date
  if (value instanceof Date) return value;

  // String or number
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? fallback : d;
  }

  return fallback;
}

/**
 * Formats a Firestore timestamp or Date-like value to a locale string.
 */
export function formatTimestamp(value: unknown, fallback = "Unknown time"): string {
  if (!value) return fallback;
  const date = toDate(value);
  return date.toLocaleString();
}
