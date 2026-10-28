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

  if (body.op === "porter-verify") {
    const fd = new FormData();
    fd.append("taskId", body.taskId ?? "");
    fd.append("outcome", body.outcome ?? "verified");
    fd.append("notes", body.notes ?? "Dev harness verification");
    return Response.json(await verifyTaskAction(null, fd));
  }

  return Response.json({ ok: false, error: "unknown op" }, { status: 400 });
}
