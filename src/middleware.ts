import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register/teacher", "/onboarding", "/admin/setup", "/forgot-password", "/reset-password"];

/** Decode a JWT payload without verification (lightweight, Edge-safe). */
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

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

  // Allow public routes and API routes
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("__session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decode session cookie to read custom claims (role, schoolId)
  const payload = decodeJWTPayload(session);

  if (!payload) {
    // Corrupted cookie — clear it and redirect to login
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("__session", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Check token expiry
  const exp = payload.exp as number | undefined;
  if (exp && exp * 1000 < Date.now()) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set("__session", "", { maxAge: 0, path: "/" });
    return res;
  }

  const role = payload.role as string | undefined;

  // If claims are missing (pre-backfill user), let them through —
  // page-level auth will handle it via getAuthUser() Firestore fallback
  if (!role) {
    return NextResponse.next();
  }

  // Enforce role-based route access
  for (const [prefix, allowedRoles] of Object.entries(routeRoleMap)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(role)) {
        // Redirect to the correct dashboard for their role
        const correctDashboard = roleDashboardMap[role] || "/login";
        return NextResponse.redirect(new URL(correctDashboard, request.url));
      }
      break;
    }
  }

  // Pass user info as headers for downstream server components/routes
  const headers = new Headers(request.headers);
  headers.set("x-user-uid", (payload.sub || payload.user_id || "") as string);
  headers.set("x-user-role", role);
  headers.set("x-user-school", (payload.schoolId || "") as string);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/school/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
