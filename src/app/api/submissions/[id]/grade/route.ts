import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasRole } from "@/lib/api-auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasRole(user, ["teacher", "school_admin", "admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: submissionId } = await params;

  // Fetch the submission to verify ownership
  const submissionDoc = await adminDb.collection("submissions").doc(submissionId).get();
  if (!submissionDoc.exists) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const submission = submissionDoc.data()!;

  // Teachers must own the classroom; school_admins must be in the same school
  if (hasRole(user, ["teacher"])) {
    const classroomDoc = await adminDb.collection("classrooms").doc(submission.classroomId).get();
    if (!classroomDoc.exists || classroomDoc.data()!.teacherId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (hasRole(user, ["school_admin"])) {
    const classroomDoc = await adminDb.collection("classrooms").doc(submission.classroomId).get();
    if (!classroomDoc.exists || classroomDoc.data()!.schoolId !== user.schoolId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await request.json();
  const { grade, score, feedback, rubricScores } = body;

  await adminDb
    .collection("submissions")
    .doc(submissionId)
    .update({
      status: "graded",
      grade,
      score,
      feedback,
      rubricScores: rubricScores || {},
      gradedBy: user.uid,
      gradedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ status: "graded" });
}
