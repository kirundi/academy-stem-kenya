import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasRole } from "@/lib/api-auth";
import { validateCsrf } from "@/lib/csrf";

/**
 * PATCH /api/courses/[id]/review
 *
 * Content review workflow endpoint.
 * Allows content_reviewer, admin, and super_admin to approve or reject
 * a course that has been submitted for review (status: "pending_review").
 *
 * Body: { action: "approve" | "reject", feedback?: string }
 *
 * - approve → sets status to "published"
 * - reject  → sets status back to "draft" with reviewer feedback
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasRole(user, ["content_reviewer", "admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: courseId } = await params;

  const body = await request.json();
  const { action, feedback } = body as { action: string; feedback?: string };

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  const courseRef = adminDb.collection("courses").doc(courseId);
  const courseDoc = await courseRef.get();

  if (!courseDoc.exists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "published" : "draft";

  const update: Record<string, unknown> = {
    status: newStatus,
    reviewedBy: user.uid,
    reviewedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (feedback) {
    update.reviewFeedback = feedback;
  }

  await courseRef.update(update);

  return NextResponse.json({ success: true, courseId, status: newStatus });
}

/**
 * GET /api/courses/[id]/review
 *
 * Returns the current review status and feedback for a course.
 * Accessible by the course creator, content_reviewer, admin, super_admin.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;

  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const data = courseDoc.data()!;

  // Only the creator, reviewers, and admins can see review metadata.
  const canView =
    data.createdBy === user.uid ||
    hasRole(user, ["content_reviewer", "admin", "super_admin"]);

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    courseId,
    status: data.status ?? "draft",
    reviewedBy: data.reviewedBy ?? null,
    reviewedAt: data.reviewedAt ?? null,
    reviewFeedback: data.reviewFeedback ?? null,
  });
}
