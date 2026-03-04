import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requirePermission } from "@/lib/api-auth";

/**
 * PATCH /api/classrooms/[id]/courses
 * Body: { courseId: string, action: "add" | "remove" }
 *
 * Adds or removes a course from a classroom's courseIds array.
 * Server-side ownership check ensures only the classroom's teacher
 * (or a same-school admin) can modify it.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requirePermission("manage_classrooms");
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: classroomId } = await params;
  const body = await request.json();
  const { courseId, action } = body as { courseId?: string; action?: "add" | "remove" };

  if (!courseId || !action || !["add", "remove"].includes(action)) {
    return NextResponse.json(
      { error: "courseId and action ('add' | 'remove') are required" },
      { status: 400 }
    );
  }

  const classroomDoc = await adminDb.collection("classrooms").doc(classroomId).get();
  if (!classroomDoc.exists) {
    return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
  }

  const data = classroomDoc.data()!;

  // Authorization: caller must own the classroom or be a same-school admin.
  const isOwner = data.teacherId === caller.uid;
  const isSameSchoolAdmin =
    ["school_admin", "admin", "super_admin"].includes(caller.role) &&
    (data.schoolId === caller.schoolId ||
      caller.role === "super_admin" ||
      (caller.role === "admin" && caller.schoolIds === null) ||
      (caller.schoolIds && caller.schoolIds.includes(data.schoolId)));

  if (!isOwner && !isSameSchoolAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await classroomDoc.ref.update({
    courseIds: action === "add" ? FieldValue.arrayUnion(courseId) : FieldValue.arrayRemove(courseId),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, classroomId, courseId, action });
}
