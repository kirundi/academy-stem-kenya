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

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const schoolId = searchParams.get("schoolId");

  let ref = adminDb.collection("users") as FirebaseFirestore.Query;

  if (role) ref = ref.where("role", "==", role);
  if (schoolId) ref = ref.where("schoolId", "==", schoolId);

  const snap = await ref.get();
  const users = snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, password: undefined };
  });

  return NextResponse.json(users);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { userId, ...updates } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await adminDb
    .collection("users")
    .doc(userId)
    .update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ status: "updated" });
}
