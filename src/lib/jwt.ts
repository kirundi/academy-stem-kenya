/**
 * Lightweight JWT payload decoder — no signature verification.
 * Safe to use in Edge Runtime (middleware) and on the client.
 * The signature is verified separately by Firebase Admin SDK on the server.
 */
export function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Firebase uses base64url; convert to standard base64 before atob().
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
