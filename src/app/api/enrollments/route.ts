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
  const studentId = searchParams.get("studentId");
  const classroomId = searchParams.get("classroomId");

  let ref = adminDb.collection("enrollments") as FirebaseFirestore.Query;

  if (studentId) {
    ref = ref.where("studentId", "==", studentId);
  }
  if (classroomId) {
    ref = ref.where("classroomId", "==", classroomId);
  }

  const snap = await ref.get();
  const enrollments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(enrollments);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { studentId, classroomId, courseId } = body;

  const docRef = await adminDb.collection("enrollments").add({
    studentId: studentId || user.uid,
    classroomId,
    courseId,
    progress: 0,
    completedLessons: 0,
    startedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
