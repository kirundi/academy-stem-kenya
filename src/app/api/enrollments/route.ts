import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasPermission, canManageSchool } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const classroomId = searchParams.get("classroomId");

  let ref = adminDb.collection("enrollments") as FirebaseFirestore.Query;

  if (user.role === "student") {
    // Students can only see their own enrollments
    ref = ref.where("studentId", "==", user.uid);
  } else if (user.role === "teacher" || user.role === "school_admin") {
    if (!user.schoolId) {
      return NextResponse.json({ error: "No school assigned" }, { status: 403 });
    }
    if (classroomId) {
      // Verify the requested classroom belongs to this school
      const clsSnap = await adminDb.collection("classrooms").doc(classroomId).get();
      if (!clsSnap.exists || clsSnap.data()?.schoolId !== user.schoolId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      ref = ref.where("classroomId", "==", classroomId);
    } else {
      // No specific classroom — scope to school via a join through classrooms
      // Return enrollments for all classrooms in this school
      const clsSnap = await adminDb
        .collection("classrooms")
        .where("schoolId", "==", user.schoolId)
        .get();
      const classroomIds = clsSnap.docs.map((d) => d.id);
      if (classroomIds.length === 0) return NextResponse.json([]);
      // Firestore "in" supports up to 30 values
      ref = ref.where("classroomId", "in", classroomIds.slice(0, 30));
    }
    if (studentId) ref = ref.where("studentId", "==", studentId);
  } else {
    // admin / super_admin — unrestricted
    if (studentId) ref = ref.where("studentId", "==", studentId);
    if (classroomId) ref = ref.where("classroomId", "==", classroomId);
  }

  const snap = await ref.get();
  const enrollments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(enrollments);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only users with manage_students permission can enroll students
  if (!hasPermission(user, "manage_students")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { studentId, classroomId, courseId } = body;

  if (!studentId || !classroomId) {
    return NextResponse.json({ error: "studentId and classroomId are required" }, { status: 400 });
  }

  // Non-super_admins can only enroll into classrooms they can manage
  if (user.role !== "super_admin") {
    const clsSnap = await adminDb.collection("classrooms").doc(classroomId).get();
    if (!clsSnap.exists) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }
    const clsSchoolId = clsSnap.data()?.schoolId;
    if (clsSchoolId && !canManageSchool(user, clsSchoolId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const docRef = await adminDb.collection("enrollments").add({
    studentId,
    classroomId,
    courseId,
    progress: 0,
    completedLessons: 0,
    startedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
