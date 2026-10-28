import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { getDb, rooms, properties } from "@kith/database";

// Listings change; a build-time snapshot would go stale. Hourly ISR keeps crawlers honest.
export const revalidate = 3600;

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Public surface only: consoles, checkout and admin are deliberately absent. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/rooms`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/landlords`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/auctions/demo`, changeFrequency: "hourly", priority: 0.5 },
    { url: `${BASE}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const db = getDb();
    const rows = await db
      .select({ id: rooms.id, createdAt: rooms.createdAt })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(rooms.isAvailable, true))
      .limit(500);
    return [
      ...staticRoutes,
      ...rows.map((r) => ({
        url: `${BASE}/rooms/${r.id}`,
        lastModified: r.createdAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // A sitemap must never 500 the build; the static surface is still useful.
    return staticRoutes;
  }
}
