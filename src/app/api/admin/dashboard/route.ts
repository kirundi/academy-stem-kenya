import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser, hasRole } from "@/lib/api-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(user, ["admin", "super_admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [schoolsSnap, usersSnap, coursesSnap, activitiesSnap] = await Promise.all([
    adminDb.collection("schools").get(),
    adminDb.collection("users").get(),
    adminDb.collection("courses").get(),
    adminDb.collection("activities").orderBy("timestamp", "desc").limit(50).get(),
  ]);

  return NextResponse.json({
    schools: schoolsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    users: usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    courses: coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    activities: activitiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}
