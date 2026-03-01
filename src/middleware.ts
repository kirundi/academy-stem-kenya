import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register/teacher", "/onboarding", "/admin/setup", "/forgot-password", "/reset-password"];

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/course-creator/:path*",
  ],
};
