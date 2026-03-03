import { adminDb } from "@/lib/firebase-admin";

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
