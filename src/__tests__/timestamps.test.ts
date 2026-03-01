import { describe, it, expect } from "vitest";
import { toDate, formatTimestamp } from "@/lib/timestamps";

describe("toDate", () => {
  it("returns fallback for null/undefined", () => {
    const fallback = new Date("2024-01-01");
    expect(toDate(null, fallback)).toBe(fallback);
    expect(toDate(undefined, fallback)).toBe(fallback);
  });

  it("returns the Date when given a Date object", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    expect(toDate(date)).toBe(date);
  });

  it("converts a valid date string", () => {
    const result = toDate("2024-06-15T12:00:00Z");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5); // June = 5
  });

  it("converts a numeric timestamp", () => {
    const ts = new Date("2024-01-01").getTime();
    const result = toDate(ts);
    expect(result.getTime()).toBe(ts);
  });

  it("returns fallback for invalid string", () => {
    const fallback = new Date("2024-01-01");
    expect(toDate("not-a-date", fallback)).toBe(fallback);
  });

  it("handles Firestore Timestamp-like objects", () => {
    const expected = new Date("2024-06-15");
    const firestoreTimestamp = { toDate: () => expected };
    expect(toDate(firestoreTimestamp)).toBe(expected);
  });
});

describe("formatTimestamp", () => {
  it("returns fallback for null/undefined", () => {
    expect(formatTimestamp(null)).toBe("Unknown time");
    expect(formatTimestamp(undefined, "N/A")).toBe("N/A");
  });

  it("formats a valid date", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = formatTimestamp(date);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("Unknown time");
  });
});
