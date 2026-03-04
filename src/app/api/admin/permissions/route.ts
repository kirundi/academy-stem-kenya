import { NextRequest, NextResponse } from "next/server";
import { adminDb, setUserClaims } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requirePermission, hasPermission } from "@/lib/api-auth";
import type { Permission } from "@/lib/permissions";
import { ALL_PERMISSIONS, resolvePermissions } from "@/lib/permissions";
import { validateCsrf } from "@/lib/csrf";

/**
 * PUT /api/admin/permissions
 * Body: { userId, permissions?: Permission[], schoolIds?: string[] | null }
 *
 * Updates a user's custom permissions and/or school scope.
 * Requires "manage_users" permission.
 */
export async function PUT(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  const caller = await requirePermission("manage_users");
  if (!caller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, permissions, schoolIds } = body as {
    userId: string;
    permissions?: Permission[];
    schoolIds?: string[] | null;
  };

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Load the target user
  const targetDoc = await adminDb.collection("users").doc(userId).get();
  if (!targetDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const targetData = targetDoc.data()!;
  const targetRole = targetData.role as string;

  // Only super_admin can modify another super_admin or admin
  if ((targetRole === "super_admin" || targetRole === "admin") && caller.role !== "super_admin") {
    return NextResponse.json(
      { error: "Only super_admin can modify admin permissions" },
      { status: 403 }
    );
  }

  // Validate permissions are known values
  if (permissions) {
    for (const p of permissions) {
      if (!ALL_PERMISSIONS.includes(p)) {
        return NextResponse.json({ error: `Unknown permission: ${p}` }, { status: 400 });
      }
    }

    // Cannot grant permissions the caller doesn't have
    for (const p of permissions) {
      if (!hasPermission(caller, p)) {
        return NextResponse.json(
          { error: `Cannot grant permission you don't have: ${p}` },
          { status: 403 }
        );
      }
    }
  }

  // Build the Firestore update
  const update: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (permissions !== undefined) {
    update.permissions = permissions;
  }
  if (schoolIds !== undefined) {
    update.schoolIds = schoolIds;
  }

  await targetDoc.ref.update(update);

  // Refresh custom claims so the change propagates to JWT
  const resolvedPermissions = permissions ?? resolvePermissions(targetRole, targetData.permissions);
  await setUserClaims(userId, {
    role: targetRole,
    schoolId: targetData.schoolId ?? null,
    permissions: resolvedPermissions,
    schoolIds: schoolIds !== undefined ? schoolIds : (targetData.schoolIds ?? null),
  });

  // Log the activity
  await adminDb.collection("activities").add({
    userId: caller.uid,
    type: "permissions_updated",
    description: `Updated permissions for ${targetData.displayName || userId}`,
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ status: "updated", permissions: resolvedPermissions });
}

/**
 * GET /api/admin/permissions?userId=...
 * Returns the effective permissions for a user.
 */
export async function GET(request: NextRequest) {
  const caller = await requirePermission("manage_users");
  if (!caller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query param required" }, { status: 400 });
  }

  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = userDoc.data()!;
  return NextResponse.json({
    role: data.role,
    permissions: resolvePermissions(data.role, data.permissions),
    customized: !!data.permissions,
    schoolIds: data.schoolIds ?? null,
  });
}
