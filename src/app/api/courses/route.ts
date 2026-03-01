import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasRole } from "@/lib/api-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Global admins see all courses; others see their school's + platform courses
  if (hasRole(user, ["admin", "super_admin"])) {
    const snap = await adminDb.collection("courses").get();
    const courses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json(courses);
  }

  // School-scoped: own school courses + platform courses (schoolId == null)
  const schoolId = user.schoolId;
  const [schoolSnap, platformSnap] = await Promise.all([
    schoolId
      ? adminDb.collection("courses").where("schoolId", "==", schoolId).get()
      : Promise.resolve({ docs: [] }),
    adminDb.collection("courses").where("schoolId", "==", null).get(),
  ]);

  const courses = [
    ...schoolSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ...platformSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  ];

  return NextResponse.json(courses);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins and teachers can create courses
  if (!hasRole(user, ["admin", "super_admin", "teacher"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const docRef = await adminDb.collection("courses").add({
    ...body,
    createdBy: user.uid,
    schoolId: body.schoolId ?? user.schoolId ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}
