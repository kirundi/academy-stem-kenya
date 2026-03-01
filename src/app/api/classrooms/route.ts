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
  const teacherId = searchParams.get("teacherId");
  const schoolId = searchParams.get("schoolId");

  let ref = adminDb.collection("classrooms") as FirebaseFirestore.Query;

  if (teacherId) {
    ref = ref.where("teacherId", "==", teacherId);
  }
  if (schoolId) {
    ref = ref.where("schoolId", "==", schoolId);
  }

  const snap = await ref.get();
  const classrooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(classrooms);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, subject, grade, schoolId, capacity, courseIds } = body;

  // Generate a unique 6-char join code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const docRef = await adminDb.collection("classrooms").add({
    name,
    subject: subject || "",
    grade: grade || "",
    joinCode,
    schoolId: schoolId || "",
    teacherId: user.uid,
    teacherName: user.name || "",
    enrolled: 0,
    capacity: capacity || 30,
    avgProgress: 0,
    courseIds: courseIds || [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id, joinCode }, { status: 201 });
}
