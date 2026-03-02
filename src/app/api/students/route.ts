import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { generateUniqueStudentCode } from "@/lib/student-code";

async function getCallerProfile(): Promise<{
  uid: string;
  role: string;
  schoolId: string | null;
  [key: string]: unknown;
} | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const data = userDoc.data();
    if (!data) return null;
    if (!["teacher", "school_admin", "admin", "super_admin"].includes(data.role)) {
      return null;
    }
    return {
      uid: decoded.uid,
      role: data.role as string,
      schoolId: (data.schoolId as string) || null,
      ...data,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const caller = await getCallerProfile();
  if (!caller) {
    return NextResponse.json(
      { error: "Unauthorized — teacher or admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { displayName, age, grade, classroomId } = body;

  if (!displayName?.trim()) {
    return NextResponse.json({ error: "Student name is required" }, { status: 400 });
  }
  if (!classroomId) {
    return NextResponse.json({ error: "Classroom ID is required" }, { status: 400 });
  }

  const classroomDoc = await adminDb.collection("classrooms").doc(classroomId).get();
  if (!classroomDoc.exists) {
    return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
  }
  const classroomData = classroomDoc.data()!;

  // Authorization: must own classroom or be school admin
  const isOwner = classroomData.teacherId === caller.uid;
  const isSameSchoolAdmin =
    ["school_admin", "admin", "super_admin"].includes(caller.role) &&
    classroomData.schoolId === caller.schoolId;

  if (!isOwner && !isSameSchoolAdmin) {
    return NextResponse.json(
      { error: "You don't have permission to add students to this classroom" },
      { status: 403 }
    );
  }

  try {
    const studentCode = await generateUniqueStudentCode(adminDb);

    const userRecord = await adminAuth.createUser({
      displayName: displayName.trim(),
    });

    const schoolId = classroomData.schoolId || caller.schoolId || null;

    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email: null,
        displayName: displayName.trim(),
        role: "student",
        schoolId,
        studentCode,
        age: age ? parseInt(age) : null,
        grade: grade || null,
        classroomIds: [classroomId],
        createdBy: caller.uid,
        xp: 0,
        level: 1,
        badges: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Embed role + schoolId in the Firebase Auth token as custom claims
    await setUserClaims(userRecord.uid, { role: "student", schoolId });

    const courseIds: string[] = classroomData.courseIds || [];
    const batch = adminDb.batch();
    for (const courseId of courseIds) {
      const enrollmentRef = adminDb.collection("enrollments").doc();
      batch.set(enrollmentRef, {
        studentId: userRecord.uid,
        classroomId,
        courseId,
        progress: 0,
        completedLessons: 0,
        startedAt: FieldValue.serverTimestamp(),
      });
    }
    batch.update(classroomDoc.ref, {
      enrolled: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        student: {
          uid: userRecord.uid,
          displayName: displayName.trim(),
          studentCode,
          age: age ? parseInt(age) : null,
          grade: grade || null,
          classroomId,
          schoolId,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Error creating student:", err);
    const message = err instanceof Error ? err.message : "Failed to create student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const caller = await getCallerProfile();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classroomId = searchParams.get("classroomId");

  if (!classroomId) {
    return NextResponse.json({ error: "classroomId is required" }, { status: 400 });
  }

  const enrollmentsSnap = await adminDb
    .collection("enrollments")
    .where("classroomId", "==", classroomId)
    .get();

  const studentIds = [...new Set(enrollmentsSnap.docs.map((d) => d.data().studentId))];
  if (studentIds.length === 0) {
    return NextResponse.json({ students: [] });
  }

  const students: {
    id: string;
    displayName: string;
    studentCode: string;
    age: number | null;
    grade: string | null;
    xp: number;
    level: number;
  }[] = [];

  for (let i = 0; i < studentIds.length; i += 10) {
    const batch = studentIds.slice(i, i + 10);
    const usersSnap = await adminDb.collection("users").where("__name__", "in", batch).get();
    for (const doc of usersSnap.docs) {
      const data = doc.data();
      students.push({
        id: doc.id,
        displayName: data.displayName,
        studentCode: data.studentCode || "",
        age: data.age || null,
        grade: data.grade || null,
        xp: data.xp || 0,
        level: data.level || 1,
      });
    }
  }

  return NextResponse.json({ students });
}
