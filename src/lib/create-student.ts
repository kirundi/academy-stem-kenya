import { adminAuth, adminDb, setUserClaims } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateUniqueStudentCode } from "@/lib/student-code";
import type { UserRole } from "@/lib/types";

export interface CreateStudentParams {
  displayName: string;
  email?: string | null;
  schoolId: string | null;
  classroomId: string;
  createdBy: string;
  age?: number | null;
  grade?: string | null;
  googleId?: string | null;
}

/**
 * Creates a new student: Firebase Auth user, Firestore profile, and custom claims.
 * Does NOT create enrollments — callers handle that since the logic differs.
 */
export async function createStudentUser(params: CreateStudentParams) {
  const studentCode = await generateUniqueStudentCode(adminDb);

  const authUser: { displayName: string; email?: string } = {
    displayName: params.displayName,
  };
  if (params.email) authUser.email = params.email;

  const userRecord = await adminAuth.createUser(authUser);
  const uid = userRecord.uid;
  const schoolId = params.schoolId || null;

  await adminDb.collection("users").doc(uid).set({
    email: params.email || null,
    displayName: params.displayName,
    role: "student" as UserRole,
    schoolId,
    studentCode,
    googleId: params.googleId || null,
    age: params.age ?? null,
    grade: params.grade ?? null,
    classroomIds: [params.classroomId],
    createdBy: params.createdBy,
    xp: 0,
    level: 1,
    badges: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await setUserClaims(uid, { role: "student", schoolId });

  return { uid, studentCode };
}
