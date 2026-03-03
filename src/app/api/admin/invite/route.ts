import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import { sendInviteTokenEmail } from "@/lib/email";
import { requirePermission, hasPermission } from "@/lib/api-auth";

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://academy.stemimpactcenterkenya.org";

export async function POST(request: NextRequest) {
  const caller = await requirePermission("invite_users");
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized — invite permission required" }, { status: 403 });
  }

  const body = await request.json();
  const { email, displayName, role, schoolId, permissions: invitePermissions, schoolIds: inviteSchoolIds } = body;

  if (!email || !displayName || !role) {
    return NextResponse.json(
      { error: "email, displayName, and role are required" },
      { status: 400 }
    );
  }

  // Permission tiers: super_admin can invite anyone; admin can only invite teacher/school_admin.
  const callerRole = caller.role;
  const allowedRoles =
    callerRole === "super_admin"
      ? ["admin", "school_admin", "teacher"]
      : ["school_admin", "teacher"];

  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: `You don't have permission to create ${role} accounts` },
      { status: 403 }
    );
  }

  // Cannot grant permissions the caller themselves don't have
  if (invitePermissions && Array.isArray(invitePermissions)) {
    for (const p of invitePermissions) {
      if (!hasPermission(caller, p)) {
        return NextResponse.json(
          { error: `Cannot grant permission you don't have: ${p}` },
          { status: 403 }
        );
      }
    }
  }

  // Check for an existing pending invite to avoid duplicates.
  const existingSnap = await adminDb
    .collection("invites")
    .where("email", "==", email)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    return NextResponse.json(
      { error: "A pending invite already exists for this email address." },
      { status: 409 }
    );
  }

  // Generate a cryptographically secure token.
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  try {
    // Store the invite record (keyed by token hash — plaintext never stored).
    const inviteDoc: Record<string, unknown> = {
      email,
      displayName,
      role,
      schoolId: schoolId || null,
      invitedBy: caller.uid,
      invitedByName: caller.displayName ?? "Administrator",
      invitedAt: FieldValue.serverTimestamp(),
      expiresAt,
      status: "pending",
    };
    if (invitePermissions) inviteDoc.permissions = invitePermissions;
    if (inviteSchoolIds) inviteDoc.schoolIds = inviteSchoolIds;
    await adminDb.collection("invites").doc(tokenHash).set(inviteDoc);

    // Log the activity.
    await adminDb.collection("activities").add({
      userId: caller.uid,
      type: "admin_invite",
      description: `Sent invite to ${displayName} (${email}) for role: ${role}`,
      timestamp: FieldValue.serverTimestamp(),
    });

    const inviteLink = `${PLATFORM_URL}/accept-invite?token=${token}`;

    // Send invite email with the link (no password in email).
    try {
      await sendInviteTokenEmail({
        to: email,
        name: displayName,
        role,
        inviteLink,
        inviterName: caller.displayName ?? "Administrator",
      });
    } catch (emailErr) {
      console.error("Failed to send invite email:", emailErr);
      // Non-fatal — admin can share the link manually.
    }

    return NextResponse.json({
      success: true,
      email,
      role,
      inviteLink,
      message: `Invite sent to ${email}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create invite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const caller = await requirePermission("manage_users");
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized — manage_users permission required" }, { status: 403 });
  }

  const snap = await adminDb
    .collection("users")
    .where("role", "in", ["super_admin", "admin", "school_admin"])
    .get();

  const admins = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(admins);
}
