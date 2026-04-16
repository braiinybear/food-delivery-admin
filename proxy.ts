import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy (Next.js 16) for the admin app.
 * 
 * Checks for the `admin_session_token` cookie that we set on the admin domain
 * after successful sign-in. This is NOT the backend's Better Auth cookie — 
 * that one lives on the backend domain and can't be read here.
 * 
 * Note: This only checks for cookie existence (not validity).
 * Actual session validation happens in the AuthProvider on the client.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session_token");

  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/sign-in", "/sign-up", "/auth/callback"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If user has a session cookie and tries to access auth pages, redirect to dashboard
  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user doesn't have a session cookie and tries to access protected pages
  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next (Next.js internals)
     * - static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
