import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";

/**
 * Sets Firebase custom claims (role, schoolId) on the calling user.
 * Called by client-side auth flows after the Firestore user doc exists.
 * Returns the role so the client can redirect immediately.
 *
 * Uses checkRevoked: true so that if an admin revoked this user's tokens
 * (e.g. after a role change), this endpoint cannot be used to bypass that
 * revocation and silently pick up new claims.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    // checkRevoked: true — throws auth/id-token-revoked if adminAuth.revokeRefreshTokens()
    // was called (e.g. after an admin role change), preventing claim refresh bypass.
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const data = userDoc.data()!;
    const role = data.role as string;
    const schoolId = (data.schoolId as string) ?? null;
    const requiresPasswordChange = (data.requiresPasswordChange as boolean) ?? false;

    await setUserClaims(decoded.uid, {
      role,
      schoolId,
      permissions: data.permissions,
      schoolIds: data.schoolIds ?? null,
      // Previously missing — users with secondary roles lost them after any claims refresh.
      additionalRoles: (data.additionalRoles as string[] | undefined) ?? [],
      requiresPasswordChange,
    });

    return NextResponse.json({ status: "success", role, schoolId, requiresPasswordChange });
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "auth/id-token-revoked") {
      return NextResponse.json(
        { error: "Session has been revoked. Please sign in again." },
        { status: 401 }
      );
    }
    console.error("Set claims error:", error);
    return NextResponse.json({ error: "Failed to set claims" }, { status: 500 });
  }
}
