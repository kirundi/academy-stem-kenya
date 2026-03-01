import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/types";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: UserRole;
  schoolId: string | null;
}

/**
 * Verifies the session cookie and fetches the user's Firestore profile.
 * Returns null if unauthenticated.
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: data.role as UserRole,
      schoolId: data.schoolId ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if the user has one of the required roles.
 */
export function hasRole(user: AuthenticatedUser, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}
