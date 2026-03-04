import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateCsrfToken } from "@/lib/csrf";

// Session durations
const DURATION_PERSISTENT = 60 * 60 * 24 * 14 * 1000; // 14 days (Firebase max for session cookies)
const DURATION_SESSION = 60 * 60 * 24 * 1 * 1000; // 24 hours (browser session)
const DURATION_STUDENT = 60 * 60 * 24 * 7 * 1000; // 7 days (students, no choice)

// Per-IP: 30 attempts per 15 minutes (covers a school lab on shared NAT).
// Per-UID: 10 attempts per 15 minutes (stops brute-force against a specific account).
const RL_IP_MAX = 30;
const RL_UID_MAX = 10;
const RL_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  // Use last IP in X-Forwarded-For (appended by Google's LB — not spoofable by clients).
  const ip = getClientIp(request);
  const { allowed, resetAt } = await checkRateLimit(`session_${ip}`, RL_IP_MAX, RL_WINDOW_MS);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const body = await request.json();
    const { idToken, remember, isStudent } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Valid ID token is required" }, { status: 400 });
    }

    // Determine session duration based on user type and remember preference.
    let expiresIn: number;
    if (isStudent) {
      expiresIn = DURATION_STUDENT;
    } else if (remember === true) {
      expiresIn = DURATION_PERSISTENT;
    } else {
      expiresIn = DURATION_SESSION;
    }

    // Decode the token first to get uid for per-user rate limiting.
    // verifyIdToken also validates signature + expiry before we spend a session cookie.
    let requiresPasswordChange = false;
    let uid: string | null = null;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;

      // Per-UID rate limit — prevents brute-forcing a specific account even from
      // different IPs (e.g. distributed attack). School NAT won't trigger this.
      const uidLimit = await checkRateLimit(`session_uid_${uid}`, RL_UID_MAX, RL_WINDOW_MS);
      if (!uidLimit.allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil((uidLimit.resetAt - Date.now()) / 1000)) },
          }
        );
      }

      const userDoc = await adminDb.collection("users").doc(uid).get();
      if (userDoc.exists) {
        requiresPasswordChange = userDoc.data()?.requiresPasswordChange ?? false;
      }
    } catch (err) {
      const e = err as { code?: string };
      // If token verification fails outright, reject immediately.
      if (e.code?.startsWith("auth/")) {
        return NextResponse.json({ error: "Invalid ID token", code: e.code }, { status: 401 });
      }
      // Other errors (Firestore read failure) are non-fatal.
    }

    // createSessionCookie verifies the token internally (second check — belt and braces).
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Write a session record for the session management UI.
    let sessionId: string | null = null;
    if (uid) {
      try {
        sessionId = crypto.randomUUID();
        const device = request.headers.get("user-agent") ?? "unknown";
        await adminDb
          .collection("sessions")
          .doc(sessionId)
          .set({
            uid,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + expiresIn),
            lastSeenAt: new Date(),
            ip,
            device,
          });
      } catch {
        // Non-fatal — session cookie is still set even if record write fails.
      }
    }

    // Successful login — clear the rate-limit bucket so the user isn't penalised for future logins.
    await resetRateLimit(`session_${ip}`);
    if (uid) await resetRateLimit(`session_uid_${uid}`);

    const csrfToken = generateCsrfToken();
    const response = NextResponse.json({ status: "success", requiresPasswordChange });

    // sameSite: "strict" — the session cookie is never sent on cross-origin requests,
    // which blocks the majority of CSRF attack vectors at the browser level.
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    // Store sessionId in a separate readable cookie so the client can send it
    // when revoking a specific session. Not httpOnly so JS can read it.
    if (sessionId) {
      response.cookies.set("__session_id", sessionId, {
        maxAge: expiresIn / 1000,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "strict",
      });
    }

    // Double-submit CSRF token (non-httpOnly so client JS can read and echo it
    // in the X-CSRF-Token header). Works as a second layer on top of sameSite: strict.
    response.cookies.set("__csrf", csrfToken, {
      maxAge: expiresIn / 1000,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error("Session creation error:", {
      code: err.code ?? "unknown",
      message: err.message ?? String(error),
    });
    const code = err.code ?? "unknown";
    return NextResponse.json({ error: "Failed to create session", code }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clean up the session record if we have the sessionId.
    const sessionId = request.cookies.get("__session_id")?.value;
    if (sessionId) {
      await adminDb
        .collection("sessions")
        .doc(sessionId)
        .delete()
        .catch(() => {});
    }

    const response = NextResponse.json({ status: "success" });
    const cookieBase = {
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict" as const,
    };
    response.cookies.set("__session", "", { ...cookieBase, httpOnly: true });
    response.cookies.set("__session_id", "", { ...cookieBase, httpOnly: false });
    response.cookies.set("__csrf", "", { ...cookieBase, httpOnly: false });
    return response;
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
