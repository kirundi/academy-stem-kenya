import { NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";
import { getAuthUser, hasRole } from "@/lib/api-auth";

/**
 * One-time endpoint to backfill custom claims for all existing users
 * that have a Firestore profile but no claims set yet.
 * Requires super_admin role.
 */
export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(user, ["super_admin"])) {
    return NextResponse.json({ error: "Forbidden — super_admin only" }, { status: 403 });
  }

  const usersSnap = await adminDb.collection("users").get();
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (!data.role) {
      skipped++;
      continue;
    }

    try {
      // Check if this Firestore doc ID corresponds to a Firebase Auth user
      await adminAuth.getUser(doc.id);
      await setUserClaims(doc.id, {
        role: data.role,
        schoolId: data.schoolId ?? null,
      });
      updated++;
    } catch {
      // User may not have a Firebase Auth account (e.g. Google Classroom sync students)
      skipped++;
    }
  }

  return NextResponse.json({ updated, skipped, errors });
}
