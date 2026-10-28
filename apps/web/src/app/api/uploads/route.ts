import { auth } from "@/auth";
import { storeImage, UploadError, type MediaOwner, type Visibility } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Which contexts a signed-in user may upload into, and how the result is exposed. */
const ALLOWED: Record<string, { visibility: Visibility; roles: string[] }> = {
  property: { visibility: "public", roles: ["landlord", "admin"] },
  room: { visibility: "public", roles: ["landlord", "admin"] },
  inspection: { visibility: "public", roles: ["porter", "admin"] },
  maintenance: { visibility: "private", roles: ["student", "landlord", "porter", "admin"] },
  dispute: { visibility: "private", roles: ["student", "landlord", "admin"] },
  verification: { visibility: "private", roles: ["student", "landlord", "porter"] },
};

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return Response.json({ ok: false, error: "Sign in to upload" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Expected a multipart upload" }, { status: 400 });
  }

  const context = String(form.get("context") ?? "property");
  const policy = ALLOWED[context];
  if (!policy) return Response.json({ ok: false, error: "Unknown upload context" }, { status: 400 });
  if (!policy.roles.includes(user.role ?? "")) {
    return Response.json({ ok: false, error: "Your account cannot upload here" }, { status: 403 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ ok: false, error: "No file in the request" }, { status: 400 });

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const stored = await storeImage({
      bytes,
      userId: user.id,
      ownerType: context as MediaOwner,
      // Re-parented later (attachMedia) once the record exists; until then the uploader owns it.
      ownerId: user.id,
      visibility: policy.visibility,
      alt: typeof form.get("alt") === "string" ? String(form.get("alt")) : undefined,
    });
    return Response.json({ ok: true, media: stored });
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ ok: false, error: e.message }, { status: e.status });
    console.error("[uploads] failed", e);
    return Response.json({ ok: false, error: "Upload failed — try a smaller image" }, { status: 500 });
  }
}
