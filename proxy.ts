import { NextResponse, type NextRequest } from "next/server";
import { raytechSessionCookieName, resolveProductReturnTo } from "@/lib/raytech-account";

const authRoutes = new Set(["/auth/sign-in", "/auth/sign-up"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(raytechSessionCookieName)?.value;
  const isAuthenticated = Boolean(sessionCookie);

  if (pathname.startsWith("/app") && !isAuthenticated) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    const returnTo = resolveProductReturnTo(request.url);
    if (returnTo) {
      signInUrl.searchParams.set("returnTo", returnTo);
    }
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/auth/sign-in") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/auth/sign-up") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (authRoutes.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/sign-in", "/auth/sign-up"],
};
