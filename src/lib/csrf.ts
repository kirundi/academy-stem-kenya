/**
 * CSRF protection — double-submit cookie pattern.
 *
 * Flow:
 *  1. On successful login, /api/auth/session sets a non-httpOnly `__csrf` cookie.
 *  2. Client-side code reads that cookie and echoes it in the `X-CSRF-Token` header.
 *  3. Server-side `validateCsrf()` compares the header value to the cookie value.
 *     Because cross-origin JS cannot read same-site cookies, a third-party page
 *     cannot forge the header even if it causes the browser to send the session cookie.
 *
 * Note: the session cookie itself uses sameSite: "strict", which already blocks
 * the overwhelming majority of CSRF vectors. This double-submit layer is additive
 * defense-in-depth for state-changing API routes that need it.
 */

// ─── Server-side ────────────────────────────────────────────────────────────

/** Generate a new CSRF token (call once per session). */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate the CSRF token on a server-side request.
 * Compares the `X-CSRF-Token` request header to the `__csrf` cookie value.
 * Returns true if they match; false (or skips) for GET/HEAD/OPTIONS.
 */
export function validateCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();
  // Safe methods don't need CSRF protection.
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("__csrf="))
    ?.slice("__csrf=".length);

  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

// ─── Client-side ────────────────────────────────────────────────────────────

/** Read the CSRF token from the `__csrf` cookie. Returns "" when not available (SSR). */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Drop-in replacement for `fetch` that automatically adds the `X-CSRF-Token` header.
 * Use this for all state-changing API calls (POST, PUT, PATCH, DELETE).
 *
 * @example
 *   import { csrfFetch } from "@/lib/csrf";
 *   const res = await csrfFetch("/api/classrooms", { method: "POST", body: JSON.stringify(data) });
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-CSRF-Token", getCsrfToken());
  return fetch(url, { ...options, headers });
}
