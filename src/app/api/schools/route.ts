import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasRole } from "@/lib/api-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only global admins can list all schools
  if (!hasRole(user, ["admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snap = await adminDb.collection("schools").get();
  const schools = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(schools);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasRole(user, ["admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const docRef = await adminDb.collection("schools").add({
    ...body,
    status: body.status || "review",
    plan: body.plan || "community",
    healthScore: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
