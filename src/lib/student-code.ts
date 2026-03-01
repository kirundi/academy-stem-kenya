import crypto from "crypto";
import type { Firestore } from "firebase-admin/firestore";

// Visually unambiguous characters (excludes 0/O, 1/I/L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateStudentCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

export async function generateUniqueStudentCode(
  db: Firestore,
  maxAttempts = 5,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateStudentCode();
    const existing = await db
      .collection("users")
      .where("studentCode", "==", code)
      .limit(1)
      .get();
    if (existing.empty) {
      return code;
    }
  }
  throw new Error("Failed to generate a unique student code");
}
