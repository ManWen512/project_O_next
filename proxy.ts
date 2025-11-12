// middleware.ts (root level)
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Define route categories
  const publicRoutes = ["/", "/about", "/contact"];
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/resend-verification"];
  const protectedRoutes = ["/feeds","/friends", "/profile", "/settings"];

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Allow public routes for everyone
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages (login, register, etc.)
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/feeds", request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - api routes (optional, remove 'api' if you want to protect API routes too)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};