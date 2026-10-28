import { auth } from "@/auth";
import { loadMediaForViewer, readImageFile, UploadError } from "@/lib/media";

export const runtime = "nodejs";

/**
 * The only way bytes leave storage. Public listing photography is cacheable and immutable;
 * private evidence (dispute photos, maintenance shots, KYC) is gated to the uploader and ops,
 * and is never stored in a public cache.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const session = await auth();
  const viewer = session?.user?.id ? { id: session.user.id, role: session.user.role ?? "student" } : null;
  const access = await loadMediaForViewer(id, viewer);
  if (!access.ok) {
    return new Response(access.status === 404 ? "Not found" : "Not allowed", { status: access.status });
  }
  if (!access.row.storageKey) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readImageFile(access.row.storageKey);
    const isPublic = access.row.visibility === "public";
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": access.row.mimeType ?? "image/webp",
        "Content-Length": String(bytes.length),
        "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (e) {
    if (e instanceof UploadError) return new Response("Not found", { status: 404 });
    console.error("[media] read failed", e);
    return new Response("Not found", { status: 404 });
  }
}
