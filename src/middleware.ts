import { NextRequest, NextResponse } from "next/server";
import { decodeJWTPayload } from "@/lib/jwt";

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
  "/dashboard": ["admin", "super_admin"],
};

/** Map roles to their default dashboard path. */
const roleDashboardMap: Record<string, string> = {
  student: "/school/student/dashboard",
  teacher: "/school/teacher/dashboard",
  school_admin: "/school/admin",
  admin: "/dashboard",
  super_admin: "/dashboard",
};

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
    // Corrupted cookie — clear it and redirect to login.
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("__session", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Check token expiry.
  const exp = payload.exp as number | undefined;
  if (exp && exp * 1000 < Date.now()) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("__session", "", { maxAge: 0, path: "/" });
    return res;
  }

  const role = payload.role as string | undefined;

  // If claims are missing (pre-backfill user), let them through —
  // page-level auth will handle it via getAuthUser() Firestore fallback.
  if (!role) {
    return NextResponse.next();
  }

  // Enforce role-based route access.
  for (const [prefix, allowedRoles] of Object.entries(routeRoleMap)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!allowedRoles.includes(role)) {
        // Redirect to the correct dashboard for their actual role.
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
  headers.set("x-user-school", (payload.schoolId || "") as string);
  headers.set("x-user-permissions", JSON.stringify(payload.permissions || []));
  headers.set("x-user-school-ids", JSON.stringify(payload.schoolIds ?? null));

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/school/:path*", "/dashboard", "/dashboard/:path*", "/admin/:path*"],
};
