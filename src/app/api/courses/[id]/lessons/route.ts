import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasRole } from "@/lib/api-auth";

/**
 * Verify the user can access the given course.
 * - Global admins: always allowed
 * - Others: course must be a platform course (schoolId=null) or belong to user's school
 */
async function canAccessCourse(user: { role: string; schoolId: string | null }, courseId: string) {
  if (hasRole(user as Parameters<typeof hasRole>[0], ["editor", "admin", "super_admin"])) return true;

  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) return false;

  const courseSchoolId = courseDoc.data()!.schoolId;
  return courseSchoolId === null || courseSchoolId === user.schoolId;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;

  if (!(await canAccessCourse(user, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .orderBy("order")
    .get();

  const lessons = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(lessons);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admins, editors, and teachers can create lessons
  if (!hasRole(user, ["editor", "admin", "super_admin", "teacher"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: courseId } = await params;

  if (!(await canAccessCourse(user, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
