import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authRoutes = new Set(["/auth/sign-in", "/auth/sign-up"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });
  const isAuthenticated = Boolean(token);

  if (pathname.startsWith("/app") && !isAuthenticated) {
    const loginUrl = new URL("/auth/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authRoutes.has(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/sign-in", "/auth/sign-up"],
};
