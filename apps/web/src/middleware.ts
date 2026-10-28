import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Middleware runs on the Node runtime: the guard resolves sessions against the DB-backed config. */
export const runtime = "nodejs";

/** Route → allowed roles. Anything else is public. */
const ROLE_GUARDS: Record<string, string[]> = {
  "/dashboard": ["student"],
  "/verify": ["student"],
  "/passes": ["student"],
  "/landlord": ["landlord"],
  "/porter": ["porter"],
  "/admin": ["admin"],
};

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const guard = Object.entries(ROLE_GUARDS).find(([p]) => path === p || path.startsWith(`${p}/`));
  if (!guard) return NextResponse.next();
  const [prefix, roles] = guard;
  void prefix;
  const user = req.auth?.user;
  if (!user?.id) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }
  if (!roles.includes(user.role ?? "")) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(user.role ?? "");
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export function roleHome(role: string) {
  switch (role) {
    case "student": return "/dashboard";
    case "landlord": return "/landlord";
    case "porter": return "/porter";
    case "admin": return "/admin";
    default: return "/";
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/verify/:path*", "/passes/:path*", "/landlord/:path*", "/porter/:path*", "/admin/:path*"],
};
