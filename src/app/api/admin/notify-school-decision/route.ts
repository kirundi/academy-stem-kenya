import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendSchoolDecisionEmail, sendInviteTokenEmail } from "@/lib/email";
import { requirePermission } from "@/lib/api-auth";
import crypto from "crypto";

const PLATFORM_URL =
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://academy.stemimpactcenterkenya.org";

/**
 * POST /api/admin/notify-school-decision
 * Body: { schoolId: string, decision: "approved" | "rejected", reason?: string }
 *
 * Two flows:
 * 1. New-flow application (adminId === null): approval creates an invite so the school
 *    admin can set their own password. No Firebase Auth account exists yet.
 * 2. Legacy-flow (adminId set): notify the existing user via Firestore + email.
 */
export async function POST(request: NextRequest) {
  const caller = await requirePermission("manage_schools");
  if (!caller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { schoolId, decision, reason } = (await request.json()) as {
    schoolId: string;
    decision: "approved" | "rejected";
    reason?: string;
  };

  if (!schoolId || !decision) {
    return NextResponse.json({ error: "schoolId and decision are required" }, { status: 400 });
  }

  try {
    const schoolRef = adminDb.collection("schools").doc(schoolId);
    const schoolSnap = await schoolRef.get();
    if (!schoolSnap.exists) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolData = schoolSnap.data()!;
    const schoolName: string = schoolData.name ?? "Your school";
    const adminUid: string | null | undefined = schoolData.adminId;

    // Update school status
    const update: Record<string, unknown> = {
      status: decision === "approved" ? "active" : "rejected",
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (decision === "rejected" && reason) {
      update.rejectionReason = reason;
    }
    await schoolRef.update(update);

    if (!adminUid) {
      // ── New-flow: application submitted without a Firebase Auth account ──
      // On approval: create an invite so the school admin can set their own password.
      // On rejection: email the contact address directly.
      const contactEmail: string | undefined = schoolData.contactEmail;
      const contactName: string = schoolData.contactName ?? "School Administrator";

      if (contactEmail) {
        if (decision === "approved") {
          // Check for an existing pending invite to avoid duplicates
          const existingInvite = await adminDb
            .collection("invites")
            .where("email", "==", contactEmail)
            .where("status", "==", "pending")
            .limit(1)
            .get();

          if (existingInvite.empty) {
            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            await adminDb.collection("invites").doc(tokenHash).set({
              email: contactEmail,
              displayName: contactName,
              role: "school_admin",
              schoolId,
              invitedBy: caller.uid,
              invitedByName: caller.displayName ?? "Administrator",
              invitedAt: FieldValue.serverTimestamp(),
              expiresAt,
              status: "pending",
            });

            const inviteLink = `${PLATFORM_URL}/accept-invite?token=${token}`;
            try {
              await sendInviteTokenEmail({
                to: contactEmail,
                name: contactName,
                role: "school_admin",
                inviteLink,
                inviterName: caller.displayName ?? "Administrator",
              });
            } catch (emailErr) {
              console.error("Failed to send school admin invite email:", emailErr);
            }
          }
        } else {
          // Rejected — send a decision email to the contact address
          try {
            await sendSchoolDecisionEmail(
              contactEmail,
              schoolName,
              contactName,
              decision,
              reason
            );
          } catch (emailErr) {
            console.error("Failed to send school rejection email:", emailErr);
          }
        }
      }
    } else {
      // ── Legacy-flow: Firebase Auth account already exists ──
      await adminDb.collection("notifications").add({
        userId: adminUid,
        type: `school_${decision}`,
        schoolId,
        message:
          decision === "approved"
            ? `Your school "${schoolName}" has been approved! You can now access your dashboard.`
            : `Your school application for "${schoolName}" was not approved.${reason ? ` Reason: ${reason}` : ""}`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      const adminSnap = await adminDb.collection("users").doc(adminUid).get();
      const adminEmail: string | undefined = adminSnap.data()?.email;
      const adminName: string | undefined = adminSnap.data()?.displayName;

      if (adminEmail) {
        try {
          await sendSchoolDecisionEmail(
            adminEmail,
            schoolName,
            adminName ?? "Administrator",
            decision,
            reason
          );
        } catch (emailErr) {
          console.error("Failed to send school decision email:", emailErr);
        }
      }
    }

    return NextResponse.json({ status: "ok", decision });
  } catch (err) {
    console.error("notify-school-decision error:", err);
    return NextResponse.json({ error: "Failed to process decision" }, { status: 500 });
  }
}
