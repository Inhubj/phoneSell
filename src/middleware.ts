import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "royal-mobile-tech-dev-secret-change-in-production",
);

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/uploads")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (!req.cookies.get("rmt_vid")?.value) {
    const vid = crypto.randomUUID();
    response.cookies.set("rmt_vid", vid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const adminToken = req.cookies.get("rmt_session")?.value;
  const customerToken = req.cookies.get("rmt_customer")?.value;

  const needAdmin =
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/forgot-password";
  const needExec =
    pathname.startsWith("/executive") &&
    pathname !== "/executive/login" &&
    pathname !== "/executive/forgot-password";
  const needCustomer = pathname.startsWith("/account");

  if (needAdmin || needExec) {
    if (!adminToken) {
      const url = req.nextUrl.clone();
      url.pathname = needAdmin ? "/admin/login" : "/executive/login";
      return NextResponse.redirect(url);
    }
    try {
      const { payload } = await jwtVerify(adminToken, secret);
      if (needAdmin && payload.kind !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      if (needExec && payload.kind !== "executive" && payload.kind !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/executive/login";
        return NextResponse.redirect(url);
      }
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = needAdmin ? "/admin/login" : "/executive/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (needCustomer) {
    if (!customerToken) {
      const url = req.nextUrl.clone();
      const dest = `${pathname}${req.nextUrl.search}`;
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", dest.startsWith("/") ? dest : "/sell");
      return NextResponse.redirect(url);
    }
    try {
      const { payload } = await jwtVerify(customerToken, secret);
      if (payload.kind !== "customer") throw new Error("not customer");
    } catch {
      const url = req.nextUrl.clone();
      const dest = `${pathname}${req.nextUrl.search}`;
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", dest.startsWith("/") ? dest : "/sell");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|opengraph-image).*)"],
};
