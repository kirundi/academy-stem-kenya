import { describe, it, expect } from "vitest";
import { parseCSV } from "@/lib/csv-parser";

describe("parseCSV", () => {
  it("parses a simple CSV string", () => {
    const csv = `name,email,role
Alice,alice@example.com,student
Bob,bob@example.com,teacher`;

    const result = parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "Alice",
      email: "alice@example.com",
      role: "student",
    });
    expect(result[1]).toEqual({
      name: "Bob",
      email: "bob@example.com",
      role: "teacher",
    });
  });

  it("returns empty array for header-only CSV", () => {
    expect(parseCSV("name,email")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseCSV("")).toEqual([]);
  });

  it("handles quoted values", () => {
    const csv = `"name","email"
"Alice","alice@example.com"`;

    const result = parseCSV(csv);
    expect(result[0].name).toBe("Alice");
    expect(result[0].email).toBe("alice@example.com");
  });

  it("handles missing trailing values", () => {
    const csv = `name,email,role
Alice`;

    const result = parseCSV(csv);
    expect(result[0]).toEqual({ name: "Alice", email: "", role: "" });
  });
});
