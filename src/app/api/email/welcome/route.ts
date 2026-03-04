import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { requireStaff } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const caller = await requireStaff();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, schoolName, adminName } = await request.json();

    if (!to || !schoolName || !adminName) {
      return NextResponse.json(
        { error: "to, schoolName, and adminName are required" },
        { status: 400 }
      );
    }

    await sendWelcomeEmail({ to, schoolName, adminName });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Welcome email error:", err);
    const message = err instanceof Error ? err.message : "Failed to send welcome email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
