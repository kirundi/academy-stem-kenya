import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

async function getAuthUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;
  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb.collection("schools").get();
  const schools = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(schools);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
