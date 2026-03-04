import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const status = searchParams.get("status");
  const classroomId = searchParams.get("classroomId");

  let ref = adminDb.collection("submissions") as FirebaseFirestore.Query;

  if (user.role === "student") {
    // Students can only see their own submissions
    ref = ref.where("studentId", "==", user.uid);
    if (status) ref = ref.where("status", "==", status);
  } else if (user.role === "teacher" || user.role === "school_admin") {
    // School staff must scope to a classroom they own
    if (!classroomId) {
      return NextResponse.json({ error: "classroomId required for school staff" }, { status: 400 });
    }
    // Verify the classroom belongs to this user's school
    const clsSnap = await adminDb.collection("classrooms").doc(classroomId).get();
    if (!clsSnap.exists) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }
    if (clsSnap.data()?.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    ref = ref.where("classroomId", "==", classroomId);
    if (studentId) ref = ref.where("studentId", "==", studentId);
    if (status) ref = ref.where("status", "==", status);
  } else {
    // admin / super_admin — unrestricted
    if (studentId) ref = ref.where("studentId", "==", studentId);
    if (status) ref = ref.where("status", "==", status);
    if (classroomId) ref = ref.where("classroomId", "==", classroomId);
  }

  ref = ref.orderBy("submittedAt", "desc").limit(50);

  const snap = await ref.get();
  const submissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(submissions);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only students can create submissions
  if (user.role !== "student") {
    return NextResponse.json({ error: "Only students can submit work" }, { status: 403 });
  }

  const body = await request.json();

  const docRef = await adminDb.collection("submissions").add({
    studentId: user.uid,
    courseId: body.courseId,
    lessonId: body.lessonId,
    classroomId: body.classroomId || "",
    ...(body.challengeId ? { challengeId: body.challengeId } : {}),
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
