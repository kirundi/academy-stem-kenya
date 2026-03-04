import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendSchoolDecisionEmail } from "@/lib/email";
import { requirePermission } from "@/lib/api-auth";

/**
 * POST /api/admin/notify-school-decision
 * Body: { schoolId: string, decision: "approved" | "rejected", reason?: string }
 *
 * - Updates the school's status in Firestore
 * - Emails the school admin
 * - Writes a notification to the school admin's notifications collection
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
    const adminUid: string | undefined = schoolData.adminId;

    // Update school status
    const update: Record<string, unknown> = {
      status: decision === "approved" ? "active" : "rejected",
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (decision === "rejected" && reason) {
      update.rejectionReason = reason;
    }
    await schoolRef.update(update);

    // Notify the school admin via Firestore notification
    if (adminUid) {
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

      // Send email to school admin
      const adminSnap = await adminDb.collection("users").doc(adminUid).get();
      const adminEmail: string | undefined = adminSnap.data()?.email;
      const adminName: string | undefined = adminSnap.data()?.displayName;

      if (adminEmail) {
        await sendSchoolDecisionEmail(
          adminEmail,
          schoolName,
          adminName ?? "Administrator",
          decision,
          reason
        );
      }
    }

    return NextResponse.json({ status: "ok", decision });
  } catch (err) {
    console.error("notify-school-decision error:", err);
    return NextResponse.json({ error: "Failed to process decision" }, { status: 500 });
  }
}
