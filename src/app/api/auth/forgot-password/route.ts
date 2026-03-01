import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      const resetLink = await adminAuth.generatePasswordResetLink(email);
      const url = new URL(resetLink);
      const oobCode = url.searchParams.get("oobCode");

      if (oobCode) {
        await sendPasswordResetEmail({ to: email, oobCode });
      }
    } catch (err) {
      // Log but do NOT expose whether user exists — prevents email enumeration
      console.error("Password reset error:", err);
    }

    // Always return success regardless of whether the email exists
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot-password route error:", err);
    return NextResponse.json(
      { error: "Unable to process your request. Please try again later." },
      { status: 500 }
    );
  }
}
