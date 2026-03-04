import { NextRequest, NextResponse } from "next/server";
import { adminDb, setUserClaims } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requirePermission } from "@/lib/api-auth";
import type { UserRole } from "@/lib/types";

// Roles that cannot be granted as secondary roles (must be primary)
const ELEVATED_ROLES: UserRole[] = ["admin", "super_admin"];

// Combinations that conflict (both in the set = problem)
const INCOMPATIBLE_PAIRS: [UserRole, UserRole][] = [
  ["editor", "content_reviewer"],
];

function hasIncompatible(primaryRole: UserRole, additional: UserRole[]): string | null {
  for (const [a, b] of INCOMPATIBLE_PAIRS) {
    const allRoles = [primaryRole, ...additional];
    if (allRoles.includes(a) && allRoles.includes(b)) {
      return `"${a}" and "${b}" cannot be combined — conflict of interest`;
    }
  }
  return null;
}

const KNOWN_ROLES: UserRole[] = [
  "student", "teacher", "school_admin", "editor", "admin", "super_admin",
  "parent", "support", "observer", "content_reviewer", "analytics_viewer", "mentor",
];

/**
 * PATCH /api/admin/users/[uid]/roles
 * Body: { additionalRoles: UserRole[] }
 *
 * Replaces the user's additionalRoles array with the provided list.
 * The primary role is never changed by this endpoint.
 * Requires "manage_users" permission.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const caller = await requirePermission("manage_users");
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { uid } = await params;
  const body = await request.json();
  const { additionalRoles } = body as { additionalRoles: UserRole[] };

  if (!Array.isArray(additionalRoles)) {
    return NextResponse.json({ error: "additionalRoles must be an array" }, { status: 400 });
  }

  // Load target user
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userData = userDoc.data()!;
  const primaryRole = userData.role as UserRole;

  // Caller restrictions: only super_admin can modify admin/super_admin users
  if (
    (primaryRole === "super_admin" || primaryRole === "admin") &&
    caller.role !== "super_admin"
  ) {
    return NextResponse.json({ error: "Only super_admin can modify admin users" }, { status: 403 });
  }

  // Validate each additional role
  for (const r of additionalRoles) {
    if (!KNOWN_ROLES.includes(r)) {
      return NextResponse.json({ error: `Unknown role: "${r}"` }, { status: 400 });
    }
    if (r === primaryRole) {
      return NextResponse.json(
        { error: `"${r}" is already the user's primary role` },
        { status: 400 }
      );
    }
    if (ELEVATED_ROLES.includes(r)) {
      return NextResponse.json(
        { error: `"${r}" cannot be granted as a secondary role — change the primary role instead` },
        { status: 400 }
      );
    }
  }

  // Check for incompatible combinations
  const conflict = hasIncompatible(primaryRole, additionalRoles);
  if (conflict) {
    return NextResponse.json({ error: conflict }, { status: 400 });
  }

  // Write to Firestore
  await userDoc.ref.update({
    additionalRoles: additionalRoles.length > 0 ? additionalRoles : FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Refresh Firebase custom claims
  await setUserClaims(uid, {
    role: primaryRole,
    schoolId: userData.schoolId ?? null,
    permissions: userData.permissions,
    schoolIds: userData.schoolIds ?? null,
    additionalRoles: additionalRoles.length > 0 ? additionalRoles : [],
  });

  // Activity log
  const addedRoles = additionalRoles.filter(
    (r) => !(userData.additionalRoles ?? []).includes(r)
  );
  const removedRoles = (userData.additionalRoles ?? [] as UserRole[]).filter(
    (r: UserRole) => !additionalRoles.includes(r)
  );

  const description = [
    addedRoles.length > 0 ? `Added roles [${addedRoles.join(", ")}]` : "",
    removedRoles.length > 0 ? `Removed roles [${removedRoles.join(", ")}]` : "",
  ]
    .filter(Boolean)
    .join("; ");

  await adminDb.collection("activities").add({
    userId: caller.uid,
    type: "roles_updated",
    description: `${description} for ${userData.displayName || uid}`,
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ primaryRole, additionalRoles });
}

/**
 * GET /api/admin/users/[uid]/roles
 * Returns the current primary + additional roles for a user.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const caller = await requirePermission("manage_users");
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { uid } = await params;
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data = userDoc.data()!;
  return NextResponse.json({
    primaryRole: data.role,
    additionalRoles: data.additionalRoles ?? [],
  });
}
