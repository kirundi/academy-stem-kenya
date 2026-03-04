import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasPermission } from "@/lib/api-auth";
import { generateClassroomJoinCode } from "@/lib/student-code";
import { validateCsrf } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  let ref = adminDb.collection("classrooms") as FirebaseFirestore.Query;

  if (user.role === "student") {
    // Students have no list access — they only see their enrolled classrooms via enrollments.
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (user.role === "teacher") {
    // Teachers can only see their own classrooms, regardless of query params.
    ref = ref.where("teacherId", "==", user.uid);
  } else if (user.role === "school_admin") {
    // School admins can only see their own school's classrooms.
    if (!user.schoolId) return NextResponse.json([], { status: 200 });
    ref = ref.where("schoolId", "==", user.schoolId);
  } else if (user.role === "admin" && user.schoolIds !== null) {
    // Scoped admins: filter to their assigned schools.
    if (user.schoolIds && user.schoolIds.length > 0) {
      ref = ref.where("schoolId", "in", user.schoolIds.slice(0, 10));
    } else {
      return NextResponse.json([], { status: 200 });
    }
  } else {
    // super_admin and global admin (schoolIds === null): allow optional query param filtering.
    const teacherId = searchParams.get("teacherId");
    const schoolId = searchParams.get("schoolId");
    if (teacherId) ref = ref.where("teacherId", "==", teacherId);
    if (schoolId) ref = ref.where("schoolId", "==", schoolId);
  }

  const snap = await ref.get();
  const classrooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json(classrooms);
}

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(user, "manage_classrooms")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, subject, grade, schoolId, capacity, courseIds } = body;

  const joinCode = generateClassroomJoinCode();

  const docRef = await adminDb.collection("classrooms").add({
    name,
    subject: subject || "",
    grade: grade || "",
    joinCode,
    schoolId: schoolId || "",
    teacherId: user.uid,
    teacherName: user.displayName || "",
    enrolled: 0,
    capacity: capacity || 30,
    avgProgress: 0,
    courseIds: courseIds || [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id, joinCode }, { status: 201 });
}
