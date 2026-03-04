import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-auth";

/**
 * GET /api/parent/children
 *
 * Returns the authenticated parent's linked children with their
 * enrollment progress (enriched with course titles), badges, and recent submissions.
 * Access is strictly scoped to the parent's own childIds — a parent
 * can never read another student's data through this endpoint.
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "parent") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch the parent's Firestore doc to get the current childIds list.
  // childIds are stored in Firestore (not claims) because the list can
  // change after account creation without requiring a token refresh.
  const parentDoc = await adminDb.collection("users").doc(user.uid).get();
  if (!parentDoc.exists) {
    return NextResponse.json({ error: "Parent record not found" }, { status: 404 });
  }

  const childIds: string[] = parentDoc.data()?.childIds ?? [];

  if (childIds.length === 0) {
    return NextResponse.json([]);
  }

  // Fetch each child's profile + enrollments + submissions in parallel.
  const results = await Promise.all(
    childIds.map(async (studentId) => {
      const [studentDoc, enrollmentsSnap, submissionsSnap] = await Promise.all([
        adminDb.collection("users").doc(studentId).get(),
        adminDb.collection("enrollments").where("studentId", "==", studentId).get(),
        adminDb
          .collection("submissions")
          .where("studentId", "==", studentId)
          .orderBy("submittedAt", "desc")
          .limit(10)
          .get(),
      ]);

      if (!studentDoc.exists) return null;

      const studentData = studentDoc.data()!;
      // Only expose safe, non-sensitive fields to the parent.
      const student = {
        uid: studentId,
        displayName: studentData.displayName,
        grade: studentData.grade ?? null,
        schoolId: studentData.schoolId ?? null,
        xp: studentData.xp ?? 0,
        level: studentData.level ?? 1,
        badges: studentData.badges ?? [],
      };

      // Enrich enrollments with course titles so the UI doesn't need
      // a second round-trip to look them up.
      const enrollmentDocs = enrollmentsSnap.docs;
      const courseIds = [...new Set(enrollmentDocs.map((d) => d.data().courseId as string))];
      const courseDocs =
        courseIds.length > 0
          ? await Promise.all(courseIds.map((id) => adminDb.collection("courses").doc(id).get()))
          : [];
      const courseMap: Record<string, string> = {};
      for (const doc of courseDocs) {
        if (doc.exists) courseMap[doc.id] = (doc.data()!.title as string) ?? "Untitled Course";
      }

      const enrollments = enrollmentDocs.map((d) => ({
        id: d.id,
        courseId: d.data().courseId,
        courseTitle: courseMap[d.data().courseId] ?? "Unknown Course",
        progress: d.data().progress ?? 0,
        completedLessons: d.data().completedLessons ?? 0,
        startedAt: d.data().startedAt ?? null,
      }));

      const submissions = submissionsSnap.docs.map((d) => ({
        id: d.id,
        courseId: d.data().courseId,
        lessonId: d.data().lessonId,
        status: d.data().status,
        grade: d.data().grade ?? null,
        score: d.data().score ?? null,
        feedback: d.data().feedback ?? null,
        submittedAt: d.data().submittedAt ?? null,
      }));

      return { student, enrollments, submissions };
    })
  );

  return NextResponse.json(results.filter(Boolean));
}
