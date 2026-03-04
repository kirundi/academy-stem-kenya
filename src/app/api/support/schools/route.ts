import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser, hasRole } from "@/lib/api-auth";

/**
 * GET /api/support/schools?q=query
 *
 * Search schools by name prefix.
 * Accessible by support, admin, super_admin only.
 * Returns up to 20 matching school records.
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

  const snap = await adminDb
    .collection("schools")
    .where("name", ">=", q)
    .where("name", "<=", q + "\uf8ff")
    .limit(20)
    .get();

  const results = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      email: d.email ?? null,
      phone: d.phone ?? null,
      status: d.status ?? "pending",
      county: d.county ?? null,
      createdAt: d.createdAt ?? null,
    };
  });

  return NextResponse.json(results);
}
