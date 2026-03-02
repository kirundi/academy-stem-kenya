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

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const synced = [];

    for (const gc of gCourses) {
      // Check if classroom already exists for this Google course
      const existing = await adminDb
        .collection("classrooms")
        .where("googleClassroomId", "==", gc.id)
        .get();

      let classroomId: string;

      if (existing.empty) {
        // Create new classroom
        const ref = await adminDb.collection("classrooms").add({
          name: gc.name,
          subject: gc.section || "",
          grade: "",
          joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          schoolId: "",
          teacherId: user.uid,
          teacherName: user.name || "",
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
      }

      // Fetch students from this Google Classroom course
      const studentsRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${gc.id}/students`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        const gStudents = studentsData.students || [];

        for (const gs of gStudents) {
          // Check if student user exists by email
          const profile = gs.profile;
          const email = profile?.emailAddress;

          if (email) {
            const userSnap = await adminDb.collection("users").where("email", "==", email).get();

            if (userSnap.empty) {
              // Create student user record
              const studentRef = await adminDb.collection("users").add({
                email,
                displayName: profile.name?.fullName || email,
                role: "student",
                schoolId: "",
                googleId: profile.id,
                xp: 0,
                level: 1,
                badges: [],
                skills: {},
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
              });

              // Create enrollment
              await adminDb.collection("enrollments").add({
                studentId: studentRef.id,
                classroomId,
                courseId: "",
                progress: 0,
                completedLessons: 0,
                startedAt: FieldValue.serverTimestamp(),
              });
            }
          }
        }
      }

      synced.push({ name: gc.name, classroomId });
    }

    return NextResponse.json({ synced, count: synced.length });
  } catch (error) {
    console.error("Google Classroom sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
