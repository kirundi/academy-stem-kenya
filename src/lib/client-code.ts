// Visually unambiguous characters (matches server-side alphabet in student-code.ts)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Generates a random code using crypto.getRandomValues (browser-safe). */
export function generateJoinCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
