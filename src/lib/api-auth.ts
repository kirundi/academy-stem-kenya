import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/types";
import type { Permission } from "@/lib/permissions";
import { resolvePermissions } from "@/lib/permissions";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  /** Secondary roles granted in addition to the primary role. */
  additionalRoles: UserRole[];
  schoolId: string | null;
  permissions: Permission[];
  schoolIds: string[] | null;
}

const STAFF_ROLES: UserRole[] = [
  "teacher", "school_admin", "editor",
  "content_reviewer", "analytics_viewer", "support", "observer", "mentor",
  "admin", "super_admin",
];
const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/**
 * Verifies the session cookie and returns the authenticated user.
 * Reads role from custom claims first; falls back to Firestore for
 * users created before claims were backfilled.
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);

    // Prefer custom claims (no Firestore read needed)
    if (decoded.role) {
      const role = decoded.role as UserRole;
      return {
        uid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name as string | undefined,
        role,
        additionalRoles: ((decoded.additionalRoles as string[] | undefined) ?? []) as UserRole[],
        schoolId: (decoded.schoolId as string) ?? null,
        permissions: (decoded.permissions as Permission[]) ?? resolvePermissions(role),
        schoolIds: (decoded.schoolIds as string[] | undefined) ?? null,
      };
    }

    // Fallback: read from Firestore (pre-backfill users)
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    const role = data.role as UserRole;
    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: data.displayName ?? undefined,
      role,
      additionalRoles: (data.additionalRoles ?? []) as UserRole[],
      schoolId: data.schoolId ?? null,
      permissions: resolvePermissions(role, data.permissions),
      schoolIds: data.schoolIds ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if the user has one of the required roles.
 * Checks both the primary role and any additional roles granted by an admin.
 */
export function hasRole(user: AuthenticatedUser, roles: UserRole[]): boolean {
  return roles.includes(user.role) ||
    (user.additionalRoles ?? []).some((r) => roles.includes(r));
}

/**
 * Checks if the user has a specific permission.
 * super_admin always returns true.
 */
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  if (user.role === "super_admin") return true;
  return user.permissions.includes(permission);
}

/**
 * Checks if the user has ANY of the specified permissions.
 */
export function hasAnyPermission(user: AuthenticatedUser, permissions: Permission[]): boolean {
  if (user.role === "super_admin") return true;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Checks if the user can manage a specific school.
 */
export function canManageSchool(user: AuthenticatedUser, schoolId: string): boolean {
  if (user.role === "super_admin") return true;
  // Global admin with no school restrictions
  if (user.role === "admin" && user.schoolIds === null) return true;
  // School-scoped admin: check the list
  if (user.schoolIds) return user.schoolIds.includes(schoolId);
  // school_admin/teacher: check their primary school
  return user.schoolId === schoolId;
}

/**
 * Returns the authenticated user if they are staff (teacher, school_admin, admin, super_admin).
 */
export async function requireStaff(): Promise<AuthenticatedUser | null> {
  const user = await getAuthUser();
  if (!user || !hasRole(user, STAFF_ROLES)) return null;
  return user;
}

/**
 * Returns the authenticated user if they are an admin (admin, super_admin).
 */
export async function requireAdmin(): Promise<AuthenticatedUser | null> {
  const user = await getAuthUser();
  if (!user || !hasRole(user, ADMIN_ROLES)) return null;
  return user;
}

/**
 * Returns the authenticated user if they have a specific permission.
 */
export async function requirePermission(permission: Permission): Promise<AuthenticatedUser | null> {
  const user = await getAuthUser();
  if (!user || !hasPermission(user, permission)) return null;
  return user;
}
