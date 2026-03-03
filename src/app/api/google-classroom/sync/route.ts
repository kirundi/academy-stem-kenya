import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateClassroomJoinCode } from "@/lib/student-code";
import { requirePermission } from "@/lib/api-auth";
import { createStudentUser } from "@/lib/create-student";

export async function POST(request: NextRequest) {
  const teacher = await requirePermission("sync_google");
  if (!teacher) {
    return NextResponse.json(
      { error: "Unauthorized — sync_google permission required" },
      { status: 403 }
    );
  }

  const { accessToken } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: "Google access token required" }, { status: 400 });
  }

  try {
    // Fetch Google Classroom courses
    const coursesRes = await fetch(
      "https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!coursesRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Google Classroom courses" },
        { status: coursesRes.status }
      );
    }

    const coursesData = await coursesRes.json();
    const gCourses = coursesData.courses || [];

    const synced: {
      name: string;
      classroomId: string;
      studentsAdded?: number;
      students?: { displayName: string; email: string; studentCode: string }[];
    }[] = [];
    const errors: string[] = [];

    for (const gc of gCourses) {
      // Check if classroom already exists for this Google course
      const existing = await adminDb
        .collection("classrooms")
        .where("googleClassroomId", "==", gc.id)
        .get();

      let classroomId: string;
      let courseIds: string[] = [];

      if (existing.empty) {
        // Create new classroom
        const ref = await adminDb.collection("classrooms").add({
          name: gc.name,
          subject: gc.section || "",
          grade: "",
          joinCode: generateClassroomJoinCode(),
          schoolId: teacher.schoolId || "",
          teacherId: teacher.uid,
          teacherName: teacher.displayName || "",
          enrolled: 0,
          capacity: 30,
          avgProgress: 0,
          courseIds: [],
          googleClassroomId: gc.id,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        classroomId = ref.id;
      } else {
        classroomId = existing.docs[0].id;
        courseIds = existing.docs[0].data().courseIds || [];
      }

      // Fetch students from this Google Classroom course
      const studentsRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${gc.id}/students`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!studentsRes.ok) {
        synced.push({ name: gc.name, classroomId });
        continue;
      }

      const studentsData = await studentsRes.json();
      const gStudents = studentsData.students || [];
      let newEnrollments = 0;
      const newStudents: { displayName: string; email: string; studentCode: string }[] = [];

      for (const gs of gStudents) {
        try {
          const profile = gs.profile;
          const email = profile?.emailAddress;
          const displayName = profile?.name?.fullName || email || "Student";

          if (!email) continue;

          // Check if student already exists by email
          const userSnap = await adminDb.collection("users").where("email", "==", email).get();

          let studentUid: string;

          if (userSnap.empty) {
            const { uid, studentCode } = await createStudentUser({
              displayName,
              email,
              schoolId: teacher.schoolId,
              classroomId,
              createdBy: teacher.uid,
              googleId: profile.id || null,
            });
            studentUid = uid;
            newStudents.push({ displayName, email, studentCode });
          } else {
            // Student exists — add this classroom if not already linked
            const existingDoc = userSnap.docs[0];
            studentUid = existingDoc.id;
            const existingClassrooms: string[] = existingDoc.data().classroomIds || [];
            if (!existingClassrooms.includes(classroomId)) {
              await existingDoc.ref.update({
                classroomIds: FieldValue.arrayUnion(classroomId),
                updatedAt: FieldValue.serverTimestamp(),
              });
            }
          }

          // Create enrollments if they don't already exist
          const enrollmentSnap = await adminDb
            .collection("enrollments")
            .where("studentId", "==", studentUid)
            .where("classroomId", "==", classroomId)
            .limit(1)
            .get();

          if (enrollmentSnap.empty) {
            // Create per-course enrollments in a batch (matching /api/students pattern)
            const batch = adminDb.batch();
            if (courseIds.length > 0) {
              for (const courseId of courseIds) {
                const enrollRef = adminDb.collection("enrollments").doc();
                batch.set(enrollRef, {
                  studentId: studentUid,
                  classroomId,
                  courseId,
                  progress: 0,
                  completedLessons: 0,
                  startedAt: FieldValue.serverTimestamp(),
                });
              }
            } else {
              // No courses assigned yet — create a placeholder enrollment
              const enrollRef = adminDb.collection("enrollments").doc();
              batch.set(enrollRef, {
                studentId: studentUid,
                classroomId,
                courseId: "",
                progress: 0,
                completedLessons: 0,
                startedAt: FieldValue.serverTimestamp(),
              });
            }
            batch.update(adminDb.collection("classrooms").doc(classroomId), {
              enrolled: FieldValue.increment(1),
              updatedAt: FieldValue.serverTimestamp(),
            });
            await batch.commit();
            newEnrollments++;
          }
        } catch (err) {
          const email = gs.profile?.emailAddress || "unknown";
          console.error(`Failed to sync student ${email}:`, err);
          errors.push(email);
        }
      }

      synced.push({
        name: gc.name,
        classroomId,
        studentsAdded: newEnrollments,
        ...(newStudents.length > 0 && { students: newStudents }),
      });
    }

    return NextResponse.json({
      synced,
      count: synced.length,
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    console.error("Google Classroom sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
