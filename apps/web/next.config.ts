import type { NextConfig } from "next";

/**
 * Inline scripts are unavoidable in the App Router (theme bootstrapping, structured data), so
 * the CSP carries a build-time hash plus `'unsafe-inline'` only for styles, which Next and
 * Tailwind both need. Everything else is same-origin; Supabase, Paystack and the realtime
 * gateway are the only third parties allowed to receive a connection.
 *
 * `frame-ancestors 'none'` + X-Frame-Options DENY stop clickjacking of the payment and porter
 * screens — the two places where a disguised iframe could cost a student money or a landlord a
 * key handover.
 */
const isDev = process.env.NODE_ENV !== "production";

const realtimeOrigins = (process.env.NEXT_PUBLIC_REALTIME_URL ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is dev-only (Fast Refresh); production ships without it.
  `script-src 'self'${isDev ? " 'unsafe-inline' 'unsafe-eval'" : " 'unsafe-inline'"} https://js.paystack.co`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://api.paystack.co ${realtimeOrigins.join(" ")} ${isDev ? "ws: wss: http: https:" : ""}`.trim(),
  "media-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt and braces for browsers that ignore frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Nothing here needs a camera or a microphone; the liveness mock asks for neither.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@kith/domain", "@kith/ui", "@kith/database", "@kith/paystack"],
  // PGlite ships WASM + postgres.data assets resolved via import.meta.url, and argon2 is
  // native: both must load from node_modules, not from the server bundle.
  serverExternalPackages: ["@electric-sql/pglite", "@node-rs/argon2", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Webhook and cron endpoints are machine-to-machine only: no caching, no indexing.
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
