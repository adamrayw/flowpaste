import { NextResponse, type NextRequest } from "next/server";
import {
  buildAuthLoginUrl,
  buildAuthRegisterUrl,
  raytechSessionCookieName,
} from "@/lib/raytech-account";

const authRoutes = new Set(["/auth/sign-in", "/auth/sign-up"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(raytechSessionCookieName)?.value;
  const isAuthenticated = Boolean(sessionCookie);

  if (pathname.startsWith("/app") && !isAuthenticated) {
    const loginUrl = new URL(buildAuthLoginUrl(request.url));
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/auth/sign-in") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.redirect(new URL(buildAuthLoginUrl(request.url)));
  }

  if (pathname === "/auth/sign-up") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.redirect(new URL(buildAuthRegisterUrl(request.url)));
  }

  if (authRoutes.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/sign-in", "/auth/sign-up"],
};
