import { NextResponse, type NextRequest } from "next/server";
import {
  flowpasteAppBaseUrl,
  raytechSessionCookieNames,
  resolveProductReturnTo,
} from "@/lib/raytech-account";

const authRoutes = new Set(["/auth/sign-in", "/auth/sign-up"]);

function buildProductUrl(path: string) {
  return new URL(path, flowpasteAppBaseUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = raytechSessionCookieNames
    .map((cookieName) => request.cookies.get(cookieName)?.value)
    .find(Boolean);
  const isAuthenticated = Boolean(sessionCookie);

  if (pathname.startsWith("/app") && !isAuthenticated) {
    const signInUrl = buildProductUrl("/auth/sign-in");
    const returnTo = resolveProductReturnTo(request.url);
    if (returnTo) {
      signInUrl.searchParams.set("returnTo", returnTo);
    }
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/auth/sign-in") {
    if (isAuthenticated) {
      return NextResponse.redirect(buildProductUrl("/app/dashboard"));
    }
    return NextResponse.next();
  }

  if (pathname === "/auth/sign-up") {
    if (isAuthenticated) {
      return NextResponse.redirect(buildProductUrl("/app/dashboard"));
    }
    return NextResponse.next();
  }

  if (authRoutes.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(buildProductUrl("/app/dashboard"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/sign-in", "/auth/sign-up"],
};
