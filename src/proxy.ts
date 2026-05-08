import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/setup",
  "/api/auth",
  "/api/webhooks",
  "/api/setup",
  "/invoices",
];

const API_PREFIX = "/api/";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isSelfHosted(): boolean {
  return process.env.DEPLOYMENT_MODE !== "managed";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith(API_PREFIX)) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (!isSelfHosted() && !req.auth?.user?.activeOrganizationId) {
      return NextResponse.json(
        { error: "No active organization" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
