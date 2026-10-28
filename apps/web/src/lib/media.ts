import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { and, eq, inArray } from "drizzle-orm";
import { getDb, media, users } from "@kith/database";

/**
 * IMAGE UPLOADS.
 *
 * Three rules, in order, and none of them are negotiable because users upload camera photos
 * that carry GPS coordinates:
 *
 *  1. **Never trust the client's Content-Type.** The first bytes decide what a file is. A .php
 *     renamed to .jpg is rejected here, before anything touches disk.
 *  2. **Re-encode, never copy.** Decoding to raw pixels and writing fresh WebP is what removes
 *     EXIF (including the GPS tag that tells the world where a student sleeps), ICC payloads
 *     and anything steganographic. Orientation is applied *before* the tag is discarded.
 *  3. **Private by default for evidence.** Listing photography is public; KYC documents,
 *     dispute evidence and maintenance photos are private and served only to the owner and ops.
 *
 * Storage is a port: the local filesystem in development, object storage in production
 * (UPLOAD_DIR → a mounted volume, or swap `putObject` for S3/Blob). The database only ever
 * holds an opaque storage key, so the URL a client sees can change without touching rows.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export type Visibility = "public" | "private";
export type MediaOwner = "property" | "room" | "inspection" | "maintenance" | "dispute" | "verification";

export class UploadError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "UploadError";
  }
}

/** Magic-number sniffing. Pure, so the rule that rejects a disguised file is unit-tested. */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a) return "image/png";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  return null;
}

export function uploadDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), ".uploads");
}

export function filePathFor(storageKey: string) {
  // storageKey is server-generated (`owner/ownerId/uuid.webp`); reject anything with traversal
  // characters anyway, because a corrupt row must not become a directory escape.
  if (!/^[a-z]+\/[A-Za-z0-9-]+\/[0-9a-f-]+\.webp$/.test(storageKey) || storageKey.includes("..")) {
    throw new UploadError("Invalid storage key", 500);
  }
  return path.join(uploadDir(), storageKey);
}

export interface StoredImage {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
}

export async function storeImage(input: {
  bytes: Buffer;
  userId: string;
  ownerType: MediaOwner;
  /** for attachments that do not exist yet (an inspection report before it is saved), pass the uploader's id */
  ownerId: string;
  visibility?: Visibility;
  alt?: string;
}): Promise<StoredImage> {
  if (!input.bytes.length) throw new UploadError("That file was empty");
  if (input.bytes.length > MAX_UPLOAD_BYTES) {
    throw new UploadError(`Images must be under ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`, 413);
  }
  const sniffed = sniffImageMime(input.bytes);
  if (!sniffed) throw new UploadError("That file is not a JPEG, PNG or WebP image");

  const image = sharp(input.bytes, { limitInputPixels: 40_000_000, failOn: "error" });
  // `.rotate()` with no argument bakes in the EXIF orientation, then the re-encode drops the tag.
  const normalised = image.rotate();
  const out = await normalised
    .clone()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const blur = await normalised.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();

  const id = randomUUID();
  const storageKey = `${input.ownerType}/${input.ownerId}/${id}.webp`;
  const dest = filePathFor(storageKey);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, out.data, { mode: 0o600 });

  const [row] = await getDb()
    .insert(media)
    .values({
      id,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      url: `/api/media/${id}`,
      format: "webp",
      width: out.info.width,
      height: out.info.height,
      alt: input.alt?.slice(0, 200) ?? null,
      storageKey,
      mimeType: "image/webp",
      sizeBytes: out.data.length,
      checksum: createHash("sha256").update(out.data).digest("hex"),
      blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
      visibility: input.visibility ?? "public",
      uploadedBy: input.userId,
    })
    .returning();

  return {
    id: row!.id,
    url: row!.url,
    width: row!.width,
    height: row!.height,
    blurDataUrl: row!.blurDataUrl,
  };
}

/**
 * Move temporary uploads onto the record they belong to. Only the uploader can re-parent a
 * file, so one account cannot claim another's photo by guessing a UUID.
 */
export async function attachMedia(input: {
  mediaIds: string[];
  userId: string;
  ownerType: MediaOwner;
  ownerId: string;
  visibility?: Visibility;
}) {
  const ids = input.mediaIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 12);
  if (ids.length === 0) return [];
  const db = getDb();
  await db
    .update(media)
    .set({ ownerType: input.ownerType, ownerId: input.ownerId, visibility: input.visibility ?? "public" })
    .where(and(inArray(media.id, ids), eq(media.uploadedBy, input.userId)));
  return ids;
}

export async function readImageFile(storageKey: string): Promise<Buffer> {
  return readFile(filePathFor(storageKey));
}

/** Public photos are cacheable forever; evidence is not cacheable at all. */
export async function loadMediaForViewer(id: string, viewer: { id: string; role: string } | null) {
  const db = getDb();
  const rows = await db
    .select({ media, uploaderRole: users.role })
    .from(media)
    .leftJoin(users, eq(media.uploadedBy, users.id))
    .where(eq(media.id, id));
  const row = rows[0];
  if (!row) return { ok: false as const, status: 404 };
  if (row.media.visibility === "public") return { ok: true as const, row: row.media };
  if (!viewer) return { ok: false as const, status: 401 };
  const canSee = row.media.uploadedBy === viewer.id || viewer.role === "admin" || viewer.role === "porter";
  return canSee ? ({ ok: true as const, row: row.media }) : { ok: false as const, status: 403 };
}
