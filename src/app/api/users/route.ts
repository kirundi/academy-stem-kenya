import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, hasPermission } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const schoolId = searchParams.get("schoolId");

  let ref = adminDb.collection("users") as FirebaseFirestore.Query;

  if (user.role === "student") {
    // Students can only retrieve their own record
    ref = ref.where("__name__", "==", user.uid);
  } else if (user.role === "teacher" || user.role === "school_admin") {
    // School staff are restricted to their own school
    if (!user.schoolId) {
      return NextResponse.json({ error: "No school assigned" }, { status: 403 });
    }
    ref = ref.where("schoolId", "==", user.schoolId);
    if (role) ref = ref.where("role", "==", role);
  } else {
    // admin / super_admin — honour query params, apply school scoping if set
    if (role) ref = ref.where("role", "==", role);
    if (schoolId) {
      ref = ref.where("schoolId", "==", schoolId);
    } else if (user.schoolIds) {
      // Multi-school scoped admin: restrict to their assigned schools
      ref = ref.where("schoolId", "in", user.schoolIds.slice(0, 30));
    }
  }

  const snap = await ref.get();
  const users = snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, password: undefined };
  });

  return NextResponse.json(users);
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { userId, ...updates } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const canManageUsers = hasPermission(user, "manage_users");

  // Users without manage_users can only update their own record
  if (!canManageUsers && user.uid !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Users without manage_users cannot modify protected fields
  const protectedFields = [
    "role",
    "schoolId",
    "createdAt",
    "createdBy",
    "studentCode",
    "permissions",
    "schoolIds",
  ];
  for (const field of protectedFields) {
    if (!canManageUsers && field in updates) {
      return NextResponse.json({ error: `Cannot modify ${field}` }, { status: 403 });
    }
  }

  await adminDb
    .collection("users")
    .doc(userId)
    .update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ status: "updated" });
}
