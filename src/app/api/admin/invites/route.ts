import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requirePermission } from "@/lib/api-auth";
import { FieldValue } from "firebase-admin/firestore";

/**
 * GET /api/admin/invites
 * Returns all invites ordered by invitedAt desc.
 * Requires manage_users permission.
 */
export async function GET() {
  const caller = await requirePermission("manage_users");
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const snap = await adminDb
    .collection("invites")
    .orderBy("invitedAt", "desc")
    .limit(200)
    .get();

  const now = Date.now();
  const invites = snap.docs.map((doc) => {
    const d = doc.data();
    const expiresAt = d.expiresAt instanceof Date
      ? d.expiresAt
      : d.expiresAt?.toDate?.() ?? null;
    const expired = expiresAt ? expiresAt.getTime() < now : false;

    // Derive effective status
    let status = d.status as string;
    if (status === "pending" && expired) status = "expired";

    return {
      id: doc.id,
      email: d.email,
      displayName: d.displayName,
      role: d.role,
      schoolId: d.schoolId ?? null,
      invitedBy: d.invitedBy,
      invitedByName: d.invitedByName ?? "Administrator",
      invitedAt: d.invitedAt ?? null,
      expiresAt: expiresAt?.toISOString() ?? null,
      status,
    };
  });

  return NextResponse.json(invites);
}

/**
 * DELETE /api/admin/invites
 * Body: { inviteId: string }
 * Revokes (deletes) a pending invite.
 */
export async function DELETE(request: Request) {
  const caller = await requirePermission("manage_users");
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { inviteId } = await request.json();
  if (!inviteId) return NextResponse.json({ error: "inviteId required" }, { status: 400 });

  const ref = adminDb.collection("invites").doc(inviteId);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  await ref.delete();

  await adminDb.collection("activities").add({
    userId: caller.uid,
    type: "invite_revoked",
    description: `Revoked invite for ${doc.data()?.email}`,
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
