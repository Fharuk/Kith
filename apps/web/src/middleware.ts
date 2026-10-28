import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { evaluate, policyFor } from "@/lib/rate-limit";

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

/**
 * Endpoints that authenticate by signature/secret rather than by session, and therefore must
 * never be dropped by a per-caller budget: Paystack retries deliveries, and the worker pass
 * has to run every minute.
 */
const UNTHROTTLED = ["/api/webhooks/", "/api/cron/"];

function clientKey(req: { headers: Headers; ip?: string }, userId?: string) {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.ip || req.headers.get("x-real-ip") || "anonymous";
  return `ip:${ip}`;
}

export default auth((req) => {
  const path = req.nextUrl.pathname;

  /* Global API budget (100 / 15 min, tighter where it matters). Never for signature-authed paths. */
  if (path.startsWith("/api/") && !UNTHROTTLED.some((p) => path.startsWith(p))) {
    const policy = policyFor(path);
    const decision = evaluate(clientKey(req, req.auth?.user?.id), policy);
    if (!decision.allowed) {
      return NextResponse.json(
        { ok: false, code: "rate_limited", message: "Too many requests. Please slow down.", retryAfter: decision.retryAfterSeconds },
        {
          status: 429,
          headers: {
            "Retry-After": String(decision.retryAfterSeconds),
            "RateLimit-Limit": String(decision.limit),
            "RateLimit-Remaining": "0",
            "RateLimit-Reset": String(decision.retryAfterSeconds),
          },
        },
      );
    }
  }
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
  matcher: [
    "/dashboard/:path*", "/verify/:path*", "/passes/:path*", "/landlord/:path*", "/porter/:path*", "/admin/:path*",
    "/api/:path*",
  ],
};
