import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

/**
 * POST /api/schools/apply
 * Public endpoint — no auth required.
 *
 * Stores a pending school application in Firestore WITHOUT creating a Firebase
 * Auth account. The account is only created when a global admin approves the
 * application and the school admin accepts their invite email.
 *
 * Also cleans up any "dangling" Firebase Auth accounts left behind by the old
 * client-side registration flow (pre-invite system) so they never block a
 * fresh application.
 *
 * Accepts an optional `draftToken` to delete the saved draft on successful submit.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    schoolName, schoolType, location, studentCount,
    fullName, roleDesignation, contactNumber, email,
    draftToken,
  } = body;

  // ── Server-side validation ────────────────────────────────────────────────
  if (!schoolName?.trim()) return NextResponse.json({ error: "School name is required." }, { status: 400 });
  if (!schoolType) return NextResponse.json({ error: "School type is required." }, { status: 400 });
  if (!location?.trim()) return NextResponse.json({ error: "Campus location is required." }, { status: 400 });
  if (!studentCount) return NextResponse.json({ error: "Student count is required." }, { status: 400 });
  if (!fullName?.trim()) return NextResponse.json({ error: "Admin full name is required." }, { status: 400 });
  if (!roleDesignation?.trim()) return NextResponse.json({ error: "Role / designation is required." }, { status: 400 });
  if (!contactNumber?.trim()) return NextResponse.json({ error: "Contact number is required." }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "Email address is required." }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // ── Legacy Firebase Auth cleanup ─────────────────────────────────────────
  // The old onboarding flow called createUserWithEmailAndPassword client-side,
  // which could leave a dangling Firebase Auth account if Firestore writes
  // subsequently failed. Detect and remove those so they don't block re-applies.
  try {
    const existingAuthUser = await adminAuth.getUserByEmail(normalizedEmail);
    const uid = existingAuthUser.uid;

    const userDocSnap = await adminDb.collection("users").doc(uid).get();

    if (!userDocSnap.exists) {
      // Auth account exists but no Firestore user doc — definitely dangling.
      await adminAuth.deleteUser(uid);
    } else {
      const userData = userDocSnap.data()!;
      const schoolId: string | undefined = userData.schoolId;

      if (!schoolId) {
        // User doc exists but has no schoolId — orphaned school_admin account.
        if (userData.role === "school_admin") {
          await adminAuth.deleteUser(uid);
          await userDocSnap.ref.delete();
        } else {
          // Different role (e.g. teacher) — email is legitimately in use.
          return NextResponse.json(
            { error: "An account with this email address already exists." },
            { status: 409 }
          );
        }
      } else {
        const schoolSnap = await adminDb.collection("schools").doc(schoolId).get();

        if (!schoolSnap.exists) {
          // School doc missing — user doc is orphaned.
          await adminAuth.deleteUser(uid);
          await userDocSnap.ref.delete();
        } else {
          const schoolStatus: string = schoolSnap.data()!.status ?? "";
          if (schoolStatus === "rejected") {
            // School was rejected — clean up so they can reapply.
            await adminAuth.deleteUser(uid);
            await userDocSnap.ref.delete();
            await schoolSnap.ref.delete();
          } else {
            // Active, review, or pending school — email is legitimately in use.
            return NextResponse.json(
              { error: "An account with this email address already exists. If your application was rejected, please contact support." },
              { status: 409 }
            );
          }
        }
      }
    }
  } catch (authErr: unknown) {
    // auth/user-not-found is expected for new applicants — all other errors are logged but non-fatal.
    if ((authErr as { code?: string }).code !== "auth/user-not-found") {
      console.error("Legacy Auth cleanup error:", authErr);
    }
  }

  // ── Duplicate pending application check ───────────────────────────────────
  const duplicate = await adminDb
    .collection("schools")
    .where("contactEmail", "==", normalizedEmail)
    .where("status", "in", ["pending", "review"])
    .limit(1)
    .get();

  if (!duplicate.empty) {
    return NextResponse.json(
      { error: "An application with this email address is already under review. Please wait for a decision or contact support." },
      { status: 409 }
    );
  }

  // ── Create the school application record ─────────────────────────────────
  await adminDb.collection("schools").add({
    name: schoolName.trim(),
    type: schoolType,
    location: location.trim(),
    studentCount,
    contactName: fullName.trim(),
    contactEmail: normalizedEmail,
    contactNumber: contactNumber.trim(),
    roleDesignation: roleDesignation.trim(),
    adminId: null,   // set only after invite is accepted
    status: "review",
    plan: "community",
    healthScore: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  // ── Clean up the draft record ─────────────────────────────────────────────
  if (draftToken && typeof draftToken === "string" && draftToken.length === 64) {
    const tokenHash = crypto.createHash("sha256").update(draftToken).digest("hex");
    adminDb
      .collection("school_application_drafts")
      .doc(tokenHash)
      .delete()
      .catch((err) => console.error("Draft cleanup failed:", err));
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
