import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Valid ID token is required" }, { status: 400 });
    }

    // Create a session cookie (5 days).
    // createSessionCookie verifies the token internally — no need for a
    // separate verifyIdToken call which would be an extra failure point.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error("Session creation error:", {
      code: err.code ?? "unknown",
      message: err.message ?? String(error),
    });

    // Return actionable error info to the client
    const code = err.code ?? "unknown";
    return NextResponse.json({ error: "Failed to create session", code }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ status: "success" });
    response.cookies.set("__session", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
