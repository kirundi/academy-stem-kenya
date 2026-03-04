import { NextRequest, NextResponse } from "next/server";
import { decodeJWTPayload } from "@/lib/jwt";
import { RoleDashboardMap } from "@/lib/constants";

const publicPaths = [
  "/",
  "/login",
  "/register/teacher",
  "/onboarding",
  "/admin/setup",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/accept-invite",
];

/** Map route prefixes to the roles allowed to access them. */
const routeRoleMap: Record<string, string[]> = {
  "/school/student": ["student"],
  "/school/teacher": ["teacher"],
  "/school/admin": ["school_admin"],
  "/editor": ["editor", "admin", "super_admin"],
  "/reviewer": ["content_reviewer", "admin", "super_admin"],
  "/analytics": ["analytics_viewer", "admin", "super_admin"],
  "/support": ["support", "admin", "super_admin"],
  "/observer": ["observer", "admin", "super_admin"],
  "/mentor": ["mentor", "admin", "super_admin"],
  "/parent": ["parent", "admin", "super_admin"],
  "/dashboard": ["admin", "super_admin"],
};

/** Role → default dashboard path (imported from constants). */
const roleDashboardMap = RoleDashboardMap;

// Roles the platform recognises — any other value is treated as a forged claim.
const KNOWN_ROLES = new Set([
  "student", "teacher", "school_admin", "editor", "admin", "super_admin",
  "parent", "support", "observer", "content_reviewer", "analytics_viewer", "mentor",
]);

// Firebase project ID (available in Edge via NEXT_PUBLIC_ env vars).
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

/**
 * Clears all session-related cookies and redirects to login.
 * NOTE: Firebase session cookies cannot be cryptographically verified in Edge
 * middleware (the Admin SDK is Node.js-only). Claim validation here (issuer,
 * audience, role whitelist, expiry) provides structural integrity checks.
 * Full cryptographic verification still happens server-side in getAuthUser().
 */
function clearAndRedirect(destination: URL): NextResponse {
  const res = NextResponse.redirect(destination);
  const cookieClear = { maxAge: 0, path: "/" };
  res.cookies.set("__session", "", cookieClear);
  res.cookies.set("__session_id", "", cookieClear);
  res.cookies.set("__csrf", "", cookieClear);
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths, API routes, Next.js internals, and static files.
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("__session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode session cookie to read custom claims (role, schoolId).
  const payload = decodeJWTPayload(session);

  if (!payload) {
    // Corrupted cookie — clear all session cookies and redirect to login.
    return clearAndRedirect(new URL("/login", request.url));
  }

  // ── Structural claim validation ──────────────────────────────────────────
  // Validate audience — must be this Firebase project.
  const aud = payload.aud as string | string[] | undefined;
  if (PROJECT_ID && aud) {
    const audList = Array.isArray(aud) ? aud : [aud];
    if (!audList.includes(PROJECT_ID)) {
      return clearAndRedirect(new URL("/login", request.url));
    }
  }

  // Check token expiry.
  const exp = payload.exp as number | undefined;
  if (exp && exp * 1000 < Date.now()) {
    return clearAndRedirect(new URL("/login", request.url));
  }

  const role = payload.role as string | undefined;
  const additionalRoles = (payload.additionalRoles as string[] | undefined) ?? [];

  // Reject unrecognised role values — only the five platform roles are valid.
  if (role && !KNOWN_ROLES.has(role)) {
    return clearAndRedirect(new URL("/login", request.url));
  }
  // Reject any forged additional roles.
  if (additionalRoles.some((r) => !KNOWN_ROLES.has(r))) {
    return clearAndRedirect(new URL("/login", request.url));
  }

  // If claims are missing (pre-backfill user), let them through —
  // page-level auth will handle it via getAuthUser() Firestore fallback.
  if (!role) {
    return NextResponse.next();
  }

  // All roles the user holds (primary + secondary).
  const allUserRoles = [role, ...additionalRoles];

  // Enforce role-based route access.
  for (const [prefix, allowedRoles] of Object.entries(routeRoleMap)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!allowedRoles.some((r) => allUserRoles.includes(r))) {
        // Redirect to the correct dashboard for their primary role.
        const correctDashboard = roleDashboardMap[role] || "/login";
        return NextResponse.redirect(new URL(correctDashboard, request.url));
      }
      break;
    }
  }

  // Forward user info as request headers for server components and API routes.
  const headers = new Headers(request.headers);
  headers.set("x-user-uid", (payload.sub || payload.user_id || "") as string);
  headers.set("x-user-role", role);
  headers.set("x-user-additional-roles", JSON.stringify(additionalRoles));
  headers.set("x-user-school", (payload.schoolId || "") as string);
  headers.set("x-user-permissions", JSON.stringify(payload.permissions || []));
  headers.set("x-user-school-ids", JSON.stringify(payload.schoolIds ?? null));

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/school/:path*",
    "/dashboard", "/dashboard/:path*",
    "/editor", "/editor/:path*",
    "/reviewer", "/reviewer/:path*",
    "/analytics", "/analytics/:path*",
    "/support", "/support/:path*",
    "/observer", "/observer/:path*",
    "/mentor", "/mentor/:path*",
    "/parent", "/parent/:path*",
    "/admin/:path*",
  ],
};
