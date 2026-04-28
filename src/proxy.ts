import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ROUTES } from "@/lib/constants/routes.constant";
import { USER_ROLE } from "@/lib/constants/user.constant";

const getRoleFromToken = (token?: string) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    const parsed = JSON.parse(decoded) as { role?: string };
    return parsed.role ?? null;
  } catch {
    return null;
  }
};

const isAuthRoute = (pathname: string) =>
  pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;

const isProtectedRoute = (pathname: string) =>
  pathname.startsWith(ROUTES.PROFILE) ||
  pathname.startsWith(ROUTES.OWNER) ||
  pathname.startsWith(ROUTES.ADMIN);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const role = getRoleFromToken(accessToken);

  if (isAuthRoute(pathname) && accessToken) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (isProtectedRoute(pathname) && !accessToken) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(ROUTES.ADMIN) && role !== USER_ROLE.ADMIN) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (
    pathname.startsWith(ROUTES.OWNER) &&
    role !== USER_ROLE.OWNER &&
    role !== USER_ROLE.ADMIN
  ) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
