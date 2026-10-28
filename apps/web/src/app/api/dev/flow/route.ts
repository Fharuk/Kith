import { and, eq } from "drizzle-orm";
import { getDb, media, properties, rooms } from "@kith/database";
import { createListing } from "@/app/actions/listing-actions";
import { verifyTaskAction } from "@/app/actions/porter-task-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DEV/TEST ONLY — drives server actions over HTTP so the listing→porter→verified pipeline
 * can be exercised without a browser. Uses the same session cookie, the same actions and the
 * same validation as the UI; it is not a second code path. Hidden in production.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "not available" }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;

  if (body.op === "create-listing") {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ ...body, op: "" })) if (k !== "op" && k !== "testTaskId") fd.append(k, v);
    return Response.json(await createListing(null, fd));
  }

  if (body.op === "sync-media") {
    // Give every property the exterior/room/shared-space gallery it should have been seeded with.
    const db = getDb();
    const all = await db.select().from(properties);
    const roomRows = await db.select().from(rooms);
    const gallery = ["/img/courtyard.webp", "/img/bedroom.webp", "/img/lounge.webp"];
    let added = 0;
    for (const property of all) {
      const existing = await db.select().from(media).where(and(eq(media.ownerType, "property"), eq(media.ownerId, property.id)));
      if (existing.length > 1) continue;
      for (const [i, url] of gallery.entries()) {
        if (existing.some((m) => m.url === url)) continue;
        await db.insert(media).values({ ownerType: "property", ownerId: property.id, url, alt: `${property.title} gallery ${i + 1}`, format: "webp", sort: existing.length + i });
        added++;
      }
    }
    for (const room of roomRows) {
      const existing = await db.select().from(media).where(and(eq(media.ownerType, "room"), eq(media.ownerId, room.id)));
      if (existing.length > 0) continue;
      await db.insert(media).values({ ownerType: "room", ownerId: room.id, url: "/img/bedroom.webp", alt: `Room ${room.roomNumber}`, format: "webp", sort: 0 });
      added++;
    }
    return Response.json({ ok: true, added });
  }

  if (body.op === "porter-verify") {
    const fd = new FormData();
    fd.append("taskId", body.taskId ?? "");
    fd.append("outcome", body.outcome ?? "verified");
    fd.append("notes", body.notes ?? "Dev harness verification");
    return Response.json(await verifyTaskAction(null, fd));
  }

  return Response.json({ ok: false, error: "unknown op" }, { status: 400 });
}
