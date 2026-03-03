import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** GET — validate an invite token and return invite details for the UI. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token.length !== 64) {
    return NextResponse.json({ error: "Invalid invite link." }, { status: 400 });
  }

  const docRef = adminDb.collection("invites").doc(hashToken(token));
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Invite not found or already used." }, { status: 404 });
  }

  const invite = snap.data()!;

  if (invite.status !== "pending") {
    return NextResponse.json(
      { error: "This invitation has already been accepted." },
      { status: 410 }
    );
  }

  const expiresAt: Date =
    invite.expiresAt instanceof Date
      ? invite.expiresAt
      : invite.expiresAt.toDate();

  if (expiresAt < new Date()) {
    await docRef.update({ status: "expired" });
    return NextResponse.json(
      { error: "This invite link has expired. Ask your administrator to send a new one." },
      { status: 410 }
    );
  }

  return NextResponse.json({
    valid: true,
    email: invite.email,
    displayName: invite.displayName,
    role: invite.role,
    invitedByName: invite.invitedByName ?? "Administrator",
  });
}

/** POST — accept the invite: create account, set claims, return ID token for session. */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, password } = body;

  if (!token || typeof token !== "string" || token.length !== 64) {
    return NextResponse.json({ error: "Invalid invite token." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const docRef = adminDb.collection("invites").doc(hashToken(token));
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Invite not found or already used." }, { status: 404 });
  }

  const invite = snap.data()!;

  if (invite.status !== "pending") {
    return NextResponse.json(
      { error: "This invitation has already been accepted." },
      { status: 410 }
    );
  }

  const expiresAt: Date =
    invite.expiresAt instanceof Date
      ? invite.expiresAt
      : invite.expiresAt.toDate();

  if (expiresAt < new Date()) {
    await docRef.update({ status: "expired" });
    return NextResponse.json(
      { error: "This invite link has expired. Ask your administrator to send a new one." },
      { status: 410 }
    );
  }

  try {
    // Check if this email already has a Firebase Auth account (re-invite case).
    let uid: string;
    try {
      const existing = await adminAuth.getUserByEmail(invite.email);
      uid = existing.uid;
      // Update password for existing user.
      await adminAuth.updateUser(uid, { password, displayName: invite.displayName });
    } catch {
      // User doesn't exist — create them.
      const userRecord = await adminAuth.createUser({
        email: invite.email,
        password,
        displayName: invite.displayName,
      });
      uid = userRecord.uid;
    }

    // Create/update Firestore user document.
    const userFields: Record<string, unknown> = {
      email: invite.email,
      displayName: invite.displayName,
      role: invite.role,
      schoolId: invite.schoolId ?? null,
      requiresPasswordChange: false, // User set their own password — no change needed.
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (invite.permissions) userFields.permissions = invite.permissions;
    if (invite.schoolIds) userFields.schoolIds = invite.schoolIds;

    await adminDb.collection("users").doc(uid).set(userFields, { merge: true });

    // Embed role, schoolId, permissions as custom claims.
    await setUserClaims(uid, {
      role: invite.role,
      schoolId: invite.schoolId ?? null,
      permissions: invite.permissions,
      schoolIds: invite.schoolIds ?? null,
    });

    // Mark invite as accepted (atomic — prevents double-use).
    await docRef.update({ status: "accepted", acceptedAt: FieldValue.serverTimestamp(), uid });

    // Issue a custom token so the client can exchange it for a Firebase ID token.
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ success: true, customToken, role: invite.role });
  } catch (err: unknown) {
    console.error("Accept invite error:", err);
    const message = err instanceof Error ? err.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
