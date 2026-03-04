import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser, hasRole } from "@/lib/api-auth";

/**
 * GET /api/support/users?q=query
 *
 * Search users by email or displayName prefix.
 * Accessible by support, admin, super_admin only.
 * Returns up to 20 matching user records.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasRole(user, ["support", "admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  // Search by email prefix (case-sensitive in Firestore — email is typically lowercase)
  const emailEnd = q + "\uf8ff";
  const [byEmail, byName] = await Promise.all([
    adminDb
      .collection("users")
      .where("email", ">=", q.toLowerCase())
      .where("email", "<=", emailEnd.toLowerCase())
      .limit(10)
      .get(),
    adminDb
      .collection("users")
      .where("displayName", ">=", q)
      .where("displayName", "<=", q + "\uf8ff")
      .limit(10)
      .get(),
  ]);

  // Merge, deduplicate by uid
  const seen = new Set<string>();
  const results: Record<string, unknown>[] = [];
  for (const doc of [...byEmail.docs, ...byName.docs]) {
    if (seen.has(doc.id)) continue;
    seen.add(doc.id);
    const d = doc.data();
    results.push({
      uid: doc.id,
      email: d.email,
      displayName: d.displayName,
      role: d.role,
      schoolId: d.schoolId ?? null,
      createdAt: d.createdAt ?? null,
      requiresPasswordChange: d.requiresPasswordChange ?? false,
    });
  }

  return NextResponse.json(results.slice(0, 20));
}
