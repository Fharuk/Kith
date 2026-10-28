import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private consoles, payment plumbing and identity flows are not for crawlers.
        disallow: ["/dashboard", "/admin", "/porter", "/landlord", "/verify", "/passes", "/api/", "/checkout/", "/verify-email"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
