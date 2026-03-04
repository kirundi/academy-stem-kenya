import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser, hasRole } from "@/lib/api-auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(user, ["admin", "super_admin", "analytics_viewer"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // super_admin and global admin (schoolIds === null) see all data.
  // Scoped admin/analytics_viewer (schoolIds is a non-empty array) sees only their assigned schools.
  const isScopedAdmin =
    ["admin", "analytics_viewer"].includes(user.role) &&
    user.schoolIds !== null &&
    user.schoolIds.length > 0;
  const scopedIds = isScopedAdmin ? user.schoolIds! : null;

  // Build scoped or unscoped queries.
  const schoolsQuery = scopedIds
    ? adminDb.collection("schools").where("__name__", "in", scopedIds.slice(0, 10))
    : adminDb.collection("schools");

  const usersQuery = scopedIds
    ? adminDb.collection("users").where("schoolId", "in", scopedIds.slice(0, 10))
    : adminDb.collection("users");

  const coursesQuery = scopedIds
    ? adminDb.collection("courses").where("schoolId", "in", scopedIds.slice(0, 10))
    : adminDb.collection("courses");

  const activitiesQuery = scopedIds
    ? adminDb
        .collection("activities")
        .where("schoolId", "in", scopedIds.slice(0, 10))
        .orderBy("timestamp", "desc")
        .limit(50)
    : adminDb.collection("activities").orderBy("timestamp", "desc").limit(50);

  const [schoolsSnap, usersSnap, coursesSnap, activitiesSnap] = await Promise.all([
    schoolsQuery.get(),
    usersQuery.get(),
    coursesQuery.get(),
    activitiesQuery.get(),
  ]);

  return NextResponse.json({
    schools: schoolsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    users: usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    courses: coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    activities: activitiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}
