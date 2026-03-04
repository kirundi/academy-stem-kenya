import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-auth";

/**
 * DELETE /api/auth/revoke-session
 *
 * Body: { all: true }            → revoke all sessions for the caller
 *       { sessionId: "..." }     → delete a specific session record only
 *
 * Revoking all sessions calls adminAuth.revokeRefreshTokens() which invalidates
 * ALL Firebase credentials for this user (session cookies + ID tokens).
 * The user will be signed out of every device on their next request.
 */
export async function DELETE(request: NextRequest) {
  const caller = await getAuthUser();
  const uid = caller?.uid ?? null;
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { all?: boolean; sessionId?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is allowed — treated as single-session revoke.
  }

  try {
    if (body.all) {
      // Revoke all refresh tokens — every device gets kicked out.
      await adminAuth.revokeRefreshTokens(uid);
      // Delete all session records for this user.
      const snap = await adminDb.collection("sessions").where("uid", "==", uid).get();
      const batch = adminDb.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return NextResponse.json({ status: "all_revoked" });
    }

    if (body.sessionId) {
      const docRef = adminDb.collection("sessions").doc(body.sessionId);
      const snap = await docRef.get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      // Verify ownership before revoking.
      if (snap.data()?.uid !== uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Firebase has no per-session-cookie revocation API — revokeRefreshTokens()
      // invalidates ALL credentials for this user. We revoke all, then delete all
      // session records (they are all now invalid). The user must re-login on every device.
      await adminAuth.revokeRefreshTokens(uid);
      const allSnap = await adminDb.collection("sessions").where("uid", "==", uid).get();
      const batch = adminDb.batch();
      allSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      return NextResponse.json({
        status: "revoked",
        note: "All sessions invalidated — Firebase does not support per-session revocation.",
      });
    }

    return NextResponse.json({ error: "Specify all:true or sessionId" }, { status: 400 });
  } catch (err) {
    console.error("Revoke session error:", err);
    return NextResponse.json({ error: "Failed to revoke session" }, { status: 500 });
  }
}

/**
 * GET /api/auth/revoke-session
 * Returns all active session records for the current user.
 */
export async function GET() {
  const caller = await getAuthUser();
  const uid = caller?.uid ?? null;
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await adminDb
    .collection("sessions")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  const now = new Date();
  const sessions = snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() ?? null,
        lastSeenAt: data.lastSeenAt?.toDate?.()?.toISOString() ?? null,
        ip: data.ip ?? "unknown",
        device: data.device ?? "unknown",
      };
    })
    // Filter out expired sessions (clean up stale docs in the response).
    .filter((s) => !s.expiresAt || new Date(s.expiresAt) > now);

  return NextResponse.json(sessions);
}
