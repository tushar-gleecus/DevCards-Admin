import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ✅ Always redirect `/` to login
  if (path === "/") {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/v1/login";
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Always allow access to login and static files
  if (
    path.startsWith("/auth/v1/login") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 🔐 Redirect if accessing dashboard without token
  const token = req.cookies.get("access_token")?.value;
  if (!token && path.startsWith("/dashboard")) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/v1/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
