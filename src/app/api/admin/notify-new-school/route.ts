import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser } from "@/lib/api-auth";

/**
 * POST /api/admin/notify-new-school
 * Called after a school admin completes onboarding.
 * Writes a notification doc for every global admin / super_admin so the
 * NotificationBell increments immediately.
 */
export async function POST() {
  const caller = await getAuthUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch caller's school details so we can include the name in the notification
    const schoolId = caller.schoolId;
    const schoolName = schoolId
      ? ((await adminDb.collection("schools").doc(schoolId).get()).data()?.name as string | undefined) ?? "A new school"
      : "A new school";

    // Find all platform admins
    const adminSnap = await adminDb
      .collection("users")
      .where("role", "in", ["admin", "super_admin"])
      .get();

    if (adminSnap.empty) {
      return NextResponse.json({ notified: 0 });
    }

    const batch = adminDb.batch();
    for (const adminDoc of adminSnap.docs) {
      const notifRef = adminDb.collection("notifications").doc();
      batch.set(notifRef, {
        uid: adminDoc.id,
        type: "new_school_application",
        schoolId: schoolId ?? null,
        message: `New school application: ${schoolName}`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    return NextResponse.json({ notified: adminSnap.size });
  } catch (err) {
    console.error("notify-new-school error:", err);
    return NextResponse.json({ error: "Failed to notify admins" }, { status: 500 });
  }
}
