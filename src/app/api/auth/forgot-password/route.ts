import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
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
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
