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
  const status = searchParams.get("status");
  const classroomId = searchParams.get("classroomId");

  let ref = adminDb.collection("submissions") as FirebaseFirestore.Query;

  if (studentId) ref = ref.where("studentId", "==", studentId);
  if (status) ref = ref.where("status", "==", status);
  if (classroomId) ref = ref.where("classroomId", "==", classroomId);

  ref = ref.orderBy("submittedAt", "desc").limit(50);

  const snap = await ref.get();
  const submissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(submissions);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const docRef = await adminDb.collection("submissions").add({
    studentId: user.uid,
    courseId: body.courseId,
    lessonId: body.lessonId,
    classroomId: body.classroomId || "",
    status: body.status || "pending",
    grade: null,
    score: null,
    content: body.content || "",
    fileUrl: body.fileUrl || null,
    submittedAt: FieldValue.serverTimestamp(),
    feedback: null,
    rubricScores: {},
    gradedBy: null,
    gradedAt: null,
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
