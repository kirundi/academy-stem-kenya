import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Extract the real client IP from an incoming request.
 *
 * On Firebase Hosting + Cloud Run the request flows through Google's load
 * balancer, which APPENDS the real client IP to X-Forwarded-For.
 * Taking the LAST entry prevents clients from spoofing the header by sending
 * a forged leading IP (e.g. "X-Forwarded-For: fake-ip" → LB appends real IP
 * so the header becomes "fake-ip, real-ip" — we take the last one).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (ips.length > 0) return ips[ips.length - 1];
  }
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (ms)
}

/**
 * Firestore-backed sliding-window rate limiter.
 * Safe for serverless — no shared in-process state.
 *
 * @param key         Unique bucket key, e.g. "slr_1.2.3.4"
 * @param maxAttempts Max requests allowed in the window
 * @param windowMs    Window duration in milliseconds
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const ref = adminDb.collection("rateLimits").doc(key);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();

    if (!snap.exists) {
      // First request in this window.
      tx.set(ref, { count: 1, windowStart: now });
      return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
    }

    const { count, windowStart } = snap.data() as { count: number; windowStart: number };

    if (now - windowStart > windowMs) {
      // Window expired — reset.
      tx.set(ref, { count: 1, windowStart: now });
      return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
    }

    if (count >= maxAttempts) {
      return { allowed: false, remaining: 0, resetAt: windowStart + windowMs };
    }

    tx.update(ref, { count: count + 1 });
    return { allowed: true, remaining: maxAttempts - count - 1, resetAt: windowStart + windowMs };
  });
}

/**
 * Resets a rate limit bucket (call after a successful login).
 */
export async function resetRateLimit(key: string): Promise<void> {
  await adminDb
    .collection("rateLimits")
    .doc(key)
    .delete()
    .catch(() => {});
}
