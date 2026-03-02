import { NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";
import { sendSetupCredentialsEmail } from "@/lib/email";

export async function POST() {
  try {
    // Check if a super_admin already exists in Firestore
    const existing = await adminDb
      .collection("users")
      .where("role", "==", "super_admin")
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "Platform already initialized. A super admin exists." },
        { status: 403 }
      );
    }

    const email = "magu@stemimpactcenterkenya.org";
    const displayName = "Alex Magu";
    const tempPassword = crypto.randomBytes(6).toString("base64url");

    let uid: string;
    let passwordReset = false;

    try {
      // Check if user already exists in Firebase Auth
      const existingUser = await adminAuth.getUserByEmail(email);
      uid = existingUser.uid;
      // Update the password so we can provide login credentials
      await adminAuth.updateUser(uid, { password: tempPassword, displayName });
      passwordReset = true;
    } catch {
      // User doesn't exist — create new Auth user
      const userRecord = await adminAuth.createUser({
        email,
        password: tempPassword,
        displayName,
      });
      uid = userRecord.uid;
    }

    // Create Firestore user document
    await adminDb.collection("users").doc(uid).set({
      email,
      displayName,
      role: "super_admin",
      schoolId: null,
      requiresPasswordChange: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Write custom claims so the first login produces a claims-bearing token.
    // Without this the session cookie has no role claim and refreshSession()
    // in the login page can silently sign the user out.
    await setUserClaims(uid, { role: "super_admin", schoolId: null });

    // Log the setup activity
    await adminDb.collection("activities").add({
      userId: uid,
      type: "platform_setup",
      description: "Platform initialized — super admin account created",
      timestamp: FieldValue.serverTimestamp(),
    });

    // Send credentials email via Resend
    try {
      await sendSetupCredentialsEmail({ to: email, name: displayName, tempPassword });
    } catch (emailErr) {
      console.error("Failed to send setup credentials email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      email,
      tempPassword,
      uid,
      passwordReset,
      message: passwordReset
        ? "Existing account promoted to super admin with new password."
        : "Super admin created. Please log in and change your password.",
    });
  } catch (err: unknown) {
    console.error("Admin setup error:", err);
    const message = err instanceof Error ? err.message : "Failed to create admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const existing = await adminDb
      .collection("users")
      .where("role", "==", "super_admin")
      .limit(1)
      .get();

    return NextResponse.json({ initialized: !existing.empty });
  } catch (err: unknown) {
    console.error("Admin setup check error:", err);
    const message = err instanceof Error ? err.message : "Failed to check setup status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
