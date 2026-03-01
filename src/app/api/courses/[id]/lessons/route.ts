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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;
  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .orderBy("order")
    .get();

  const lessons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(lessons);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;
  const body = await request.json();

  const docRef = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .add({
      ...body,
      courseId,
      createdAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
